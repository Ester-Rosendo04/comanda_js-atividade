import { requisitar } from "./http.js";

const urlProdutos = "http://127.0.0.1:5000/produtos";

export async function listarProdutos() {
  const url = `${urlProdutos}/`;
  return requisitar(url);
}

export async function obterProduto(id) {
  const url = `${urlProdutos}/${id}`;

  return requisitar(url);
}

export async function criarProduto(dados) {
	const url = `${urlProdutos}/`;

  return requisitar(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
      body: JSON.stringify(dados)
  });
}

export async function atualizarProduto(id, dados) {
  const url = `${urlProdutos}/${id}`;

	delete dados.id;

  return requisitar(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });
}

export async function atualizarParcialmenteProduto(id, dados) {
  const url = `${urlProdutos}/${id}`;

  return requisitar(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });
}

export async function excluirProduto(id) {
  const url = `${urlProdutos}/${id}`;

  return requisitar(url, {
    method: "DELETE"
  });
}

export async function adicionarProdutoMesa(produto_id, mesa_id) {
  const url = `${urlProdutos}/${produto_id}/mesas/${mesa_id}`;

  return requisitar(url, {
    method: "POST"
  });
}

export async function removerProdutoMesa(produto_id, mesa_id) {
  const url = `${urlProdutos}/${produto_id}/mesas/${mesa_id}`;

  return requisitar(url, {
  	method: "DELETE"
	});
}