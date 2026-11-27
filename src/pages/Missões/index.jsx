import styles from "./index.module.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { registrarAtividadeMissao } from "../../utils/atividades";

import {
  Target,
  Flame,
  Star,
  Trophy,
  Gift,
  BookOpen,
  PenTool,
  GraduationCap,
  Lock,
  Check,
  Clock3,
  ChevronRight,
  X,
  Play,
  Award,
  BookMarked,
  RotateCcw,
} from "lucide-react";

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CHAVE_MISSOES_CONCLUIDAS = "readduo_missoes_concluidas";
const CHAVE_MISSOES_DIARIAS = "readduo_missoes_diarias";
const CHAVE_MISSOES_SEMANAIS = "readduo_missoes_semanais";
const CHAVE_MISSOES_SEMANAIS_CONCLUIDAS =
  "readduo_missoes_semanais_concluidas";
const DURACAO_DIA_MISSOES = 24 * 60 * 60 * 1000;
const DURACAO_SEMANA_MISSOES = 7 * DURACAO_DIA_MISSOES;
const QUANTIDADE_MISSOES_DIA = 5;

function obterIdUsuarioLocal() {
  try {
    const usuario = JSON.parse(
      localStorage.getItem("usuario") || "null"
    );
    const id = usuario?.Us_ID ?? usuario?.id;

    return id == null ? "anonimo" : String(id);
  } catch {
    return "anonimo";
  }
}

function obterChaveMissoes(base, usuarioId) {
  return `${base}_${usuarioId}`;
}

function obterSequenciaAcessos(usuarioId) {
  try {
    const registro = JSON.parse(
      localStorage.getItem(`readduo-sequencia-${usuarioId}`) || "null"
    );
    const agora = new Date();
    const hoje = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, "0"),
      String(agora.getDate()).padStart(2, "0"),
    ].join("-");

    if (registro?.data !== hoje) return 0;

    return Math.max(0, Number(registro.sequencia) || 0);
  } catch {
    return 0;
  }
}

const ABAS = [
  {
    id: "diarias",
    nome: "Diárias",
  },
  {
    id: "semanais",
    nome: "Semanais",
  },
  {
    id: "recompensas",
    nome: "Recompensas",
  },
];


function IconeMissao({ tipo, tamanho = 30 }) {
  const props = {
    size: tamanho,
    strokeWidth: 2.3,
  };

  switch (tipo) {
    case "leitura":
      return <BookOpen {...props} />;

    case "escrita":
      return <PenTool {...props} />;

    case "licao":
      return <GraduationCap {...props} />;

    case "vocabulario":
      return <BookMarked {...props} />;

    case "bonus":
      return <Gift {...props} />;

    default:
      return <Target {...props} />;
  }
}


function normalizarMissao(missao, index) {
  const tipo = String(missao.Ms_tipo).toLowerCase();
  const textoDuracao = String(
    `${missao.Ms_titulo || ""} ${missao.Ms_descricao || ""}`
  ).toLowerCase();
  const exigeMaisDeUmDia =
    /\b\d+\s*dias?\b|\bdias?\s+consecutiv|\bsemanas?\b/.test(
      textoDuracao
    );

  return {
    id: missao.Ms_ID,
    titulo: missao.Ms_titulo,
    descricao: missao.Ms_descricao,
    xp: Number(missao.Ms_recompensaXP),
    tipo,
    setor: tipo,
    semanal: exigeMaisDeUmDia,
    ordem: index + 1,
    bonus: false,
    concluida: false,
  };
}


/* =========================================================
   BUSCAR MISSÕES
   ---------------------------------------------------------
   Os dados exibidos são obtidos exclusivamente da API.
   ========================================================= */

async function buscarMissoes() {
  const resposta = await api.get("/missoes");
  const dados = resposta.data;

  if (!dados?.sucesso || !Array.isArray(dados.dados)) {
    throw new Error(
      dados?.mensagem || "Não foi possível carregar as missões."
    );
  }

  return dados.dados
    .filter((missao) =>
      missao &&
      missao.Ms_ID != null &&
      missao.Ms_titulo &&
      missao.Ms_descricao &&
      missao.Ms_recompensaXP != null &&
      missao.Ms_tipo
    )
    .map(normalizarMissao);
}

function obterListaResposta(resposta, recurso) {
  if (resposta.data?.sucesso === false) {
    throw new Error(
      resposta.data.mensagem || `Não foi possível carregar ${recurso}.`
    );
  }

  const dados = resposta.data?.dados ?? resposta.data;
  if (!Array.isArray(dados)) {
    throw new Error(`A resposta de ${recurso} não contém uma lista.`);
  }

  return dados;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obraPublicada(obra) {
  const status = normalizarTexto(obra?.Ob_status ?? obra?.status);
  return Number(status) === 1 || status === "publicada" || status === "publicado";
}


function embaralharMissao(missoes) {
  const embaralhadas = [...missoes];

  for (let index = embaralhadas.length - 1; index > 0; index -= 1) {
    const aleatorio = Math.floor(Math.random() * (index + 1));
    [embaralhadas[index], embaralhadas[aleatorio]] = [
      embaralhadas[aleatorio],
      embaralhadas[index],
    ];
  }

  return embaralhadas;
}


function selecionarCicloMisssoes(todasMissoes, usuarioId) {
  const agora = Date.now();
  const chaveCiclo = obterChaveMissoes(
    CHAVE_MISSOES_DIARIAS,
    usuarioId
  );
  let cicloSalvo = null;

  try {
    cicloSalvo = JSON.parse(
      localStorage.getItem(chaveCiclo)
    );
  } catch {
    cicloSalvo = null;
  }

  let renovou = false;
  let idsSelecionados;
  let expiresAt;

  if (
    cicloSalvo &&
    Number.isFinite(cicloSalvo.expiresAt) &&
    cicloSalvo.expiresAt > agora &&
    Array.isArray(cicloSalvo.ids)
  ) {
    idsSelecionados = cicloSalvo.ids
      .map(String)
      .filter((id) =>
        todasMissoes.some((missao) => String(missao.id) === id)
      );
    expiresAt = cicloSalvo.expiresAt;
  }

  if (idsSelecionados?.length !== QUANTIDADE_MISSOES_DIA) {
    idsSelecionados = embaralharMissao(todasMissoes)
      .slice(0, QUANTIDADE_MISSOES_DIA)
      .map((missao) => String(missao.id));
    expiresAt = agora + DURACAO_DIA_MISSOES;
    renovou = true;
  }

  const selecionadas = idsSelecionados
    .map((id) =>
      todasMissoes.find((missao) => String(missao.id) === id)
    )
    .filter(Boolean)
    .map((missao, index) => ({
      ...missao,
      ordem: index + 1,
    }));

  if (renovou) {
    localStorage.setItem(
      chaveCiclo,
      JSON.stringify({ expiresAt, ids: idsSelecionados })
    );
  }

  return {
    missoes: selecionadas,
    expiresAt,
    renovou,
  };
}

function selecionarCicloMisssoesSemanais(todasMissoes, usuarioId) {
  const agora = Date.now();
  const chaveCiclo = obterChaveMissoes(
    CHAVE_MISSOES_SEMANAIS,
    usuarioId
  );
  const semanais = todasMissoes.filter(
    (missao) => missao.semanal
  );

  let cicloSalvo = null;
  try {
    cicloSalvo = JSON.parse(
      localStorage.getItem(chaveCiclo)
    );
  } catch {
    cicloSalvo = null;
  }

  let renovou = false;
  let slots = [];
  let expiresAt = agora + DURACAO_SEMANA_MISSOES;

  if (
    cicloSalvo &&
    Number.isFinite(cicloSalvo.expiresAt) &&
    cicloSalvo.expiresAt > agora &&
    Array.isArray(cicloSalvo.slots)
  ) {
    slots = cicloSalvo.slots
      .map((slot) => {
        const missao = semanais.find(
          (item) => String(item.id) === String(slot.id)
        );
        return missao
          ? { setor: missao.setor, id: String(missao.id) }
          : null;
      })
      .filter(Boolean);
    expiresAt = cicloSalvo.expiresAt;
  }

  if (
    slots.length === 0 &&
    Array.isArray(cicloSalvo?.slots)
  ) {
    const idsAntigos = new Set(
      cicloSalvo.slots.map((slot) => String(slot.id))
    );
    slots = cicloSalvo.slots
      .map((slot) => {
        const missaoAtual = semanais.find(
          (missao) => String(missao.id) === String(slot.id)
        );
        const setor =
          missaoAtual?.setor || String(slot.setor || "");

        if (!setor) {
          return null;
        }

        const candidatos = semanais.filter(
          (missao) =>
            missao.setor === setor &&
            !idsAntigos.has(String(missao.id))
        );
        const escolhido =
          embaralharMissao(
            candidatos.length > 0
              ? candidatos
              : semanais.filter(
                  (missao) => missao.setor === setor
                )
          )[0];

        return escolhido
          ? { setor, id: String(escolhido.id) }
          : null;
      })
      .filter(Boolean);
    expiresAt = agora + DURACAO_SEMANA_MISSOES;
    renovou = true;
  } else if (slots.length === 0) {
    const setores = [
      ...new Set(
        semanais.map((missao) => missao.setor)
      ),
    ];

    slots = setores
      .map((setor) => {
        const candidatos = semanais.filter(
          (missao) => missao.setor === setor
        );
        const escolhido =
          embaralharMissao(candidatos)[0];
        return escolhido
          ? { setor, id: String(escolhido.id) }
          : null;
      })
      .filter(Boolean);
    renovou = true;
  }

  const selecionadas = slots
    .map((slot) =>
      semanais.find(
        (missao) => String(missao.id) === slot.id
      )
    )
    .filter(Boolean)
    .map((missao, index) => ({
      ...missao,
      ordem: index + 1,
    }));

  if (renovou) {
    localStorage.setItem(
      chaveCiclo,
      JSON.stringify({ expiresAt, slots })
    );
  }

  return {
    missoes: selecionadas,
    expiresAt,
    renovou,
  };
}


function obterUltimoLivro() {
  const chaves = [
    "readduo_ultimo_livro",
    "readduo_ultimo_livro_lido",
    "ultimoLivroLido",
  ];

  for (const chave of chaves) {
    const salvo = localStorage.getItem(chave);

    if (!salvo) {
      continue;
    }

    try {
      const livro = JSON.parse(salvo);

      if (livro?.id) {
        return livro;
      }
    } catch {
      // Ignora dados inválidos.
    }
  }

  return null;
}


function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);

  const minutos = Math.floor(
    (segundos % 3600) / 60
  );

  const segundosRestantes =
    segundos % 60;

  return [
    horas,
    minutos,
    segundosRestantes,
  ]
    .map((numero) =>
      String(numero).padStart(2, "0")
    )
    .join(":");
}



function Missoes() {
  const navigate = useNavigate();
  const usuarioId = obterIdUsuarioLocal();
  const chaveMissoesConcluidas = obterChaveMissoes(
    CHAVE_MISSOES_CONCLUIDAS,
    usuarioId
  );
  const chaveMissoesDiarias = obterChaveMissoes(
    CHAVE_MISSOES_DIARIAS,
    usuarioId
  );
  const chaveMissoesSemanais = obterChaveMissoes(
    CHAVE_MISSOES_SEMANAIS,
    usuarioId
  );
  const chaveMissoesSemanaisConcluidas =
    obterChaveMissoes(
      CHAVE_MISSOES_SEMANAIS_CONCLUIDAS,
      usuarioId
    );

  const [missoes, setMissoes] = useState([]);
  const [todasMissoes, setTodasMissoes] = useState([]);
  const [missoesSemanais, setMissoesSemanais] =
    useState([]);
  const [missoesSemanaisConcluidas, setMissoesSemanaisConcluidas] =
    useState([]);

  const [concluidasIds, setConcluidasIds] =
    useState([]);

  const [missaoSelecionada, setMissaoSelecionada] =
    useState(null);

  const [abaAtiva, setAbaAtiva] =
    useState("diarias");

  const [ultimoLivro, setUltimoLivro] =
    useState(null);

  const [segundosRestantes, setSegundosRestantes] =
    useState(8 * 60 * 60 + 41 * 60 + 46);
  const [segundosSemanaisRestantes, setSegundosSemanaisRestantes] =
    useState(DURACAO_SEMANA_MISSOES / 1000);

  const usuarioInicial =
    (() => {
      try {
        return JSON.parse(
          localStorage.getItem("usuario") || "null"
        );
      } catch {
        return null;
      }
    })();

  const [nivelUsuario, setNivelUsuario] =
    useState(
      Number(
        usuarioInicial?.Us_nivel ??
        usuarioInicial?.nivel ??
        1
      ) || 1
    );

  const [xpUsuario, setXpUsuario] =
    useState(
      Number(
        usuarioInicial?.Us_XP_total ??
        usuarioInicial?.xpTotal ??
        0
      ) || 0
    );

  const [sequenciaAcessos] = useState(() =>
    obterSequenciaAcessos(usuarioId)
  );


  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await buscarMissoes();
        const missoesDiariasDisponiveis = dados.filter(
          (missao) => !missao.semanal
        );
        const ciclo = selecionarCicloMisssoes(
          missoesDiariasDisponiveis,
          usuarioId
        );
        const cicloSemanal = selecionarCicloMisssoesSemanais(
          dados,
          usuarioId
        );

        setTodasMissoes(dados);
        setMissoes(ciclo.missoes);
        setMissoesSemanais(cicloSemanal.missoes);
        setSegundosRestantes(
          Math.max(
            0,
            Math.ceil((ciclo.expiresAt - Date.now()) / 1000)
          )
        );
        setSegundosSemanaisRestantes(
          Math.max(
            0,
            Math.ceil((cicloSemanal.expiresAt - Date.now()) / 1000)
          )
        );

        const usuarioSalvo =
          localStorage.getItem("usuario");

        if (usuarioSalvo) {
          try {
            const usuario =
              JSON.parse(usuarioSalvo);
            const usuarioId =
              Number(usuario?.Us_ID ?? usuario?.id);

            if (
              Number.isInteger(usuarioId) &&
              usuarioId > 0
            ) {
              const respostaUsuario =
                await api.get("/usuarios");
              const usuarios =
                Array.isArray(respostaUsuario.data)
                  ? respostaUsuario.data
                  : respostaUsuario.data?.dados;

              if (Array.isArray(usuarios)) {
                const usuarioBanco =
                  usuarios.find((item) =>
                    Number(item.Us_ID ?? item.id) === usuarioId
                  );

                if (usuarioBanco) {
                  const nivelBanco =
                    Number(
                      usuarioBanco.Us_nivel ??
                      usuarioBanco.nivel ??
                      1
                    ) || 1;
                  const xpBanco =
                    Number(
                      usuarioBanco.Us_XP_total ??
                      usuarioBanco.xpTotal ??
                      0
                    ) || 0;

                  setNivelUsuario(nivelBanco);
                  setXpUsuario(xpBanco);
                  localStorage.setItem(
                    "usuario",
                    JSON.stringify({
                      ...usuario,
                      ...usuarioBanco,
                      Us_nivel: nivelBanco,
                      nivel: nivelBanco,
                      Us_XP_total: xpBanco,
                      xpTotal: xpBanco,
                    })
                  );
                }
              }
            }
          } catch (erroUsuario) {
            console.error(
              "Erro ao sincronizar nível do usuário:",
              erroUsuario
            );
          }
        }

        const salvo = localStorage.getItem(
          chaveMissoesConcluidas
        );

        let concluidasSalvas = [];

        if (salvo) {
          try {
            const parsed = JSON.parse(salvo);

            if (Array.isArray(parsed)) {
              concluidasSalvas = parsed.map(String);
            }
          } catch {
            concluidasSalvas = [];
          }
        }

        const concluidasDoBanco = dados
          .filter((missao) => missao.concluida)
          .map((missao) =>
            String(missao.id)
          );

        if (ciclo.renovou) {
          localStorage.removeItem(chaveMissoesConcluidas);
          setConcluidasIds([]);
        } else {
          const idsSelecionados = new Set(
            ciclo.missoes.map((missao) => String(missao.id))
          );
          const todas = [
            ...concluidasSalvas,
            ...concluidasDoBanco,
          ];

          setConcluidasIds([
            ...new Set(todas),
          ].filter((id) => idsSelecionados.has(id)));
        }

        const semanalSalvo = localStorage.getItem(
          chaveMissoesSemanaisConcluidas
        );
        let semanaisConcluidas = [];

        if (semanalSalvo) {
          try {
            const parsed = JSON.parse(semanalSalvo);
            if (Array.isArray(parsed)) {
              semanaisConcluidas = parsed.map(String);
            }
          } catch {
            semanaisConcluidas = [];
          }
        }

        if (cicloSemanal.renovou) {
          localStorage.removeItem(
            chaveMissoesSemanaisConcluidas
          );
          setMissoesSemanaisConcluidas([]);
        } else {
          const idsSemanais = new Set(
            cicloSemanal.missoes.map((missao) =>
              String(missao.id)
            )
          );
          setMissoesSemanaisConcluidas(
            semanaisConcluidas.filter((id) =>
              idsSemanais.has(id)
            )
          );
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar missões:",
          erro
        );
      }
    };

    carregar();

    setUltimoLivro(
      obterUltimoLivro()
    );
  }, [
    chaveMissoesConcluidas,
    chaveMissoesSemanaisConcluidas,
    usuarioId,
  ]);



  useEffect(() => {
    const intervalo = setInterval(() => {
      let cicloSalvo = null;

      try {
        cicloSalvo = JSON.parse(
          localStorage.getItem(chaveMissoesDiarias)
        );
      } catch {
        cicloSalvo = null;
      }

      const expiresAt = Number(cicloSalvo?.expiresAt);

      if (!Number.isFinite(expiresAt)) {
        setSegundosRestantes(0);
        return;
      }

      const restante = expiresAt - Date.now();

      if (restante <= 0) {
        if (todasMissoes.length > 0) {
          const novoCiclo =
            selecionarCicloMisssoes(
              todasMissoes.filter(
                (missao) => !missao.semanal
              ),
              usuarioId
            );

          setMissoes(novoCiclo.missoes);
          setConcluidasIds([]);
          localStorage.removeItem(
            chaveMissoesConcluidas
          );
          setMissaoSelecionada(null);
          setSegundosRestantes(
            Math.ceil(
              (novoCiclo.expiresAt - Date.now()) /
                1000
            )
          );
        }

        return;
      }

      setSegundosRestantes(
        Math.ceil(restante / 1000)
      );
    }, 1000);

    return () => clearInterval(intervalo);
  }, [
    chaveMissoesConcluidas,
    chaveMissoesDiarias,
    todasMissoes,
    usuarioId,
  ]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      let cicloSalvo = null;

      try {
        cicloSalvo = JSON.parse(
          localStorage.getItem(chaveMissoesSemanais)
        );
      } catch {
        cicloSalvo = null;
      }

      const expiresAt = Number(cicloSalvo?.expiresAt);

      if (!Number.isFinite(expiresAt)) {
        setSegundosSemanaisRestantes(0);
        return;
      }

      const restante = expiresAt - Date.now();

      if (restante <= 0) {
        if (todasMissoes.length > 0) {
          const novoCiclo =
            selecionarCicloMisssoesSemanais(
              todasMissoes,
              usuarioId
            );
          setMissoesSemanais(novoCiclo.missoes);
          setMissoesSemanaisConcluidas([]);
          localStorage.removeItem(
            chaveMissoesSemanaisConcluidas
          );
          setSegundosSemanaisRestantes(
            Math.ceil(
              (novoCiclo.expiresAt - Date.now()) / 1000
            )
          );
        }
        return;
      }

      setSegundosSemanaisRestantes(
        Math.ceil(restante / 1000)
      );
    }, 1000);

    return () => clearInterval(intervalo);
  }, [
    chaveMissoesSemanais,
    chaveMissoesSemanaisConcluidas,
    todasMissoes,
    usuarioId,
  ]);



  const missoesOrdenadas = useMemo(() => {
    return [...missoes].sort(
      (a, b) =>
        a.ordem - b.ordem
    );
  }, [missoes]);



  const obterStatusMissao = (
    missao,
    index
  ) => {
    const id = String(missao.id);

    /* Já concluída */
    if (concluidasIds.includes(id)) {
      return "concluida";
    }

    /* Bônus */
    if (missao.bonus) {
      const missoesNormais =
        missoesOrdenadas.filter(
          (item) => !item.bonus
        );

      const todasConcluidas =
        missoesNormais.length > 0 &&
        missoesNormais.every(
          (item) =>
            concluidasIds.includes(
              String(item.id)
            )
        );

      if (todasConcluidas) {
        return "bonus";
      }

      return "bloqueada";
    }

    /* Primeira missão */
    if (index === 0) {
      return "disponivel";
    }

    /* Missão anterior */
    const anterior =
      missoesOrdenadas[index - 1];

    if (
      concluidasIds.includes(
        String(anterior.id)
      )
    ) {
      return "disponivel";
    }

    return "bloqueada";
  };



  const missoesComStatus = useMemo(() => {
    return missoesOrdenadas.map(
      (missao, index) => ({
        ...missao,
        status:
          obterStatusMissao(
            missao,
            index
          ),
      })
    );
  }, [
    missoesOrdenadas,
    concluidasIds,
  ]);



  const quantidadeConcluidas =
    concluidasIds.length;

  const quantidadeTotal =
    missoesOrdenadas.length;

  const xpHoje = missoesComStatus
    .filter((missao) =>
      concluidasIds.includes(
        String(missao.id)
      )
    )
    .reduce(
      (total, missao) =>
        total + missao.xp,
      0
    );

  const nivelAtual = nivelUsuario;

  const progressoNivel =
    xpUsuario > 0
      ? Math.min(
          (xpUsuario % 500) / 5,
          100
        )
      : 0;

  const todasNormaisConcluidas =
    missoesComStatus
      .filter((missao) => !missao.bonus)
      .every((missao) =>
        concluidasIds.includes(
          String(missao.id)
        )
      );


  const atualizarProgressoUsuario =
    async (missao) => {
      try {
        const usuarioSalvo =
          localStorage.getItem("usuario");

        if (!usuarioSalvo) {
          return;
        }

        const usuario =
          JSON.parse(usuarioSalvo);
        const usuarioId =
          Number(usuario?.Us_ID ?? usuario?.id);

        if (
          !Number.isInteger(usuarioId) ||
          usuarioId <= 0
        ) {
          return;
        }

        const resposta =
          await api.get("/usuarios");
        const usuarios =
          Array.isArray(resposta.data)
            ? resposta.data
            : resposta.data?.dados;

        if (!Array.isArray(usuarios)) {
          throw new Error(
            "Não foi possível carregar o usuário."
          );
        }

        const usuarioBanco =
          usuarios.find((item) =>
            Number(item.Us_ID ?? item.id) === usuarioId
          );

        if (!usuarioBanco) {
          throw new Error(
            "Usuário não encontrado."
          );
        }

        const xpAtual =
          Number(
            usuarioBanco.Us_XP_total ??
            usuarioBanco.xpTotal ??
            usuario.Us_XP_total ??
            usuario.xpTotal ??
            0
          ) || 0;
        const xpNovo =
          xpAtual + Number(missao.xp);
        const nivelNovo =
          xpNovo >= 500
            ? Math.floor(xpNovo / 500) + 1
            : 1;

        const dados =
          new FormData();
        dados.append(
          "Us_XP_total",
          String(xpNovo)
        );
        dados.append(
          "Us_nivel",
          String(nivelNovo)
        );

        await api.put(
          `/usuarios/${usuarioId}`,
          dados
        );

        const usuarioAtualizado = {
          ...usuario,
          ...usuarioBanco,
          Us_XP_total: xpNovo,
          xpTotal: xpNovo,
          Us_nivel: nivelNovo,
          nivel: nivelNovo,
        };

        localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioAtualizado)
        );
        setXpUsuario(xpNovo);
        setNivelUsuario(nivelNovo);
      } catch (erro) {
        console.error(
          "Erro ao atualizar nível do usuário:",
          erro
        );
      }
    };


  const verificarMissao =
    async (missao) => {
      try {
        const usuarioSalvo =
          localStorage.getItem("usuario");

        if (!usuarioSalvo) {
          return false;
        }

        const usuario =
          JSON.parse(usuarioSalvo);
        const usuarioId =
          Number(usuario?.Us_ID ?? usuario?.id);

        if (
          !Number.isInteger(usuarioId) ||
          usuarioId <= 0
        ) {
          return false;
        }

        const titulo = normalizarTexto(missao.titulo);
        const descricao = normalizarTexto(missao.descricao);

        if (
          titulo.includes("incansavel") ||
          titulo.includes("ofensiva") ||
          titulo.includes("semana de leitura")
        ) {
          return obterSequenciaAcessos(usuarioId) >= 7;
        }

        if (
          missao.tipo === "leitura" ||
          titulo.includes("leitor") ||
          titulo.includes("primeira leitura") ||
          titulo.includes("leitura")
        ) {
          const chave =
            `readduo-capitulos-concluidos-${usuarioId}`;
          const registros = JSON.parse(
            localStorage.getItem(chave) || "[]"
          );
          const capitulosLidos = Array.isArray(registros)
            ? new Set(registros.map(String)).size
            : 0;
          const quantidadeNaDescricao = Number(
            descricao.match(/\d+/)?.[0]
          );
          const meta = Number.isInteger(quantidadeNaDescricao)
            ? quantidadeNaDescricao
            : titulo.includes("primeira leitura")
              ? 1
              : 0;

          return meta > 0 && capitulosLidos >= meta;
        }

        if (titulo.includes("primeira obra")) {
          const resposta = await api.get(
            `/obras/usuario/${usuarioId}`
          );
          const obras = obterListaResposta(resposta, "obras do usuário");
          return obras.some(obraPublicada);
        }

        if (titulo.includes("primeiro capitulo")) {
          const obrasResposta = await api.get(
            `/obras/usuario/${usuarioId}`
          );
          const obras = obterListaResposta(
            obrasResposta,
            "obras do usuário"
          ).filter(obraPublicada);

          for (const obra of obras) {
            const resposta = await api.get(
              `/capitulos/obra/${obra.Ob_ID}`
            );
            const capitulos = obterListaResposta(
              resposta,
              "capítulos da obra"
            );
            const possuiCapituloPublicado = capitulos.some(
              (capitulo) => {
                const conteudo = String(
                  capitulo?.Cap_conteudo || ""
                )
                  .replace(/<[^>]*>/g, " ")
                  .trim();

                return (
                  String(capitulo?.Cap_titulo || "").trim() &&
                  conteudo.length > 0
                );
              }
            );

            if (possuiCapituloPublicado) {
              return true;
            }
          }

          return false;
        }

        if (titulo.includes("comentarista")) {
          const resposta = await api.get(
            `/comentarios/usuario/${usuarioId}`
          );
          const comentarios = obterListaResposta(
            resposta,
            "comentários do usuário"
          );
          return comentarios.some(
            (comentario) =>
              String(
                comentario?.Com_obr_texto ??
                  comentario?.com_obr_texto ??
                  ""
              ).trim().length > 0
          );
        }

        if (titulo.includes("conhecendo a comunidade")) {
          const resposta = await api.get("/seguindo", {
            params: { Us_ID: usuarioId },
          });
          const seguindo = obterListaResposta(
            resposta,
            "usuários seguidos"
          );
          const usuariosSeguidos = new Set(
            seguindo
              .map((relacao) => Number(relacao?.Seguindo))
              .filter((id) => Number.isInteger(id) && id > 0)
          );

          return usuariosSeguidos.size >= 5;
        }

        return false;
      } catch (erro) {
        console.error(
          "Erro ao verificar missão:",
          erro
        );
        return null;
      }
    };


  useEffect(() => {
    if (missoesComStatus.length === 0) {
      return;
    }

    let cancelado = false;

    const sincronizarMisssoes = async () => {
      for (const missao of missoesComStatus) {
        if (cancelado) {
          continue;
        }

        const idMissao = String(missao.id);
        const jaConcluida = concluidasIds.includes(idMissao);
        const cumprida = await verificarMissao(missao);

        if (cancelado || cumprida === null) {
          continue;
        }

        if (!cumprida && jaConcluida) {
          setConcluidasIds((anteriores) => {
            if (!anteriores.includes(idMissao)) {
              return anteriores;
            }

            const novas = anteriores.filter(
              (id) => id !== idMissao
            );
            localStorage.setItem(
              chaveMissoesConcluidas,
              JSON.stringify(novas)
            );
            return novas;
          });
        } else if (cumprida && !jaConcluida) {
          setConcluidasIds((anteriores) => {
            if (anteriores.includes(idMissao)) {
              return anteriores;
            }

            const novas = [
              ...anteriores,
              String(missao.id),
            ];

            localStorage.setItem(
              chaveMissoesConcluidas,
              JSON.stringify(novas)
            );

            registrarAtividadeMissao(usuarioId, missao, "diaria");
            atualizarProgressoUsuario(missao);
            return novas;
          });
        }
      }
    };

    sincronizarMisssoes();

    return () => {
      cancelado = true;
    };
  }, [
    chaveMissoesConcluidas,
    missoesComStatus,
    concluidasIds,
    usuarioId,
  ]);

  useEffect(() => {
    if (missoesSemanais.length === 0) {
      return;
    }

    let cancelado = false;

    const sincronizarSemanais = async () => {
      for (const missao of missoesSemanais) {
        if (cancelado) {
          continue;
        }

        const idMissao = String(missao.id);
        const jaConcluida =
          missoesSemanaisConcluidas.includes(idMissao);
        const cumprida = await verificarMissao(missao);

        if (cancelado || cumprida === null) {
          continue;
        }

        if (!cumprida && jaConcluida) {
          setMissoesSemanaisConcluidas((anteriores) => {
            if (!anteriores.includes(idMissao)) {
              return anteriores;
            }

            const novas = anteriores.filter(
              (id) => id !== idMissao
            );
            localStorage.setItem(
              chaveMissoesSemanaisConcluidas,
              JSON.stringify(novas)
            );
            return novas;
          });
        } else if (cumprida && !jaConcluida) {
          setMissoesSemanaisConcluidas((anteriores) => {
            if (anteriores.includes(idMissao)) {
              return anteriores;
            }

            const novas = [
              ...anteriores,
              String(missao.id),
            ];
            localStorage.setItem(
              chaveMissoesSemanaisConcluidas,
              JSON.stringify(novas)
            );
            registrarAtividadeMissao(usuarioId, missao, "semanal");
            atualizarProgressoUsuario(missao);
            return novas;
          });
        }
      }
    };

    sincronizarSemanais();

    return () => {
      cancelado = true;
    };
  }, [
    chaveMissoesSemanaisConcluidas,
    missoesSemanais,
    missoesSemanaisConcluidas,
    usuarioId,
  ]);



  const concluirMissao = (id) => {
    const idString = String(id);

    setConcluidasIds((anteriores) => {
      const novas = [
        ...new Set([
          ...anteriores,
          idString,
        ]),
      ];

      localStorage.setItem(
        chaveMissoesConcluidas,
        JSON.stringify(novas)
      );

      if (!anteriores.includes(idString)) {
        const missao =
          missoesComStatus.find(
            (item) =>
              String(item.id) === idString
          );

        if (missao) {
          registrarAtividadeMissao(usuarioId, missao, "diaria");
          atualizarProgressoUsuario(missao);
        }
      }

      return novas;
    });

    setMissaoSelecionada((atual) => {
      if (!atual) {
        return atual;
      }

      if (
        String(atual.id) === idString
      ) {
        return {
          ...atual,
          status: "concluida",
        };
      }

      return atual;
    });
  };



  const abrirMissao = (missao) => {
    setMissaoSelecionada(missao);
  };


  const executarMissao = async (missao) => {
    const status =
      obterStatusMissao(
        missao,
        missoesComStatus.findIndex(
          (item) =>
            item.id === missao.id
        )
      );

    if (status === "bloqueada") {
      return;
    }

    const cumprida =
      await verificarMissao(missao);

    if (cumprida) {
      concluirMissao(missao.id);
    }

    /* Leitura */
    if (
      missao.tipo === "leitura" ||
      missao.tipo === "revisao"
    ) {
      if (ultimoLivro?.id) {
        navigate(
          `/livro/${ultimoLivro.id}/ler`
        );
      } else {
        navigate("/pesquisa");
      }

      return;
    }

    /* Escrita */
    if (missao.tipo === "escrita") {
      navigate("/oficina");
      return;
    }

    /* Outras missões */
    if (!cumprida) {
      setMissaoSelecionada(missao);
    }
  };


  /* -------------------------------------------------------
     CONTINUAR ÚLTIMO LIVRO
     ------------------------------------------------------- */

  const continuarLeitura = () => {
    if (ultimoLivro?.id) {
      navigate(
        `/livro/${ultimoLivro.id}/ler`
      );

      return;
    }

    navigate("/pesquisa");
  };


  /* -------------------------------------------------------
     CLASSE DO NÓ
     ------------------------------------------------------- */

  const obterClasseNo = (status) => {
    switch (status) {
      case "concluida":
        return styles.noConcluido;

      case "bloqueada":
        return styles.noBloqueado;

      case "bonus":
        return styles.noBonus;

      default:
        return styles.noDisponivel;
    }
  };


  /* -------------------------------------------------------
     RENDER DA TRILHA
     ------------------------------------------------------- */

  const renderizarTrilha = () => {
    return (
      <div className={styles.trilha}>
        <div className={styles.trilhaCaminho}>

          {missoesComStatus.map(
            (missao, index) => {
              const status =
                missao.status;

              const lado =
                index % 2 === 0
                  ? styles.missaoEsquerda
                  : styles.missaoDireita;

              const proxima =
                index <
                missoesComStatus.length - 1;

              const statusAnterior =
                index > 0
                  ? missoesComStatus[
                      index - 1
                    ].status
                  : null;

              return (
                <div
                  className={`${styles.missao} ${lado}`}
                  key={missao.id}
                >

                  {/* CONECTOR */}
                  {proxima && (
                    <div
                      className={`${styles.conector} ${
                        index % 2 === 0
                          ? styles.conectorDireita
                          : styles.conectorEsquerda
                      } ${
                        status === "concluida" &&
                        statusAnterior !== "bloqueada"
                          ? styles.conectorAtivo
                          : ""
                      }`}
                    />
                  )}

                  {/* NÓ */}
                  <button
                    type="button"
                    className={`${styles.noMissao} ${obterClasseNo(
                      status
                    )}`}
                    onClick={() =>
                      abrirMissao(
                        missao
                      )
                    }
                    aria-label={`Abrir missão ${missao.titulo}`}
                  >

                    {status ===
                    "concluida" ? (
                      <Check
                        size={36}
                        strokeWidth={3}
                      />
                    ) : status ===
                      "bloqueada" ? (
                      <Lock
                        size={30}
                      />
                    ) : (
                      <IconeMissao
                        tipo={
                          missao.tipo
                        }
                        tamanho={34}
                      />
                    )}

                  </button>

                  {/* INFORMAÇÕES */}
                  <div
                    className={
                      styles.infoMissao
                    }
                  >

                    {status ===
                      "disponivel" && (
                      <span
                        className={
                          styles.badgeComecar
                        }
                      >
                        COMEÇAR
                      </span>
                    )}

                    {status ===
                      "concluida" && (
                      <span
                        className={
                          styles.badgeConcluida
                        }
                      >
                        CONCLUÍDA
                      </span>
                    )}

                    {status ===
                      "bloqueada" && (
                      <span
                        className={
                          styles.badgeBloqueada
                        }
                      >
                        BLOQUEADA
                      </span>
                    )}

                    {status ===
                      "bonus" && (
                      <span
                        className={
                          styles.badgeBonus
                        }
                      >
                        RECOMPENSA
                      </span>
                    )}

                    <h3>
                      {missao.titulo}
                    </h3>

                    <p>
                      {missao.descricao}
                    </p>

                    <strong>
                      +{missao.xp} XP
                    </strong>
                  </div>
                </div>
              );
            }
          )}

        </div>
      </div>
    );
  };


  /* =======================================================
     CONTEÚDO DAS ABAS
     ======================================================= */

  const renderizarConteudoAba =
    () => {

      /* ---------------------------------------------------
         DIÁRIAS
         --------------------------------------------------- */

      if (abaAtiva === "diarias") {
        return (
          <div className={styles.areaTrilha}>

            {missaoSelecionada && (
              <div
                className={
                  styles.painelMissao
                }
              >

                <div
                  className={
                    styles.painelMissaoTopo
                  }
                >

                  <div
                    className={
                      styles.painelTitulo
                    }
                  >

                    <div
                      className={
                        styles.painelIcone
                      }
                    >
                      <IconeMissao
                        tipo={
                          missaoSelecionada.tipo
                        }
                        tamanho={25}
                      />
                    </div>

                    <div>
                      <span>
                        MISSÃO
                      </span>

                      <h2>
                        {
                          missaoSelecionada.titulo
                        }
                      </h2>
                    </div>

                  </div>

                  <button
                    type="button"
                    className={
                      styles.botaoFechar
                    }
                    onClick={() =>
                      setMissaoSelecionada(
                        null
                      )
                    }
                  >
                    <X size={20} />
                  </button>

                </div>


                <p
                  className={
                    styles.painelDescricao
                  }
                >
                  {
                    missaoSelecionada.descricao
                  }
                </p>


                <div
                  className={
                    styles.painelRodape
                  }
                >

                  <div
                    className={
                      styles.recompensa
                    }
                  >
                    <Star
                      size={18}
                    />

                    <strong>
                      +{
                        missaoSelecionada.xp
                      }{" "}
                      XP
                    </strong>
                  </div>


                  {missaoSelecionada.status ===
                    "bloqueada" ? (
                    <div
                      className={
                        styles.mensagemBloqueada
                      }
                    >
                      <Lock size={17} />
                      Complete a missão
                      anterior para
                      desbloquear.
                    </div>
                  ) : missaoSelecionada.status ===
                    "concluida" ? (
                    <div
                      className={
                        styles.mensagemConcluida
                      }
                    >
                      <Check
                        size={18}
                      />
                      Missão concluída!
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={
                        styles.botaoComecar
                      }
                      onClick={() =>
                        executarMissao(
                          missaoSelecionada
                        )
                      }
                    >
                      <Play
                        size={18}
                        fill="currentColor"
                      />

                      Começar missão

                      <ChevronRight
                        size={18}
                      />
                    </button>
                  )}

                </div>

              </div>
            )}

            {renderizarTrilha()}

          </div>
        );
      }


      /* ---------------------------------------------------
         SEMANAIS
         --------------------------------------------------- */

      if (abaAtiva === "semanais") {
        return (
          <div className={styles.missoesSemanais}>
            <div className={styles.cabecalhoSemanal}>
              <div>
                <h2>Missões semanais</h2>
                <p>
                  Fixas por 7 dias e substituídas por outra missão
                  do mesmo setor ao terminar o ciclo.
                </p>
              </div>
              <span>
                Renovação: {formatarTempo(segundosSemanaisRestantes)}
              </span>
            </div>

            {missoesSemanais.length > 0 ? (
              <div className={styles.listaSemanais}>
                {missoesSemanais.map((missao) => {
                  const concluida =
                    missoesSemanaisConcluidas.includes(
                      String(missao.id)
                    );

                  return (
                    <article
                      className={`${styles.cardSemanal} ${
                        concluida ? styles.cardSemanalConcluido : ""
                      }`}
                      key={missao.id}
                    >
                      <div className={styles.cardSemanalTopo}>
                        <div className={styles.cardSemanalIcone}>
                          <IconeMissao tipo={missao.tipo} tamanho={24} />
                        </div>
                        <div>
                          <span>{missao.setor}</span>
                          <h3>{missao.titulo}</h3>
                        </div>
                      </div>

                      <p>{missao.descricao}</p>

                      <div className={styles.cardSemanalRodape}>
                        <strong>
                          <Star size={16} />
                          +{missao.xp} XP
                        </strong>
                        {concluida ? (
                          <span className={styles.semanalConcluida}>
                            <Check size={16} />
                            Concluída
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              const cumprida =
                                await verificarMissao(missao);
                              if (!cumprida) {
                                return;
                              }

                              setMissoesSemanaisConcluidas(
                                (anteriores) => {
                                  if (
                                    anteriores.includes(
                                      String(missao.id)
                                    )
                                  ) {
                                    return anteriores;
                                  }

                                  const novas = [
                                    ...anteriores,
                                    String(missao.id),
                                  ];
                                  localStorage.setItem(
                                    chaveMissoesSemanaisConcluidas,
                                    JSON.stringify(novas)
                                  );
                                  registrarAtividadeMissao(
                                    usuarioId,
                                    missao,
                                    "semanal"
                                  );
                                  atualizarProgressoUsuario(missao);
                                  return novas;
                                }
                              );
                            }}
                          >
                            Verificar missão
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.estadoAba}>
                <div className={styles.estadoIcone}>
                  <Target />
                </div>
                <h2>Nenhuma missão semanal disponível</h2>
                <p>
                  Novas missões de sete dias aparecerão quando forem
                  cadastradas no banco.
                </p>
              </div>
            )}
          </div>
        );
      }


      return (
        <div
          className={
            styles.recompensas
          }
        >

          <div
            className={
              styles.recompensaGrande
            }
          >
            <Gift
              size={48}
            />

            <h2>
              Baú diário
            </h2>

            <p>
              Complete todas as missões
              diárias para desbloquear
              sua recompensa.
            </p>

            <div
              className={
                styles.progressoRecompensa
              }
            >
              <div
                style={{
                  width: `${
                    quantidadeTotal > 0
                      ? Math.min(
                          (quantidadeConcluidas /
                            quantidadeTotal) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <span>
              {quantidadeConcluidas} de{" "}
              {quantidadeTotal} missões
              concluídas
            </span>
          </div>


          <div
            className={
              styles.recompensaXP
            }
          >
            <Star
              size={36}
            />

            <div>
              <strong>
                +{xpHoje} XP
              </strong>

              <span>
                conquistados hoje
              </span>
            </div>
          </div>

        </div>
      );
    };


  /* =======================================================
     RETORNO
     ======================================================= */

  return (
    <div className={styles.container}>

      {/* ===================================================
          HEADER
          =================================================== */}

      <header
        className={styles.header}
      >

        <div
          className={styles.titulo}
        >
          <div
            className={styles.tituloIcone}
          >
            <Target />
          </div>

          <div>
            <h1>
              Missões
            </h1>

            <p>
              Complete desafios, ganhe XP
              e avance na sua jornada
              literária.
            </p>
          </div>
        </div>

      </header>


      {/* ===================================================
          CARDS DE STATUS
          =================================================== */}

      <section
        className={styles.cards}
      >

        <div
          className={`${styles.card} ${styles.cardLaranja}`}
        >
          <div
            className={styles.cardIcone}
          >
            <Flame />
          </div>

          <div>
            <span>
              Sequência
            </span>

            <strong>
              {sequenciaAcessos}{" "}
              {sequenciaAcessos === 1 ? "dia" : "dias"}
            </strong>

            <small>
              Dias de acesso consecutivos
            </small>
          </div>
        </div>


        <div
          className={`${styles.card} ${styles.cardAmarelo}`}
        >
          <div
            className={styles.cardIcone}
          >
            <Star />
          </div>

          <div>
            <span>
              XP Hoje
            </span>

            <strong>
              +{xpHoje} XP
            </strong>

            <small>
              Ganhos hoje
            </small>
          </div>
        </div>


        <div
          className={`${styles.card} ${styles.cardTeal}`}
        >
          <div
            className={styles.cardIcone}
          >
            <Trophy />
          </div>

          <div>
            <span>
              Missões
            </span>

            <strong>
              {quantidadeConcluidas} /{" "}
              {quantidadeTotal}
            </strong>

            <small>
              Concluídas
            </small>
          </div>
        </div>


        <div
          className={`${styles.card} ${styles.cardRoxo}`}
        >
          <div
            className={styles.cardIcone}
          >
            <Gift />
          </div>

          <div>
            <span>
              Baú
            </span>

            <strong>
              {todasNormaisConcluidas
                ? "1"
                : "0"}
            </strong>

            <small>
              Disponível
            </small>
          </div>
        </div>

      </section>


      {/* ===================================================
          ABAS
          =================================================== */}

      <nav
        className={styles.tabs}
      >
        {ABAS.map((aba) => (
          <button
            type="button"
            key={aba.id}
            className={
              abaAtiva === aba.id
                ? styles.tabAtiva
                : ""
            }
            onClick={() =>
              setAbaAtiva(aba.id)
            }
          >
            {aba.nome}
          </button>
        ))}
      </nav>


      {/* ===================================================
          CONTEÚDO PRINCIPAL
          =================================================== */}

      <div
        className={styles.layout}
      >

        {/* ÁREA CENTRAL */}
        <main
          className={styles.conteudoPrincipal}
        >
          {renderizarConteudoAba()}
        </main>


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside
          className={styles.sidebar}
        >

          {/* -----------------------------------------------
              HORA DA LEITURA
              ----------------------------------------------- */}

          <div
            className={
              styles.leituraCard
            }
          >

            <div
              className={
                styles.leituraTopo
              }
            >
              <div
                className={
                  styles.leituraIcone
                }
              >
                <BookOpen />
              </div>

              <div>
                <span>
                  HORA DA LEITURA
                </span>

                <h3>
                  Continue sua jornada
                </h3>
              </div>
            </div>


            {ultimoLivro ? (
              <>
                <div
                  className={
                    styles.livroAtual
                  }
                >

                  <div
                    className={
                      styles.capaMiniatura
                    }
                  >
                    {ultimoLivro.imagem ? (
                      <img
                        src={
                          ultimoLivro.imagem
                        }
                        alt=""
                      />
                    ) : (
                      <BookOpen
                        size={25}
                      />
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        ultimoLivro.titulo ||
                        "Último livro lido"
                      }
                    </strong>

                    <span>
                      Continue de onde
                      parou.
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  className={
                    styles.botaoLeitura
                  }
                  onClick={
                    continuarLeitura
                  }
                >
                  <Play
                    size={17}
                    fill="currentColor"
                  />

                  Continuar leitura

                  <ChevronRight
                    size={17}
                  />
                </button>
              </>
            ) : (
              <>
                <div
                  className={
                    styles.semLivro
                  }
                >
                  <BookMarked />

                  <p>
                    Você ainda não possui
                    um último livro salvo.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.botaoLeitura
                  }
                  onClick={
                    continuarLeitura
                  }
                >
                  <BookOpen
                    size={17}
                  />

                  Encontrar um livro

                  <ChevronRight
                    size={17}
                  />
                </button>
              </>
            )}

          </div>


          {/* -----------------------------------------------
              RESET DAS MISSÕES
              ----------------------------------------------- */}

          <div
            className={
              styles.sideCard
            }
          >

            <div
              className={
                styles.sideTitulo
              }
            >
              <Clock3 />

              <span>
                Reset em
              </span>
            </div>

            <strong
              className={
                styles.contador
              }
            >
              {formatarTempo(
                abaAtiva === "semanais"
                  ? segundosSemanaisRestantes
                  : segundosRestantes
              )}
            </strong>

            <p>
              Novas missões em breve
            </p>

            <div
              className={
                styles.progress
              }
            >
              <div
                className={
                  styles.progressFill
                }
                style={{
                  width: `${
                    quantidadeTotal > 0
                      ? Math.min(
                          (quantidadeConcluidas /
                            quantidadeTotal) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <span
              className={
                styles.progressTexto
              }
            >
              {quantidadeConcluidas} /{" "}
              {quantidadeTotal} missões
              concluídas
            </span>

          </div>


          {/* -----------------------------------------------
              NÍVEL
              ----------------------------------------------- */}

          <div
            className={
              styles.sideCard
            }
          >

            <div
              className={
                styles.nivelTitulo
              }
            >
              <Trophy />

              <span>
                Seu nível
              </span>
            </div>


            <div
              className={
                styles.levelCircle
              }
            >
              {nivelAtual}
            </div>


            <h3
              className={
                styles.nivelNumero
              }
            >
              Nível {nivelAtual}
            </h3>

            <p
              className={
                styles.nivelNome
              }
            >
              Progresso de hoje
            </p>


            <div
              className={
                styles.progress
              }
            >
              <div
                className={
                  styles.progressFill
                }
                style={{
                  width: `${progressoNivel}%`,
                }}
              />
            </div>

            <span
              className={
                styles.progressTexto
              }
            >
              {xpUsuario} XP acumulados
            </span>

          </div>


          {/* -----------------------------------------------
              DICA
              ----------------------------------------------- */}

          <div
            className={
              styles.dicaCard
            }
          >

            <div
              className={
                styles.dicaIcone
              }
            >
              <RotateCcw />
            </div>

            <div>
              <strong>
                Mantenha sua sequência!
              </strong>

              <p>
                Complete pelo menos uma
                missão hoje para continuar
                evoluindo.
              </p>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default Missoes;