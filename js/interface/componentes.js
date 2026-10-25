/* Componentes reutilizáveis da interface.
 * Este módulo conhece HTML/CSS; os modelos de domínio não conhecem a interface.
 */
function criarMensagemVazia(texto) {
  const elemento = document.createElement('p');
  elemento.className = 'vazio';
  elemento.textContent = texto;
  return elemento;
}

function criarComponenteProduto(produto, callbacks = {}) {
  const item = document.createElement('article');
  item.className = 'item';

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
  status.textContent = produto.disponivel
    ? 'Situação: DISPONÍVEL para novas comandas'
    : 'Situação: BLOQUEADO para novas comandas';
  info.append(titulo, descricao, preco, status);

  const acoes = document.createElement('div');
  acoes.className = 'item-acoes';
  const btnDisponibilidade = document.createElement('button');
  btnDisponibilidade.type = 'button';
  btnDisponibilidade.className = 'badge ' + (produto.disponivel ? 'disponivel' : 'indisponivel');
  btnDisponibilidade.textContent = produto.disponivel ? 'Bloquear produto' : 'Desbloquear produto';
  btnDisponibilidade.addEventListener('click', () => callbacks.onAlternarDisponibilidade?.(produto.id));

  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.className = 'btn-editar';
  btnEditar.textContent = 'Alterar';
  btnEditar.addEventListener('click', () => callbacks.onEditar?.(produto.id));
  acoes.append(btnDisponibilidade, btnEditar);
  item.append(info, acoes);
  return item;
}

function criarComponenteMesa(mesa, produtos, callbacks = {}) {
  const item = document.createElement('article');
  item.className = 'item item-mesa';
  const info = document.createElement('div');
  info.className = 'item-info';
  const titulo = document.createElement('h3');
  titulo.textContent = 'Mesa ' + mesa.numero;
  const local = document.createElement('p');
  local.className = 'descricao';
  local.textContent = mesa.localizacao;
  info.append(titulo, local);

  const acoes = document.createElement('div');
  acoes.className = 'item-acoes';
  const btnReserva = document.createElement('button');
  btnReserva.type = 'button';
  btnReserva.className = 'badge ' + (mesa.reservada ? 'reservada' : 'livre');
  btnReserva.textContent = mesa.situacaoFormatada;
  btnReserva.addEventListener('click', () => callbacks.onAlternarReserva?.(mesa.id));
  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.className = 'btn-editar';
  btnEditar.textContent = 'Alterar';
  btnEditar.addEventListener('click', () => callbacks.onEditar?.(mesa.id));
  acoes.append(btnReserva, btnEditar);
  item.append(info, acoes);

  const secao = document.createElement('section');
  secao.className = 'comanda-mesa';
  const tituloComanda = document.createElement('h4');
  tituloComanda.textContent = 'Comanda da mesa';
  secao.append(tituloComanda);

  const form = document.createElement('form');
  form.className = 'form-comanda-mesa';
  const seletor = document.createElement('select');
  seletor.setAttribute('aria-label', 'Produto para adicionar à comanda');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecione um produto disponível';
  seletor.append(placeholder);
  produtos.filter(p => p.disponivel).forEach(produto => {
    const opcao = document.createElement('option');
    opcao.value = String(produto.id);
    opcao.textContent = `${produto.nome} — ${dinheiroComponente(produto.preco)}`;
    seletor.append(opcao);
  });
  const btnAdicionar = document.createElement('button');
  btnAdicionar.type = 'submit';
  btnAdicionar.textContent = 'Adicionar à comanda';
  btnAdicionar.className = 'btn-primario';
  form.append(seletor, btnAdicionar);
  const mensagem = document.createElement('p');
  mensagem.className = 'mensagem-comanda';
  mensagem.setAttribute('aria-live', 'polite');
  form.addEventListener('submit', evento => {
    evento.preventDefault();
    if (!seletor.value) {
      mensagem.textContent = 'Selecione um produto cadastrado.';
      mensagem.className = 'mensagem-comanda erro';
      return;
    }
    callbacks.onAdicionarProduto?.(mesa.id, Number(seletor.value), erro => {
      mensagem.textContent = erro || '';
      mensagem.className = erro ? 'mensagem-comanda erro' : 'mensagem-comanda';
    });
  });
  secao.append(form, mensagem);

  const listaItens = document.createElement('div');
  listaItens.className = 'itens-comanda';
  if (!mesa.itens.length) listaItens.append(criarMensagemVazia('Nenhum item na comanda.'));
  mesa.itens.forEach((linha, indice) => {
    const linhaDOM = document.createElement('div');
    linhaDOM.className = 'linha-comanda';
    const nome = document.createElement('span');
    nome.textContent = `${linha.nome} — ${dinheiroComponente(linha.preco)}`;
    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'btn-secundario';
    remover.textContent = 'Remover';
    remover.addEventListener('click', () => callbacks.onRemoverItem?.(mesa.id, indice));
    linhaDOM.append(nome, remover);
    listaItens.append(linhaDOM);
  });
  const total = document.createElement('p');
  total.className = 'preco';
  total.textContent = 'Total: ' + dinheiroComponente(mesa.totalComanda);
  secao.append(listaItens, total);
  item.append(secao);
  return item;
}

function dinheiroComponente(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
