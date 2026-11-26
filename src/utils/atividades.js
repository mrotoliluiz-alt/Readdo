const CHAVE_ATIVIDADES_MISSOES = "readduo_atividades_missoes";
const DURACAO_ATIVIDADE = 24 * 60 * 60 * 1000;

function obterChaveAtividades(usuarioId) {
  return `${CHAVE_ATIVIDADES_MISSOES}_${usuarioId}`;
}

function lerRegistrosRecentes(usuarioId, agora) {
  const chave = obterChaveAtividades(usuarioId);
  let registros;

  try {
    registros = JSON.parse(localStorage.getItem(chave) || "[]");
  } catch (error) {
    console.error("Erro ao ler atividades de missões:", error);
    localStorage.removeItem(chave);
    return [];
  }

  if (!Array.isArray(registros)) {
    localStorage.removeItem(chave);
    return [];
  }

  const recentes = registros.filter((registro) => {
    const concluidaEm = Number(registro.concluidaEm);
    return (
      Number.isFinite(concluidaEm) &&
      concluidaEm <= agora &&
      agora - concluidaEm < DURACAO_ATIVIDADE &&
      typeof registro.titulo === "string"
    );
  });

  if (recentes.length !== registros.length) {
    localStorage.setItem(chave, JSON.stringify(recentes));
  }

  return recentes;
}

function formatarTempoAtividade(concluidaEm, agora) {
  const minutos = Math.floor((agora - concluidaEm) / 60000);
  if (minutos < 1) return "Agora";
  if (minutos < 60) return `Há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  return `Há ${horas} h`;
}

export function obterAtividadesRecentes(usuarioId, agora = Date.now()) {
  if (!usuarioId) return [];

  return lerRegistrosRecentes(usuarioId, agora)
    .sort((a, b) => Number(b.concluidaEm) - Number(a.concluidaEm))
    .map((registro) => ({
      id: registro.id,
      missaoId: registro.missaoId,
      titulo: "Missão concluída",
      subtitulo: registro.titulo,
      concluidaEm: Number(registro.concluidaEm),
      tempo: formatarTempoAtividade(Number(registro.concluidaEm), agora),
      expiraEm: Number(registro.concluidaEm) + DURACAO_ATIVIDADE,
    }));
}

export function registrarAtividadeMissao(usuarioId, missao, tipo) {
  if (!usuarioId || missao?.id == null || !missao?.titulo) return;

  const agora = Date.now();
  const registros = lerRegistrosRecentes(usuarioId, agora);
  const duplicada = registros.some(
    (registro) =>
      registro.missaoId === String(missao.id) &&
      registro.tipo === tipo &&
      agora - Number(registro.concluidaEm) < 2000
  );
  if (duplicada) return;

  registros.push({
    id: `${tipo}-${missao.id}-${agora}`,
    missaoId: String(missao.id),
    tipo,
    titulo: missao.titulo,
    concluidaEm: agora,
  });
  localStorage.setItem(
    obterChaveAtividades(usuarioId),
    JSON.stringify(registros)
  );
}
