const URL = "https://www.googleapis.com/books/v1/volumes";

export async function buscarLivros(termo) {
  const resposta = await fetch(
    `${URL}?q=${encodeURIComponent(termo)}&maxResults=20`
  );

  if (!resposta.ok) {
    throw new Error("Erro ao buscar livros.");
  }

  const dados = await resposta.json();

  return dados.items || [];
}