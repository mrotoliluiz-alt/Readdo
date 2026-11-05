
const API_URL = import.meta.env.VITE_API_URL;

export async function api(rota, opcoes = {}) {
    const headers = new Headers(opcoes.headers || {});

    const configuracao = {
        ...opcoes,
        headers
    };

    // Permite enviar JSON ou FormData (imagens)
    if (
        opcoes.body &&
        !(opcoes.body instanceof FormData) &&
        typeof opcoes.body !== 'string'
    ) {
        headers.set('Content-Type', 'application/json');
        configuracao.body = JSON.stringify(opcoes.body);
    }

    const resposta = await fetch(
        `${API_URL}${rota}`,
        configuracao
    );

    const tipo = resposta.headers.get('content-type');

    const dados = tipo?.includes('application/json')
        ? await resposta.json()
        : await resposta.text();

    if (!resposta.ok) {
        throw new Error(
            dados?.mensagem || 'Erro na requisição.'
        );
    }

    return dados;
}
