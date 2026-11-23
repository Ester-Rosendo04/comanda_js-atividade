/* Mesas e comandas individuais com persistência. */
import { atualizarMesa, listarMesas, criarMesa, obterMesa, excluirMesa, listarProdutosMesa } from "../api/mesas.js";
import { adicionarProdutoMesa, listarProdutos, obterProduto, removerProdutoMesa } from "../api/produtos.js";

async function carregarMesas() {
	try {
		const dados = await listarMesas();
		const lista = await Promise.all(
			dados.map(
				async (m) => {
					const itens = await listarProdutosMesa(m.id)
					return new Mesa(m.id, m.numero, m.localizacao, m.reservada, itens);
				}
			)
		)
		return lista;
	} catch (erro) { console.error('Não foi possível carregar as mesas:', erro); return []; }
}
async function carregarProdutosParaComanda() {
	const produtosJson = await listarProdutos();
	const produtos = produtosJson.map(p => new Produto(p.id, p.nome, p.descricao, p.preco, p.disponivel));
	try {
		return produtos.filter(p => p.disponivel);
	}
	catch {
		return [];
	}
}

let idEmEdicao = null;
const form = document.getElementById('form-mesa');
const campoNumero = document.getElementById('numero');
const campoLocalizacao = document.getElementById('localizacao');
const campoReservada = document.getElementById('reservada');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloForm = document.getElementById('titulo-form');
const listaMesas = document.getElementById('lista-mesas');
const dinheiro = valor => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function renderizar() {
	const mesas = await carregarMesas();
	listaMesas.innerHTML = '';
	if (!mesas.length) {
		const p = document.createElement('p'); p.className = 'vazio'; p.textContent = 'Nenhuma mesa cadastrada.';
		listaMesas.append(p);
		return;
	}
	[...mesas].sort((a, b) => a.numero - b.numero).forEach(async mesa => {
		const item = document.createElement('article'); item.className = 'item item-mesa';
		const info = document.createElement('div'); info.className = 'item-info';
		const titulo = document.createElement('h3'); titulo.textContent = 'Mesa ' + mesa.numero;
		const local = document.createElement('p'); local.className = 'descricao'; local.textContent = mesa.localizacao;
		info.append(titulo, local);
		const acoes = document.createElement('div'); acoes.className = 'item-acoes';
		const btnReserva = document.createElement('button'); btnReserva.type = 'button'; btnReserva.className = 'badge ' + (mesa.reservada ? 'reservada' : 'livre');
		btnReserva.textContent = mesa.situacaoFormatada;
		btnReserva.addEventListener('click', async () => {
			mesa.alternarReserva();
			await atualizarMesa(mesa.id, mesa.toJSON());
			renderizar();
		});
		const btnEditar = document.createElement('button');
		btnEditar.type = 'button';
		btnEditar.className = 'btn-editar';
		btnEditar.textContent = 'Alterar';
		btnEditar.addEventListener('click', () => iniciarEdicao(mesa.id));
		const btnExcluir = document.createElement('button');
		btnExcluir.type = 'button';
		btnExcluir.className = 'btn-excluir';
		btnExcluir.textContent = 'X';
		btnExcluir.addEventListener('click', () => excluir(mesa.id));
		acoes.append(btnReserva, btnEditar, btnExcluir);
		item.append(info, acoes);

		const secaoComanda = document.createElement('section'); secaoComanda.className = 'comanda-mesa';
		const tituloComanda = document.createElement('h4'); tituloComanda.textContent = 'Comanda da mesa'; secaoComanda.append(tituloComanda);
		const formItem = document.createElement('form'); formItem.className = 'form-comanda-mesa';
		const seletor = document.createElement('select');
		seletor.setAttribute('aria-label', 'Produto para adicionar à comanda');
		const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Selecione um produto disponível'; seletor.append(placeholder);
		const produtos = await carregarProdutosParaComanda();
		produtos.forEach(p => {
			const opt = document.createElement('option');
			opt.value = String(p.id);
			opt.textContent = `${p.nome} — ${dinheiro(p.preco)}`;
			seletor.append(opt);
		});
		const adicionar = document.createElement('button');
		adicionar.type = 'submit';
		adicionar.textContent = 'Adicionar à comanda';
		adicionar.className = 'btn-primario';
		formItem.append(seletor, adicionar);
		const mensagem = document.createElement('p');
		mensagem.className = 'mensagem-comanda';
		mensagem.setAttribute('aria-live', 'polite');
		formItem.addEventListener('submit', async evento => {
			evento.preventDefault();
			const idProduto = seletor.value;
			const { nome, descricao, preco, disponivel } = await obterProduto(idProduto);
			const produto = new Produto(idProduto, nome, descricao, preco, disponivel);
			if (!produto) {
				mensagem.textContent = 'Selecione um produto cadastrado.';
				mensagem.className = 'mensagem-comanda erro';
				return;
			}
			try {
				mesa.adicionarProduto(produto);
				adicionarProdutoMesa(idProduto, mesa.id)
				renderizar();
			}
			catch (erro) { mensagem.textContent = erro.message; mensagem.className = 'mensagem-comanda erro'; }
		});
		secaoComanda.append(formItem, mensagem);
		const listaItens = document.createElement('div'); listaItens.className = 'itens-comanda';
		const itens = await listarProdutosMesa(mesa.id);
		if (!itens.length) {
			const vazio = document.createElement('p');
			vazio.className = 'vazio';
			vazio.textContent = 'Nenhum item na comanda.';
			listaItens.append(vazio);
		}
		itens.forEach(async ({id}, indice) => {
			const linha = await obterProduto(id);
			const linhaDOM = document.createElement('div'); linhaDOM.className = 'linha-comanda';
			const nome = document.createElement('span'); nome.textContent = `${linha.nome} — ${dinheiro(linha.preco)}`;
			const remover = document.createElement('button'); remover.type = 'button'; remover.className = 'btn-secundario'; remover.textContent = 'Remover';
			remover.addEventListener('click', async () => {
				removerProdutoMesa(linha.id, mesa.id);
				mesa.removerItem(indice);
				renderizar();
			});
			linhaDOM.append(nome, remover); listaItens.append(linhaDOM);
		});
		const total = document.createElement('p'); total.className = 'preco'; total.textContent = 'Total: ' + dinheiro(mesa.totalComanda);
		secaoComanda.append(listaItens, total); item.append(secaoComanda); listaMesas.append(item);
	});
}
async function iniciarEdicao(id) {
	const { numero, localizacao, reservada } = await obterMesa(id);
	const itens = listarProdutosMesa(id);
	idEmEdicao = id;
	const mesa = new Mesa(id, numero, localizacao, reservada, itens)
	campoNumero.value = mesa.numero;
	campoNumero.disabled = true;
	campoLocalizacao.value = mesa.localizacao;
	campoReservada.value = String(mesa.reservada);
	tituloForm.textContent = 'Alterar Mesa ' + mesa.numero; btnSalvar.textContent = 'Salvar'; btnCancelar.hidden = false;
	form.scrollIntoView({ behavior: 'smooth', block: 'start' }); campoLocalizacao.focus();
}

function finalizarEdicao() { idEmEdicao = null; campoNumero.disabled = false; form.reset(); tituloForm.textContent = 'Adicionar Mesa +'; btnSalvar.textContent = 'Cadastrar'; btnCancelar.hidden = true; }
async function excluir(id) {
	await excluirMesa(id);
	renderizar();
}
form.addEventListener('submit', async evento => {
	evento.preventDefault();
	const mesas = await carregarMesas();
	const numero = Number.parseInt(campoNumero.value, 10), localizacao = campoLocalizacao.value.trim(), reservada = campoReservada.value === 'true';
	if (!Number.isInteger(numero) || numero < 1 || !localizacao) {
		alert('Informe um número válido e a localização da mesa.');
		return;
	}
	if (idEmEdicao === null) {
		if (mesas.some(m => m.numero === numero)) {
			alert('Já existe uma mesa com esse número.');
			return;
		}
		const dados = { "numero": numero, "localizacao": localizacao, "reservada": reservada };
		await criarMesa(dados);
		form.reset();
		campoNumero.focus();
	} else {
		const mesa = mesas.find(m => m.id === idEmEdicao);
		if (mesa) {
			mesa.atualizarLocalizacao(localizacao);
			mesa.atualizarReserva(reservada);
			await atualizarMesa(mesa.id, mesa.toJSON());
		}
		finalizarEdicao();
	}
	renderizar();
});
btnCancelar.addEventListener('click', () => { finalizarEdicao(); renderizar(); });
renderizar();
