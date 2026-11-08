/* Cadastro, bloqueio e persistência dos produtos. */
import { listarProdutos, criarProduto, atualizarProduto, obterProduto, excluirProduto } from "../api/produtos.js";

async function carregarProdutos() {
  try {
    const dados = await listarProdutos();
    const lista = dados.map(p => new Produto(p.id, p.nome, p.descricao, p.preco, p.disponivel));
    return lista;
  } catch (erro) { console.error('Não foi possível carregar os produtos:', erro); return []; }
}

let idEmEdicao = null;
const form = document.getElementById('form-produto');
const campoNome = document.getElementById('nome');
const campoDescricao = document.getElementById('descricao');
const campoPreco = document.getElementById('preco');
const campoDisponivel = document.getElementById('disponivel');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloForm = document.getElementById('titulo-form');
const listaProdutos = document.getElementById('lista-produtos');

async function renderizar() {
  const produtos = await carregarProdutos();
  listaProdutos.innerHTML = '';
  if (!produtos.length) {
    const vazio = document.createElement('p'); vazio.className = 'vazio';
    vazio.textContent = 'Nenhum produto cadastrado.'; listaProdutos.append(vazio); return;
  }
  produtos.forEach(produto => {
    const info = document.createElement('div');
    info.className = 'item-info';
    const titulo = document.createElement('h3');
    titulo.textContent = produto.nome;
    const descricao = document.createElement('p');
    descricao.className = 'descricao';
    descricao.textContent = produto.descricao;
    const preco = document.createElement('p');
    preco.className = 'preco';
    preco.textContent = produto.precoFormatado;
    const status = document.createElement('p');
    status.className = 'descricao';
    status.textContent = produto.disponivel ? 'Situação: DISPONÍVEL para novas comandas' : 'Situação: BLOQUEADO para novas comandas';
    info.append(titulo, descricao, preco, status);
    const acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    const btnBloquear = document.createElement('button');
    btnBloquear.type = 'button';
    btnBloquear.className = 'badge ' + (produto.disponivel ? 'disponivel' : 'indisponivel');
    btnBloquear.textContent = produto.disponivel ? 'Bloquear produto' : 'Desbloquear produto';
    btnBloquear.addEventListener('click', async () => { 
      produto.alternarDisponibilidade();
      await atualizarProduto(produto.id, produto.toJSON());
      renderizar(); 
    });
    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Alterar';
    btnEditar.addEventListener('click', () => iniciarEdicao(produto.id));
    const btnExcluir = document.createElement('button');
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.textContent = 'X';
    btnExcluir.addEventListener('click', () => excluir(produto.id));
    acoes.append(btnBloquear, btnEditar, btnExcluir);
    const item = document.createElement('article');
    item.className = 'item';
    item.append(info, acoes);
    listaProdutos.append(item);
  });
}
async function iniciarEdicao(id) {
  const { nome, descricao, preco, disponivel } = await obterProduto(id);
  const produto = new Produto(id, nome, descricao, preco, disponivel);
  idEmEdicao = id;
  campoNome.value = produto.nome;
  campoDescricao.value = produto.descricao;
  campoPreco.value = produto.preco;
  campoDisponivel.value = String(produto.disponivel);
  tituloForm.textContent = 'Alterar Produto';
  btnSalvar.textContent = 'Salvar';
  btnCancelar.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  campoNome.focus();
}
function finalizarEdicao() {
  idEmEdicao = null; form.reset(); tituloForm.textContent = 'Adicionar Produto +';
  btnSalvar.textContent = 'Cadastrar'; btnCancelar.hidden = true;
}
async function excluir(id) {
    await excluirProduto(id);
    renderizar();
}
form.addEventListener('submit', async evento => {
  evento.preventDefault();
  const nome = campoNome.value.trim(), descricao = campoDescricao.value.trim(), preco = Number(campoPreco.value);
  const disponivel = campoDisponivel.value === 'true';
  if (!nome || !descricao || !Number.isFinite(preco) || preco < 0) {
    alert('Informe nome, descrição e um preço válido.'); 
    return; 
  }
  if (idEmEdicao === null) {
    const dados = {"nome": nome, "descricao": descricao, "preco": preco, "disponivel": disponivel};
    await criarProduto(dados);
    form.reset();
    campoNome.focus();
  } else {
    const dados = { "id": idEmEdicao, "nome": nome, "descricao": descricao, "preco": preco, "disponivel": disponivel };
    await atualizarProduto(idEmEdicao, dados);
    finalizarEdicao();
  }
  renderizar();
});
btnCancelar.addEventListener('click', () => { finalizarEdicao(); renderizar(); });
renderizar();