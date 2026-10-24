/* Mesas e comandas individuais com persistência. */
const CHAVE_MESAS = 'saborOrla_mesas';
const CHAVE_PRODUTOS_MESA = 'saborOrla_produtos';
function carregarMesas() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_MESAS) || '[]');
    const lista = dados.map(m => new Mesa(m.numero, m.localizacao, m.reservada, m.itens || [], m.id));
    Mesa.proximoId = Math.max(1, ...lista.map(m => m.id + 1)); return lista;
  } catch (erro) { console.error('Não foi possível carregar as mesas:', erro); return []; }
}
function salvarMesas() { localStorage.setItem(CHAVE_MESAS, JSON.stringify(mesas)); }
function carregarProdutosParaComanda() {
  try { return JSON.parse(localStorage.getItem(CHAVE_PRODUTOS_MESA) || '[]').map(p => new Produto(p.nome, p.descricao, p.preco, p.disponivel !== false, p.id)); }
  catch { return []; }
}
const mesas = carregarMesas();
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

function renderizar() {
  listaMesas.innerHTML = '';
  if (!mesas.length) { const p = document.createElement('p'); p.className = 'vazio'; p.textContent = 'Nenhuma mesa cadastrada.'; listaMesas.append(p); return; }
  [...mesas].sort((a,b) => a.numero-b.numero).forEach(mesa => {
    const item = document.createElement('article'); item.className = 'item item-mesa';
    const info = document.createElement('div'); info.className = 'item-info';
    const titulo = document.createElement('h3'); titulo.textContent = 'Mesa ' + mesa.numero;
    const local = document.createElement('p'); local.className = 'descricao'; local.textContent = mesa.localizacao;
    info.append(titulo, local);
    const acoes = document.createElement('div'); acoes.className = 'item-acoes';
    const btnReserva = document.createElement('button'); btnReserva.type = 'button'; btnReserva.className = 'badge ' + (mesa.reservada ? 'reservada' : 'livre');
    btnReserva.textContent = mesa.situacaoFormatada; btnReserva.addEventListener('click', () => { mesa.alternarReserva(); salvarMesas(); renderizar(); });
    const btnEditar = document.createElement('button'); btnEditar.type = 'button'; btnEditar.className = 'btn-editar'; btnEditar.textContent = 'Alterar'; btnEditar.addEventListener('click', () => iniciarEdicao(mesa.id));
    acoes.append(btnReserva, btnEditar); item.append(info, acoes);

    const secaoComanda = document.createElement('section'); secaoComanda.className = 'comanda-mesa';
    const tituloComanda = document.createElement('h4'); tituloComanda.textContent = 'Comanda da mesa'; secaoComanda.append(tituloComanda);
    const formItem = document.createElement('form'); formItem.className = 'form-comanda-mesa';
    const seletor = document.createElement('select'); seletor.setAttribute('aria-label', 'Produto para adicionar à comanda');
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Selecione um produto disponível'; seletor.append(placeholder);
    const produtos = carregarProdutosParaComanda();
    produtos.filter(p => p.disponivel).forEach(p => { const opt = document.createElement('option'); opt.value = String(p.id); opt.textContent = `${p.nome} — ${dinheiro(p.preco)}`; seletor.append(opt); });
    const adicionar = document.createElement('button'); adicionar.type = 'submit'; adicionar.textContent = 'Adicionar à comanda'; adicionar.className = 'btn-primario';
    formItem.append(seletor, adicionar);
    const mensagem = document.createElement('p'); mensagem.className = 'mensagem-comanda'; mensagem.setAttribute('aria-live', 'polite');
    formItem.addEventListener('submit', evento => {
      evento.preventDefault(); const idProduto = Number(seletor.value);
      const produto = carregarProdutosParaComanda().find(p => p.id === idProduto);
      if (!produto) { mensagem.textContent = 'Selecione um produto cadastrado.'; mensagem.className = 'mensagem-comanda erro'; return; }
      try { mesa.adicionarProduto(produto); salvarMesas(); renderizar(); }
      catch (erro) { mensagem.textContent = erro.message; mensagem.className = 'mensagem-comanda erro'; }
    });
    secaoComanda.append(formItem, mensagem);
    const listaItens = document.createElement('div'); listaItens.className = 'itens-comanda';
    if (!mesa.itens.length) { const vazio = document.createElement('p'); vazio.className = 'vazio'; vazio.textContent = 'Nenhum item na comanda.'; listaItens.append(vazio); }
    mesa.itens.forEach((linha, indice) => {
      const linhaDOM = document.createElement('div'); linhaDOM.className = 'linha-comanda';
      const nome = document.createElement('span'); nome.textContent = `${linha.nome} — ${dinheiro(linha.preco)}`;
      const remover = document.createElement('button'); remover.type = 'button'; remover.className = 'btn-secundario'; remover.textContent = 'Remover';
      remover.addEventListener('click', () => { mesa.removerItem(indice); salvarMesas(); renderizar(); });
      linhaDOM.append(nome, remover); listaItens.append(linhaDOM);
    });
    const total = document.createElement('p'); total.className = 'preco'; total.textContent = 'Total: ' + dinheiro(mesa.totalComanda);
    secaoComanda.append(listaItens, total); item.append(secaoComanda); listaMesas.append(item);
  });
}
function iniciarEdicao(id) {
  const mesa = mesas.find(m => m.id === id); if (!mesa) return;
  idEmEdicao = id; campoNumero.value = mesa.numero; campoNumero.disabled = true;
  campoLocalizacao.value = mesa.localizacao; campoReservada.value = String(mesa.reservada);
  tituloForm.textContent = 'Alterar Mesa ' + mesa.numero; btnSalvar.textContent = 'Salvar'; btnCancelar.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' }); campoLocalizacao.focus();
}
function finalizarEdicao() { idEmEdicao = null; campoNumero.disabled = false; form.reset(); tituloForm.textContent = 'Adicionar Mesa +'; btnSalvar.textContent = 'Cadastrar'; btnCancelar.hidden = true; }
form.addEventListener('submit', evento => {
  evento.preventDefault(); const numero = Number.parseInt(campoNumero.value, 10), localizacao = campoLocalizacao.value.trim(), reservada = campoReservada.value === 'true';
  if (!Number.isInteger(numero) || numero < 1 || !localizacao) { alert('Informe um número válido e a localização da mesa.'); return; }
  if (idEmEdicao === null) {
    if (mesas.some(m => m.numero === numero)) { alert('Já existe uma mesa com esse número.'); return; }
    mesas.push(new Mesa(numero, localizacao, reservada)); form.reset(); campoNumero.focus();
  } else { const mesa = mesas.find(m => m.id === idEmEdicao); if (mesa) { mesa.atualizarLocalizacao(localizacao); mesa.atualizarReserva(reservada); } finalizarEdicao(); }
  salvarMesas(); renderizar();
});
btnCancelar.addEventListener('click', () => { finalizarEdicao(); renderizar(); });
renderizar();
