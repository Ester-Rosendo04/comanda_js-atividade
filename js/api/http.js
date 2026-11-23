export async function requisitar(url, opcoes = {}) {
	const resposta = await fetch(url, opcoes);
	
  if(opcoes.method === "DELETE" && resposta.ok) {
		return
	}

	const dados = await resposta.json();

	if (!resposta.ok) {
		throw new Error(
			`${dados.message} | Erro HTTP: ${resposta.status}`
		);
	}

	return dados.data;
}