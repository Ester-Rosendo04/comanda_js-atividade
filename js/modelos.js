/* Modelos e regras de negócio compartilhados. */
class Produto {
  static proximoId = 1;
  constructor(nome, descricao, preco, disponivel = true, id = null) {
    this.id = id ?? Produto.proximoId++;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = Number(preco);
    this.disponivel = disponivel !== false;
    if (this.id >= Produto.proximoId) Produto.proximoId = this.id + 1;
  }
  atualizarDados({ nome, descricao, preco }) {
    this.nome = nome; this.descricao = descricao; this.preco = Number(preco);
  }
  alternarDisponibilidade() { this.disponivel = !this.disponivel; return this.disponivel; }
  get precoFormatado() { return this.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  toJSON() { return { id: this.id, nome: this.nome, descricao: this.descricao, preco: this.preco, disponivel: this.disponivel }; }
}
class Mesa {
  static proximoId = 1;
  constructor(numero, localizacao, reservada = false, itens = [], id = null) {
    this.id = id ?? Mesa.proximoId++;
    this.numero = Number(numero); this.localizacao = localizacao;
    this.reservada = Boolean(reservada); this.itens = Array.isArray(itens) ? itens : [];
    if (this.id >= Mesa.proximoId) Mesa.proximoId = this.id + 1;
  }
  atualizarLocalizacao(valor) { this.localizacao = valor; }
  atualizarReserva(valor) { this.reservada = Boolean(valor); }
  alternarReserva() { this.reservada = !this.reservada; return this.reservada; }
  get situacaoFormatada() { return this.reservada ? 'Reservada' : 'Não reservada'; }
  adicionarProduto(produto) {
    // Regra de negócio: a verificação ocorre no método, não só na interface.
    if (!(produto instanceof Produto)) throw new Error('Produto inválido.');
    if (!produto.disponivel) throw new Error(`O produto "${produto.nome}" está bloqueado e não pode ser adicionado a uma nova comanda.`);
    this.itens.push({ produtoId: produto.id, nome: produto.nome, preco: produto.preco });
  }
  removerItem(indice) { if (indice >= 0 && indice < this.itens.length) this.itens.splice(indice, 1); }
  get totalComanda() { return this.itens.reduce((total, item) => total + Number(item.preco), 0); }
}
