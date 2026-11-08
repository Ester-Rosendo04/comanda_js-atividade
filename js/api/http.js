export async function requisitar(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    if (resposta.status === 204) {
        return null;
    }

    return await resposta.json();
}