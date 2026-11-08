import { requisitar } from "./http.js";

const urlMesas = "http://localhost:3000/mesas";

export async function listarMesas() {
    return requisitar(urlMesas);
}

export async function obterMesa(id) {
    const url = `${urlMesas}/${id}`;

    return requisitar(url);
}

export async function criarMesa(dados) {
    return requisitar(urlMesas, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
}

export async function atualizarMesa(id, dados) {
    const url = `${urlMesas}/${id}`;

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