import api from "./api";

function extrairLista(resposta, recurso) {
  if (resposta.data?.sucesso === false) {
    throw new Error(
      resposta.data.mensagem || `Não foi possível carregar ${recurso}.`
    );
  }

  const dados = resposta.data?.dados ?? resposta.data;

  if (!Array.isArray(dados)) {
    throw new Error(`A resposta da API não contém uma lista de ${recurso}.`);
  }

  return dados;
}

export async function buscarObrasDoUsuario(usuarioId, status) {
  const [respostaFavoritos, respostaObras] = await Promise.all([
    api.get(`/favoritos/usuario/${usuarioId}`),
    api.get("/obras"),
  ]);
  const favoritos = extrairLista(respostaFavoritos, "favoritos");
  const obras = extrairLista(respostaObras, "obras");
  const obrasPorId = new Map(
    obras
      .map((obra) => [Number(obra?.Ob_ID ?? obra?.id), obra])
      .filter(([id]) => Number.isInteger(id) && id > 0)
  );
  const idsAdicionadas = new Set();

  return favoritos.reduce((obrasDoUsuario, favorito) => {
    const obraId = Number(favorito?.Ob_ID);
    const statusFavorito = String(favorito?.Fav_status ?? "")
      .trim()
      .toLowerCase();
    const obra = obrasPorId.get(obraId);

    if (
      statusFavorito === status.toLowerCase() &&
      Number.isInteger(obraId) &&
      obraId > 0 &&
      obra &&
      !idsAdicionadas.has(obraId)
    ) {
      idsAdicionadas.add(obraId);
      obrasDoUsuario.push(obra);
    }

    return obrasDoUsuario;
  }, []);
}
