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
  if (!mesas.length) {
    listaMesas.append(criarMensagemVazia('Nenhuma mesa cadastrada.'));
    return;
  }
  [...mesas].sort((a, b) => a.numero - b.numero).forEach(mesa => {
    listaMesas.append(criarComponenteMesa(mesa, carregarProdutosParaComanda(), {
      onAlternarReserva(id) {
        const alvo = mesas.find(m => m.id === id);
        if (!alvo) return;
        alvo.alternarReserva();
        salvarMesas();
        renderizar();
      },
      onEditar: iniciarEdicao,
      onAdicionarProduto(idMesa, idProduto, informarErro) {
        const alvo = mesas.find(m => m.id === idMesa);
        const produto = carregarProdutosParaComanda().find(p => p.id === idProduto);
        if (!alvo || !produto) { informarErro('Selecione um produto cadastrado.'); return; }
        try {
          alvo.adicionarProduto(produto);
          salvarMesas();
          renderizar();
        } catch (erro) { informarErro(erro.message); }
      },
      onRemoverItem(idMesa, indice) {
        const alvo = mesas.find(m => m.id === idMesa);
        if (!alvo) return;
        alvo.removerItem(indice);
        salvarMesas();
        renderizar();
      }
    }));
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
