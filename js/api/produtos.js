import { requisitar } from "./http.js";

const urlProdutos = "http://localhost:3000/produtos";

export async function listarProdutos() {
    return requisitar(urlProdutos);
}

export async function obterProduto(id) {
    const url = `${urlProdutos}/${id}`;

    return requisitar(url);
}

export async function criarProduto(dados) {
    return requisitar(urlProdutos, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
}

export async function atualizarProduto(id, dados) {
    const url = `${urlProdutos}/${id}`;

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