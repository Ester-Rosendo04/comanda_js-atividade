/* Cadastro, bloqueio e persistência dos produtos. */
const CHAVE_PRODUTOS = 'saborOrla_produtos';
function carregarProdutos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PRODUTOS) || '[]');
    const lista = dados.map(p => new Produto(p.nome, p.descricao, p.preco, p.disponivel !== false, p.id));
    Produto.proximoId = Math.max(1, ...lista.map(p => p.id + 1));
    return lista;
  } catch (erro) { console.error('Não foi possível carregar os produtos:', erro); return []; }
}
const produtos = carregarProdutos();
function salvarProdutos() { localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos)); }
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

function renderizar() {
  listaProdutos.innerHTML = '';
  if (!produtos.length) {
    const vazio = document.createElement('p'); vazio.className = 'vazio';
    vazio.textContent = 'Nenhum produto cadastrado.'; listaProdutos.append(vazio); return;
  }
  produtos.forEach(produto => {
    const info = document.createElement('div'); info.className = 'item-info';
    const titulo = document.createElement('h3'); titulo.textContent = produto.nome;
    const descricao = document.createElement('p'); descricao.className = 'descricao'; descricao.textContent = produto.descricao;
    const preco = document.createElement('p'); preco.className = 'preco'; preco.textContent = produto.precoFormatado;
    const status = document.createElement('p'); status.className = 'descricao';
    status.textContent = produto.disponivel ? 'Situação: DISPONÍVEL para novas comandas' : 'Situação: BLOQUEADO para novas comandas';
    info.append(titulo, descricao, preco, status);
    const acoes = document.createElement('div'); acoes.className = 'item-acoes';
    const btnBloquear = document.createElement('button'); btnBloquear.type = 'button';
    btnBloquear.className = 'badge ' + (produto.disponivel ? 'disponivel' : 'indisponivel');
    btnBloquear.textContent = produto.disponivel ? 'Bloquear produto' : 'Desbloquear produto';
    btnBloquear.addEventListener('click', () => { produto.alternarDisponibilidade(); salvarProdutos(); renderizar(); });
    const btnEditar = document.createElement('button'); btnEditar.type = 'button'; btnEditar.className = 'btn-editar'; btnEditar.textContent = 'Alterar';
    btnEditar.addEventListener('click', () => iniciarEdicao(produto.id));
    acoes.append(btnBloquear, btnEditar);
    const item = document.createElement('article'); item.className = 'item'; item.append(info, acoes); listaProdutos.append(item);
  });
}
function iniciarEdicao(id) {
  const produto = produtos.find(p => p.id === id); if (!produto) return;
  idEmEdicao = id; campoNome.value = produto.nome; campoDescricao.value = produto.descricao;
  campoPreco.value = produto.preco; campoDisponivel.value = String(produto.disponivel);
  tituloForm.textContent = 'Alterar Produto'; btnSalvar.textContent = 'Salvar'; btnCancelar.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' }); campoNome.focus();
}
function finalizarEdicao() {
  idEmEdicao = null; form.reset(); tituloForm.textContent = 'Adicionar Produto +';
  btnSalvar.textContent = 'Cadastrar'; btnCancelar.hidden = true;
}
form.addEventListener('submit', evento => {
  evento.preventDefault();
  const nome = campoNome.value.trim(), descricao = campoDescricao.value.trim(), preco = Number(campoPreco.value);
  const disponivel = campoDisponivel.value === 'true';
  if (!nome || !descricao || !Number.isFinite(preco) || preco < 0) { alert('Informe nome, descrição e um preço válido.'); return; }
  if (idEmEdicao === null) {
    produtos.push(new Produto(nome, descricao, preco, disponivel)); form.reset(); campoNome.focus();
  } else {
    const produto = produtos.find(p => p.id === idEmEdicao);
    if (produto) { produto.atualizarDados({ nome, descricao, preco }); produto.disponivel = disponivel; }
    finalizarEdicao();
  }
  salvarProdutos(); renderizar();
});
btnCancelar.addEventListener('click', () => { finalizarEdicao(); renderizar(); });
renderizar();
