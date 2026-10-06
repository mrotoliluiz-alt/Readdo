import styles from "./index.module.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    id: "conquistas",
    nome: "Conquistas",
  },
  {
    id: "recompensas",
    nome: "Recompensas",
  },
];


/* =========================================================
   MISSÕES MOCK
   ---------------------------------------------------------
   Essa estrutura foi feita para ser fácil de trocar pela API.
   Os nomes Ms_ID, Ms_titulo etc. são compatíveis com o banco.
   ========================================================= */

const missoesMock = [
  {
    Ms_ID: 1,
    Ms_titulo: "Leitura diária",
    Ms_descricao: "Leia por 30 minutos.",
    Ms_recompensasXP: 50,
    Ms_tipo: "leitura",
    ordem: 1,
  },
  {
    Ms_ID: 2,
    Ms_titulo: "Escrita do dia",
    Ms_descricao: "Escreva 500 palavras.",
    Ms_recompensasXP: 75,
    Ms_tipo: "escrita",
    ordem: 2,
  },
  {
    Ms_ID: 3,
    Ms_titulo: "Aprendizado",
    Ms_descricao: "Conclua uma lição.",
    Ms_recompensasXP: 100,
    Ms_tipo: "licao",
    ordem: 3,
  },
  {
    Ms_ID: 4,
    Ms_titulo: "Vocabulário",
    Ms_descricao: "Aprenda 5 novas palavras.",
    Ms_recompensasXP: 100,
    Ms_tipo: "vocabulario",
    ordem: 4,
  },
  {
    Ms_ID: 5,
    Ms_titulo: "Baú Diário",
    Ms_descricao: "Complete todas as missões do dia.",
    Ms_recompensasXP: 500,
    Ms_tipo: "bonus",
    ordem: 5,
    bonus: true,
  },
];


/* =========================================================
   ÍCONE DE CADA TIPO DE MISSÃO
   ========================================================= */

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


/* =========================================================
   NORMALIZADOR
   ---------------------------------------------------------
   Aceita tanto os nomes do banco quanto os nomes do frontend.
   ========================================================= */

function normalizarMissao(missao, index) {
  return {
    id:
      missao.id ??
      missao.Ms_ID ??
      index + 1,

    titulo:
      missao.titulo ??
      missao.Ms_titulo ??
      "Missão",

    descricao:
      missao.descricao ??
      missao.Ms_descricao ??
      "",

    xp: Number(
      missao.xp ??
      missao.Ms_recompensasXP ??
      0
    ),

    tipo:
      missao.tipo ??
      missao.Ms_tipo ??
      "geral",

    ordem:
      Number(
        missao.ordem ??
        index + 1
      ),

    bonus:
      Boolean(missao.bonus),

    concluida:
      Boolean(
        missao.concluida ||
        missao.status === "concluida"
      ),
  };
}


/* =========================================================
   BUSCAR MISSÕES
   ---------------------------------------------------------
   FUTURO BACKEND:

   const resposta = await fetch("http://localhost:3000/missoes");
   const json = await resposta.json();
   return json.dados.map(normalizarMissao);

   Por enquanto usamos o mock.
   ========================================================= */

async function buscarMissoes() {
  return missoesMock.map(normalizarMissao);
}


/* =========================================================
   ÚLTIMO LIVRO LIDO
   ========================================================= */

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


/* =========================================================
   FORMATAR TEMPO
   ========================================================= */

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


/* =========================================================
   COMPONENTE
   ========================================================= */

function Missoes() {
  const navigate = useNavigate();

  /* -------------------------------------------------------
     ESTADOS
     ------------------------------------------------------- */

  const [missoes, setMissoes] = useState([]);

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

  /* -------------------------------------------------------
     CARREGAR DADOS
     ------------------------------------------------------- */

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await buscarMissoes();

        setMissoes(dados);

        const salvo = localStorage.getItem(
          CHAVE_MISSOES_CONCLUIDAS
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

        const todas = [
          ...concluidasSalvas,
          ...concluidasDoBanco,
        ];

        setConcluidasIds([
          ...new Set(todas),
        ]);
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
  }, []);


  /* -------------------------------------------------------
     CONTADOR
     ------------------------------------------------------- */

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundosRestantes((valor) => {
        if (valor <= 0) {
          return 24 * 60 * 60;
        }

        return valor - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);


  /* -------------------------------------------------------
     MISSÕES ORDENADAS
     ------------------------------------------------------- */

  const missoesOrdenadas = useMemo(() => {
    return [...missoes].sort(
      (a, b) =>
        a.ordem - b.ordem
    );
  }, [missoes]);


  /* -------------------------------------------------------
     STATUS DE CADA MISSÃO
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     MISSÕES COM STATUS
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     CONTADORES
     ------------------------------------------------------- */

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

  const todasNormaisConcluidas =
    missoesComStatus
      .filter((missao) => !missao.bonus)
      .every((missao) =>
        concluidasIds.includes(
          String(missao.id)
        )
      );

  /* -------------------------------------------------------
     CONCLUIR MISSÃO
     ------------------------------------------------------- */

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
        CHAVE_MISSOES_CONCLUIDAS,
        JSON.stringify(novas)
      );

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


  /* -------------------------------------------------------
     ABRIR MISSÃO
     ------------------------------------------------------- */

  const abrirMissao = (missao) => {
    setMissaoSelecionada(missao);
  };


  /* -------------------------------------------------------
     AÇÃO DA MISSÃO
     ------------------------------------------------------- */

  const executarMissao = (missao) => {
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

    /*
      No protótipo, iniciar a missão
      também marca como concluída.

      Quando o backend estiver pronto,
      essa função deve fazer um POST
      para USUARIO_MISSAO.
    */

    concluirMissao(missao.id);

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
    setMissaoSelecionada({
      ...missao,
      status: "concluida",
    });
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
          <div
            className={
              styles.estadoAba
            }
          >
            <div
              className={
                styles.estadoIcone
              }
            >
              <Target />
            </div>

            <h2>
              Missões semanais
            </h2>

            <p>
              As missões semanais serão
              carregadas do banco de dados
              quando essa etapa estiver
              integrada ao backend.
            </p>

            <span>
              Em breve
            </span>
          </div>
        );
      }


      /* ---------------------------------------------------
         CONQUISTAS
         --------------------------------------------------- */

      if (abaAtiva === "conquistas") {
        return (
          <div
            className={
              styles.conquistas
            }
          >

            <div
              className={
                styles.conquistaCard
              }
            >
              <div
                className={
                  styles.conquistaIcone
                }
              >
                <Award />
              </div>

              <div>
                <h3>
                  Primeiro passo
                </h3>

                <p>
                  Complete sua primeira
                  missão.
                </p>

                <strong>
                  {quantidadeConcluidas >=
                  1
                    ? "Desbloqueada"
                    : "Bloqueada"}
                </strong>
              </div>
            </div>


            <div
              className={
                styles.conquistaCard
              }
            >
              <div
                className={
                  styles.conquistaIcone
                }
              >
                <Trophy />
              </div>

              <div>
                <h3>
                  Mestre das missões
                </h3>

                <p>
                  Complete todas as
                  missões diárias.
                </p>

                <strong>
                  {todasNormaisConcluidas
                    ? "Desbloqueada"
                    : `${quantidadeConcluidas}/${Math.max(
                        quantidadeTotal - 1,
                        0
                      )}`}
                </strong>
              </div>
            </div>

          </div>
        );
      }


      /* ---------------------------------------------------
         RECOMPENSAS
         --------------------------------------------------- */

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
              8 dias
            </strong>

            <small>
              Melhor sequência
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
                segundosRestantes
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
              12
            </div>


            <h3
              className={
                styles.nivelNumero
              }
            >
              Nível 12
            </h3>

            <p
              className={
                styles.nivelNome
              }
            >
              Narrador Experiente
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
                  width: "84%",
                }}
              />
            </div>

            <span
              className={
                styles.progressTexto
              }
            >
              4200 / 5000 XP
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