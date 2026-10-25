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
    listaProdutos.append(criarMensagemVazia('Nenhum produto cadastrado.'));
    return;
  }
  produtos.forEach(produto => listaProdutos.append(criarComponenteProduto(produto, {
    onAlternarDisponibilidade(id) {
      const alvo = produtos.find(p => p.id === id);
      if (!alvo) return;
      alvo.alternarDisponibilidade();
      salvarProdutos();
      renderizar();
    },
    onEditar: iniciarEdicao
  })));
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
