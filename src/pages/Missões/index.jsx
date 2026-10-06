import styles from "./index.module.css";

import { useEffect, useState } from "react";
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
  BookMarked,
} from "lucide-react";

/* =========================================================
   DADOS DE EXEMPLO
   ---------------------------------------------------------
   Futuramente esses dados podem vir diretamente do backend.
   A ideia é manter o formato dos objetos igual ao que a API
   deverá retornar.
   ========================================================= */

const missoesIniciais = [
  {
    id: 1,
    titulo: "Leitura diária",
    descricao: "Leia por 30 minutos",
    xp: 50,
    status: "atual",
    tipo: "leitura",
    icone: "book",

    objetivo: {
      tipo: "tempo_leitura",
      valor: 30,
      unidade: "minutos",
    },

    conteudo: {
      titulo: "Hora da leitura!",
      descricao:
        "Continue sua jornada literária lendo seu último livro por 30 minutos.",
      instrucoes:
        "Clique em começar para abrir seu último livro lido.",
    },
  },

  {
    id: 2,
    titulo: "Escrita do dia",
    descricao: "Escreva 500 palavras",
    xp: 75,
    status: "bloqueada",
    tipo: "escrita",
    icone: "pen",

    objetivo: {
      tipo: "palavras_escritas",
      valor: 500,
      unidade: "palavras",
    },

    conteudo: {
      titulo: "Desafio de escrita",
      descricao:
        "Coloque sua criatividade em prática e escreva pelo menos 500 palavras.",
      instrucoes:
        "Realize essa missão através da Oficina Autoral.",
    },
  },

  {
    id: 3,
    titulo: "Aprendizado",
    descricao: "Conclua uma lição",
    xp: 100,
    status: "bloqueada",
    tipo: "licao",
    icone: "graduation",

    objetivo: {
      tipo: "licao",
      valor: 1,
      unidade: "lição",
    },

    conteudo: {
      titulo: "Hora de aprender!",
      descricao:
        "Complete uma lição da sua trilha de aprendizado.",
      instrucoes:
        "Conclua as missões anteriores para desbloquear esta.",
    },
  },

  {
    id: 4,
    titulo: "Vocabulário",
    descricao: "Aprenda 5 novas palavras",
    xp: 100,
    status: "bloqueada",
    tipo: "licao",
    icone: "graduation",

    objetivo: {
      tipo: "vocabulario",
      valor: 5,
      unidade: "palavras",
    },

    conteudo: {
      titulo: "Expanda seu vocabulário",
      descricao:
        "Aprenda novas palavras e aumente seu conhecimento.",
      instrucoes:
        "Complete a lição para continuar sua trilha.",
    },
  },

  {
    id: 5,
    titulo: "Baú Diário",
    descricao: "Complete todas as missões",
    xp: 500,
    status: "bonus",
    tipo: "bonus",
    icone: "gift",

    objetivo: {
      tipo: "todas_missoes",
      valor: 4,
      unidade: "missões",
    },

    conteudo: {
      titulo: "Baú diário",
      descricao:
        "Complete todas as missões do dia para receber sua recompensa.",
      instrucoes:
        "Finalize todas as missões disponíveis.",
    },
  },
];

/* =========================================================
   ÚLTIMO LIVRO LIDO
   ---------------------------------------------------------
   Futuramente poderá vir do banco:
   GET /usuarios/:id/ultimo-livro
   ========================================================= */

const ultimoLivroInicial = {
  id: "example-book-1",
  titulo: "O Último Sussurro",
  autor: "Marina Silveira",
  progresso: 68,
  capa: "",
};

/* =========================================================
   FUNÇÃO PARA PEGAR ÍCONE
   ========================================================= */

function IconeMissao({ tipo, size = 28 }) {
  if (tipo === "book") {
    return <BookOpen size={size} />;
  }

  if (tipo === "pen") {
    return <PenTool size={size} />;
  }

  if (tipo === "graduation") {
    return <GraduationCap size={size} />;
  }

  if (tipo === "gift") {
    return <Gift size={size} />;
  }

  return <Target size={size} />;
}

/* =========================================================
   COMPONENTE
   ========================================================= */

function Missoes() {
  const navigate = useNavigate();

  const [missoes, setMissoes] = useState(missoesIniciais);

  const [ultimoLivro, setUltimoLivro] =
    useState(ultimoLivroInicial);

  const [abaAtiva, setAbaAtiva] = useState("diarias");

  const [missaoSelecionada, setMissaoSelecionada] =
    useState(null);

  const [tempoRestante, setTempoRestante] =
    useState(8 * 60 * 60 + 42 * 60 + 17);

  /* =========================================================
     CONTADOR
     ========================================================= */

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempoRestante((tempo) => {
        if (tempo <= 0) {
          return 24 * 60 * 60;
        }

        return tempo - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  /* =========================================================
     FORMATAR TEMPO
     ========================================================= */

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);

    const minutos = Math.floor(
      (segundos % 3600) / 60
    );

    const segundosRestantes = segundos % 60;

    return [
      horas,
      minutos,
      segundosRestantes,
    ]
      .map((numero) =>
        String(numero).padStart(2, "0")
      )
      .join(":");
  };

  /* =========================================================
     MISSÕES CONCLUÍDAS
     ========================================================= */

  const missoesConcluidas = missoes.filter(
    (missao) => missao.status === "concluida"
  ).length;

  const totalMissoes = missoes.filter(
    (missao) => missao.tipo !== "bonus"
  ).length;

  const xpHoje = missoes
    .filter((missao) => missao.status === "concluida")
    .reduce(
      (total, missao) => total + missao.xp,
      0
    );

  /* =========================================================
     ABRIR MISSÃO
     ========================================================= */

  const abrirMissao = (missao) => {
    if (missao.status === "bloqueada") {
      return;
    }

    setMissaoSelecionada(missao);
  };

  /* =========================================================
     INICIAR MISSÃO
     ========================================================= */

  const iniciarMissao = () => {
    if (!missaoSelecionada) return;

    /*
      MISSÃO DE LEITURA

      Futuramente o ID virá do banco.
    */

    if (
      missaoSelecionada.tipo === "leitura" &&
      ultimoLivro?.id
    ) {
      setMissaoSelecionada(null);

      navigate(`/livro/${ultimoLivro.id}/ler`);

      return;
    }

    /*
      MISSÃO DE ESCRITA

      Podemos levar o usuário para a Oficina.
    */

    if (missaoSelecionada.tipo === "escrita") {
      setMissaoSelecionada(null);

      navigate("/oficina");

      return;
    }

    /*
      OUTRAS MISSÕES

      Por enquanto continuam no modal.
    */

    concluirMissao(missaoSelecionada.id);
  };

  /* =========================================================
     CONCLUIR MISSÃO
     ========================================================= */

  const concluirMissao = (id) => {
    setMissoes((missoesAtuais) =>
      missoesAtuais.map((missao) =>
        missao.id === id
          ? {
              ...missao,
              status: "concluida",
            }
          : missao
      )
    );

    setMissaoSelecionada(null);

    /*
      FUTURO BACKEND:

      Aqui poderá entrar algo como:

      await fetch("/missoes/concluir", {
        method: "POST",
        body: JSON.stringify({
          missaoId: id,
          usuarioId: usuarioId
        })
      });

    */
  };

  /* =========================================================
     IR PARA O ÚLTIMO LIVRO
     ========================================================= */

  const continuarUltimoLivro = () => {
    if (!ultimoLivro?.id) return;

    navigate(`/livro/${ultimoLivro.id}/ler`);
  };

  /* =========================================================
     CARDS
     ========================================================= */

  const cards = [
    {
      titulo: "Sequência",
      valor: "8 dias",
      subtitulo: "Melhor sequência",
      cor: "#FB923C",
      icone: <Flame size={28} />,
    },

    {
      titulo: "XP Hoje",
      valor: `+${xpHoje} XP`,
      subtitulo: "Ganhos hoje",
      cor: "#FACC15",
      icone: <Star size={28} />,
    },

    {
      titulo: "Missões",
      valor: `${missoesConcluidas} / ${totalMissoes}`,
      subtitulo: "Concluídas",
      cor: "#0FA6B3",
      icone: <Trophy size={28} />,
    },

    {
      titulo: "Baú",
      valor:
        missoesConcluidas >= totalMissoes
          ? "1"
          : "0",
      subtitulo: "Disponível",
      cor: "#8B5CF6",
      icone: <Gift size={28} />,
    },
  ];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className={styles.container}>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className={styles.header}>
        <div className={styles.titulo}>
          <Target />

          <h1>Missões</h1>
        </div>

        <p>
          Complete desafios diários, ganhe XP e evolua
          no Readduo.
        </p>
      </div>

      {/* =====================================================
          CARDS
          ===================================================== */}

      <section className={styles.cards}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={styles.card}
            style={{
              borderColor: card.cor,
            }}
          >
            <div
              className={styles.cardIcon}
              style={{
                color: card.cor,
              }}
            >
              {card.icone}
            </div>

            <div>
              <h2>{card.valor}</h2>

              <span>{card.titulo}</span>

              <small>
                {card.subtitulo}
              </small>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          TABS
          ===================================================== */}

      <div className={styles.tabs}>

        <button
          className={
            abaAtiva === "diarias"
              ? styles.active
              : ""
          }
          onClick={() =>
            setAbaAtiva("diarias")
          }
        >
          Diárias
        </button>

        <button
          className={
            abaAtiva === "semanais"
              ? styles.active
              : ""
          }
          onClick={() =>
            setAbaAtiva("semanais")
          }
        >
          Semanais
        </button>

        <button
          className={
            abaAtiva === "conquistas"
              ? styles.active
              : ""
          }
          onClick={() =>
            setAbaAtiva("conquistas")
          }
        >
          Conquistas
        </button>

        <button
          className={
            abaAtiva === "recompensas"
              ? styles.active
              : ""
          }
          onClick={() =>
            setAbaAtiva("recompensas")
          }
        >
          Recompensas
        </button>

      </div>

      {/* =====================================================
          CONTEÚDO
          ===================================================== */}

      {abaAtiva === "diarias" && (
        <div className={styles.layout}>

          {/* =================================================
              TRILHA
              ================================================= */}

          <main className={styles.trilha}>

  <div className={styles.trilhaCaminho}>

    {missoes.map((missao, index) => {

      const ultima =
        index === missoes.length - 1;

      return (
        <div
          key={missao.id}
          className={`
            ${styles.missao}
            ${
              index % 2 === 0
                ? styles.missaoEsquerda
                : styles.missaoDireita
            }
          `}
        >

          {/* CONEXÃO COM A PRÓXIMA ETAPA */}

          {!ultima && (
            <div
              className={`
                ${styles.conector}
                ${
                  index % 2 === 0
                    ? styles.conectorDireita
                    : styles.conectorEsquerda
                }
              `}
            />
          )}

          {/* BOTÃO DA MISSÃO */}

          <button
            className={`
              ${styles.circulo}
              ${styles[missao.status]}
            `}
            onClick={() =>
              abrirMissao(missao)
            }
            disabled={
              missao.status ===
              "bloqueada"
            }
            title={
              missao.status ===
              "bloqueada"
                ? "Complete as missões anteriores"
                : "Abrir missão"
            }
          >

            {missao.status ===
            "concluida" ? (
              <Check size={32} />
            ) : missao.status ===
              "bloqueada" ? (
              <Lock size={28} />
            ) : (
              <IconeMissao
                tipo={missao.icone}
                size={30}
              />
            )}

          </button>

          {/* INFORMAÇÕES DA MISSÃO */}

          <div
            className={styles.info}
          >

            {missao.status ===
              "atual" && (
              <span
                className={
                  styles.badge
                }
              >
                COMEÇAR
              </span>
            )}

            {missao.status ===
              "concluida" && (
              <span
                className={
                  styles.badgeConcluida
                }
              >
                CONCLUÍDA
              </span>
            )}

            {missao.status ===
              "bloqueada" && (
              <span
                className={
                  styles.badgeBloqueada
                }
              >
                BLOQUEADA
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
    })}

  </div>

</main>

          {/* =================================================
              SIDEBAR
              ================================================= */}

          <aside className={styles.sidebar}>

            {/* ===============================================
                ÚLTIMO LIVRO
                =============================================== */}

            <div
              className={
                styles.livroCard
              }
            >

              <div
                className={
                  styles.livroTitulo
                }
              >
                <BookMarked
                  size={20}
                />

                <h3>
                  Continue lendo
                </h3>
              </div>

              <div
                className={
                  styles.livroConteudo
                }
              >

                <div
                  className={
                    styles.livroCapa
                  }
                >
                  {ultimoLivro.capa ? (
                    <img
                      src={
                        ultimoLivro.capa
                      }
                      alt={
                        ultimoLivro.titulo
                      }
                    />
                  ) : (
                    <BookOpen
                      size={30}
                    />
                  )}
                </div>

                <div
                  className={
                    styles.livroInfo
                  }
                >

                  <h4>
                    {ultimoLivro.titulo}
                  </h4>

                  <p>
                    {ultimoLivro.autor}
                  </p>

                  <span>
                    {ultimoLivro.progresso}%
                    lido
                  </span>

                </div>

              </div>

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
                    width: `${ultimoLivro.progresso}%`,
                  }}
                />
              </div>

              <button
                className={
                  styles.continuarLivro
                }
                onClick={
                  continuarUltimoLivro
                }
              >
                Continuar leitura

                <ChevronRight
                  size={18}
                />
              </button>

            </div>

            {/* ===============================================
                RESET
                =============================================== */}

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
                <Clock3 size={20} />

                <h3>
                  Reset em
                </h3>
              </div>

              <h2>
                {formatarTempo(
                  tempoRestante
                )}
              </h2>

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
                      (missoesConcluidas /
                        totalMissoes) *
                      100
                    }%`,
                  }}
                />
              </div>

              <span>
                {missoesConcluidas} /{" "}
                {totalMissoes} missões
                concluídas
              </span>

            </div>

            {/* ===============================================
                NÍVEL
                =============================================== */}

            <div
              className={
                styles.sideCard
              }
            >

              <h3>
                Seu nível
              </h3>

              <div
                className={
                  styles.levelCircle
                }
              >
                12
              </div>

              <h4>
                Nível 12
              </h4>

              <p>
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

              <span>
                4200 / 5000 XP
              </span>

            </div>

          </aside>

        </div>
      )}

      {/* =====================================================
          SEMANAIS
          ===================================================== */}

      {abaAtiva === "semanais" && (
        <div
          className={
            styles.conteudoAba
          }
        >
          <Target size={50} />

          <h2>
            Missões semanais
          </h2>

          <p>
            Aqui ficarão as missões
            semanais do usuário.
          </p>
        </div>
      )}

      {/* =====================================================
          CONQUISTAS
          ===================================================== */}

      {abaAtiva === "conquistas" && (
        <div
          className={
            styles.conteudoAba
          }
        >
          <Trophy size={50} />

          <h2>
            Conquistas
          </h2>

          <p>
            Aqui aparecerão as conquistas
            desbloqueadas pelo usuário.
          </p>
        </div>
      )}

      {/* =====================================================
          RECOMPENSAS
          ===================================================== */}

      {abaAtiva === "recompensas" && (
        <div
          className={
            styles.conteudoAba
          }
        >
          <Gift size={50} />

          <h2>
            Recompensas
          </h2>

          <p>
            Aqui ficarão os prêmios
            disponíveis para o usuário.
          </p>
        </div>
      )}

      {/* =====================================================
          MODAL DA MISSÃO
          ===================================================== */}

      {missaoSelecionada && (
        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setMissaoSelecionada(
                null
              );
            }
          }}
        >

          <div
            className={
              styles.modalMissao
            }
          >

            <button
              className={
                styles.fecharModal
              }
              onClick={() =>
                setMissaoSelecionada(
                  null
                )
              }
            >
              <X size={22} />
            </button>

            <div
              className={
                styles.modalIcone
              }
            >
              <IconeMissao
                tipo={
                  missaoSelecionada.icone
                }
                size={34}
              />
            </div>

            <span
              className={
                styles.modalXp
              }
            >
              +{missaoSelecionada.xp} XP
            </span>

            <h2>
              {
                missaoSelecionada
                  .conteudo?.titulo
              }
            </h2>

            <p>
              {
                missaoSelecionada
                  .conteudo?.descricao
              }
            </p>

            <div
              className={
                styles.instrucoes
              }
            >
              <strong>
                O que fazer?
              </strong>

              <span>
                {
                  missaoSelecionada
                    .conteudo
                    ?.instrucoes
                }
              </span>
            </div>

            {/* ÚLTIMO LIVRO */}

            {missaoSelecionada.tipo ===
              "leitura" && (
              <div
                className={
                  styles.modalLivro
                }
              >

                <BookOpen size={22} />

                <div>
                  <strong>
                    Último livro lido
                  </strong>

                  <span>
                    {ultimoLivro.titulo}
                  </span>

                  <small>
                    {ultimoLivro.progresso}%
                    concluído
                  </small>
                </div>

              </div>
            )}

            <button
              className={
                styles.botaoComecar
              }
              onClick={
                iniciarMissao
              }
            >

              <Play
                size={19}
                fill="currentColor"
              />

              {missaoSelecionada.tipo ===
              "leitura"
                ? "Começar leitura"
                : missaoSelecionada.tipo ===
                  "escrita"
                ? "Ir para Oficina"
                : "Começar missão"}

            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Missoes;