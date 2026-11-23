import { requisitar } from "./http.js";

const urlMesas = "http://127.0.0.1:5000/mesas";

export async function listarMesas() {
  const url = `${urlMesas}/`;

  return requisitar(url);
}

export async function obterMesa(id) {
  const url = `${urlMesas}/${id}`;

  return requisitar(url);
}

export async function criarMesa(dados) {
	const url = `${urlMesas}/`;

  return requisitar(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });
}

export async function atualizarMesa(id, dados) {
  const url = `${urlMesas}/${id}`;

  delete dados.id;

  return requisitar(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });
}

export async function atualizarParcialmenteMesa(id, dados) {
  const url = `${urlMesas}/${id}`;

  return requisitar(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });
}

export async function excluirMesa(id) {
  const url = `${urlMesas}/${id}`;

  return requisitar(url, {
    method: "DELETE"
  });
}

export async function listarProdutosMesa(id) {
  const url = `${urlMesas}/${id}/produtos`;

  return requisitar(url, {
    method: "GET"
  });
}