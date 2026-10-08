import styles from "./index.module.css";

import { useEffect, useState } from "react";

import {
  User,
  Calendar,
  MapPin,
  Heart,
  BookOpen,
  PenTool,
  Flame,
  Star,
  BadgeCheck,
  Circle,
  Pencil,
  X,
  Users,
  Check,
  Save,
  Trophy,
} from "lucide-react";

const estatisticas = [
  {
    titulo: "Livros lidos",
    valor: "48",
    extra: "+3 este mês",
    icone: <BookOpen color="#61a6fa" size={20} />,
  },
  {
    titulo: "Horas de leitura",
    valor: "126h",
    extra: "+8h este mês",
    icone: <Circle color="#c084fc" size={20} />,
  },
  {
    titulo: "Obras escritas",
    valor: "7",
    extra: "+2 este mês",
    icone: <PenTool color="#4ade80" size={20} />,
  },
  {
    titulo: "Palavras escritas",
    valor: "124.8K",
    extra: "+15.2K este mês",
    icone: <PenTool color="#fb7185" size={20} />,
  },
  {
    titulo: "Sequências",
    valor: "8 dias",
    extra: "Melhor: 16 dias",
    icone: <Flame color="#fb923c" size={20} />,
  },
  {
    titulo: "XP acumulado",
    valor: "24.850",
    extra: "Top 18%",
    icone: <Star color="#facc15" size={20} />,
  },
];

const atividades = [
  {
    titulo: 'Você concluiu a leitura de "Duna"',
    subtitulo: "Frank Herbert",
    tempo: "Hoje",
  },
  {
    titulo: 'Escreveu 1.250 palavras em "Ecos de Éter"',
    subtitulo: "Capítulo 8",
    tempo: "Ontem",
  },
  {
    titulo: 'Concluiu a lição "Construção de Mundos"',
    subtitulo: "Trilha intermediária",
    tempo: "2 dias atrás",
  },
  {
    titulo: "Nova conquista desbloqueada",
    subtitulo: "Leitor dedicado",
    tempo: "3 dias atrás",
  },
  {
    titulo: "Começou a seguir Mariana Costa",
    subtitulo: "Escritora",
    tempo: "4 dias atrás",
  },
];

const conquistas = [
  {
    titulo: "Leitor Dedicado",
    descricao: "Estude por 7 dias seguidos",
    tempo: "Hoje",
  },
  {
    titulo: "Explorador de Mundos",
    descricao: "Leia livros de 5 gêneros",
    tempo: "3 dias atrás",
  },
  {
    titulo: "Escritor Consistente",
    descricao: "Escreva por 5 dias seguidos",
    tempo: "1 semana atrás",
  },
  {
    titulo: "Primeiras Palavras",
    descricao: "Escreva sua primeira obra",
    tempo: "2 semanas atrás",
  },
  {
    titulo: "Leitor Curioso",
    descricao: "Leia seu primeiro livro",
    tempo: "1 mês atrás",
  },
];

const amigos = [
  {
    nome: "Mariana Costa",
    nivel: "Nível 14",
    status: "Online",
  },
  {
    nome: "Lucas Ferreira",
    nivel: "Nível 11",
    status: "Online",
  },
  {
    nome: "Rafael Monteiro",
    nivel: "Nível 10",
    status: "Offline",
  },
];

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom", "Hoje"];

const perfilInicial = {
  nome: "Nome Cliente",
  nivel: 12,
  tituloNivel: "Viajante das Histórias",
  xpAtual: 8450,
  xpMaximo: 12000,
  bio: "Apaixonada por fantasia, mistério e boas reviravoltas.",
  membroDesde: "15/04/2024",
  localizacao: "Brasil",
  interesses: ["Fantasia", "Distopia", "Mistério"],
  seguindo: false,
  seguidores: 128,
};

function carregarPerfil() {
  try {
    const salvo = localStorage.getItem("readduo_perfil");

    if (salvo) {
      return {
        ...perfilInicial,
        ...JSON.parse(salvo),
      };
    }
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }

  return perfilInicial;
}

function Perfil() {
  const [perfil, setPerfil] = useState(carregarPerfil);

  const [modalAberto, setModalAberto] = useState(false);

  const [formulario, setFormulario] = useState(perfil);

  const [mostrarAtividades, setMostrarAtividades] = useState(false);

  const [mostrarConquistas, setMostrarConquistas] = useState(false);

  const [mostrarAmigos, setMostrarAmigos] = useState(false);

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    localStorage.setItem("readduo_perfil", JSON.stringify(perfil));
  }, [perfil]);

  const porcentagemXP = Math.min(
    (perfil.xpAtual / perfil.xpMaximo) * 100,
    100
  );

  const abrirEdicao = () => {
    setFormulario(perfil);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setFormulario(perfil);
    setModalAberto(false);
  };

  const alterarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const salvarPerfil = (event) => {
    event.preventDefault();

    const interessesArray = formulario.interesses
      .toString()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const novoPerfil = {
      ...formulario,
      interesses: interessesArray,
    };

    setPerfil(novoPerfil);
    setModalAberto(false);

    setMensagem("Perfil atualizado com sucesso!");

    setTimeout(() => {
      setMensagem("");
    }, 3000);
  };

  const alternarSeguir = () => {
    setPerfil((anterior) => ({
      ...anterior,
      seguindo: !anterior.seguindo,
      seguidores: anterior.seguindo
        ? Math.max(anterior.seguidores - 1, 0)
        : anterior.seguidores + 1,
    }));
  };

  const mostrarMensagem = (texto) => {
    setMensagem(texto);

    setTimeout(() => {
      setMensagem("");
    }, 2500);
  };

  return (
    <div className={styles.container}>
      {/* =========================================
          HEADER
      ========================================= */}

      <div className={styles.header}>
        <div className={styles.titulo}>
          <User />
          <h1>Meu Perfil</h1>
        </div>
      </div>

      {/* =========================================
          CONTEÚDO PRINCIPAL
      ========================================= */}

      <div className={styles.layout}>
        {/* =====================================
            COLUNA ESQUERDA
        ===================================== */}

        <div className={styles.left}>
          {/* PERFIL */}

          <section className={styles.profileCard}>
            <div className={styles.avatar}>
              <User size={42} />
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.nomeLinha}>
                <h2>{perfil.nome}</h2>

                <BadgeCheck
                  size={18}
                  color="#4f7cff"
                  fill="rgba(79,124,255,0.12)"
                />
              </div>

              <p>
                Nível {perfil.nivel} • {perfil.tituloNivel}
              </p>

              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${porcentagemXP}%`,
                  }}
                />
              </div>

              <span>
                {perfil.xpAtual.toLocaleString("pt-BR")} /{" "}
                {perfil.xpMaximo.toLocaleString("pt-BR")} XP
              </span>

              <p className={styles.bio}>{perfil.bio}</p>

              <div className={styles.infoLinha}>
                <span>
                  <Calendar size={15} />
                  Membro desde {perfil.membroDesde}
                </span>

                <span>
                  <MapPin size={15} />
                  {perfil.localizacao}
                </span>

                <span>
                  <Heart size={15} />
                  {perfil.interesses.join(", ")}
                </span>
              </div>
            </div>

            <div className={styles.profileButtons}>
              <button
                className={`${styles.botaoPerfil} ${
                  perfil.seguindo ? styles.seguindo : ""
                }`}
                onClick={alternarSeguir}
              >
                {perfil.seguindo ? (
                  <>
                    <Check size={15} />
                    Seguindo
                  </>
                ) : (
                  <>
                    <Users size={15} />
                    Seguir
                  </>
                )}
              </button>

              <button
                className={styles.botaoPerfil}
                onClick={abrirEdicao}
              >
                <Pencil size={15} />
                Editar Perfil
              </button>
            </div>

            {/* SEGUIDORES */}

            <button
              className={styles.contadorSeguidores}
              onClick={() =>
                mostrarMensagem(
                  `${perfil.seguidores} seguidores`
                )
              }
            >
              <Users size={14} />
              {perfil.seguidores} seguidores
            </button>
          </section>

          {/* =====================================
              ATIVIDADE + GÊNEROS
          ===================================== */}

          <div className={styles.cards}>
            {/* ATIVIDADES */}

            <div className={styles.card}>
              <div className={styles.cardTitulo}>
                <h3>Atividade recente</h3>

                <span className={styles.cardQuantidade}>
                  {atividades.length}
                </span>
              </div>

              {(mostrarAtividades
                ? atividades
                : atividades.slice(0, 3)
              ).map((item, index) => (
                <div
                  className={styles.activity}
                  key={index}
                >
                  <div className={styles.activityTexto}>
                    <strong>{item.titulo}</strong>
                    <span>{item.subtitulo}</span>
                  </div>

                  <small>{item.tempo}</small>
                </div>
              ))}

              <button
                className={styles.verTudo}
                onClick={() =>
                  setMostrarAtividades(
                    (anterior) => !anterior
                  )
                }
              >
                {mostrarAtividades
                  ? "Mostrar menos"
                  : "Ver todas as atividades"}
              </button>
            </div>

            {/* GÊNEROS */}

            <div className={styles.card}>
              <h3>Gêneros mais lidos</h3>

              <div className={styles.generosConteudo}>
                <div className={styles.grafico}>
                  <div className={styles.circle}>
                    <div className={styles.circleCentro}>
                      <strong>5</strong>
                      <span>gêneros</span>
                    </div>
                  </div>
                </div>

                <ul className={styles.generos}>
                  <li>
                    <span className={styles.pontoFantasia} />
                    Fantasia
                    <strong>45%</strong>
                  </li>

                  <li>
                    <span className={styles.pontoDistopia} />
                    Distopia
                    <strong>20%</strong>
                  </li>

                  <li>
                    <span className={styles.pontoMisterio} />
                    Mistério
                    <strong>15%</strong>
                  </li>

                  <li>
                    <span className={styles.pontoFiccao} />
                    Ficção Científica
                    <strong>10%</strong>
                  </li>

                  <li>
                    <span className={styles.pontoOutros} />
                    Outros
                    <strong>10%</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* =====================================
              SEQUÊNCIA
          ===================================== */}

          <section className={styles.sequencia}>
            <div className={styles.seqTitulo}>
              <div>
                <Flame color="#fb923c" size={19} />
                <h2>Sequência de leitura</h2>
              </div>

              <span>8 dias</span>
            </div>

            <div className={styles.dias}>
              {dias.map((dia, index) => (
                <div
                  className={styles.dia}
                  key={index}
                >
                  <div className={styles.bolinha}>
                    <Check size={14} />
                  </div>

                  <small>{dia}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* =====================================
            COLUNA DIREITA
        ===================================== */}

        <div className={styles.right}>
          {/* ESTATÍSTICAS */}

          <div className={styles.statsGrid}>
            {estatisticas.map((item, index) => (
              <div
                className={styles.statCard}
                key={index}
              >
                <div className={styles.statIcon}>
                  {item.icone}
                </div>

                <small>{item.titulo}</small>

                <h3>{item.valor}</h3>

                <span>{item.extra}</span>
              </div>
            ))}
          </div>

          {/* CONQUISTAS */}

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <div>
                <Trophy size={17} />
                <h3>Conquistas recentes</h3>
              </div>

              <button
                onClick={() =>
                  setMostrarConquistas(
                    (anterior) => !anterior
                  )
                }
              >
                {mostrarConquistas
                  ? "Mostrar menos"
                  : "Ver todas"}
              </button>
            </div>

            {(mostrarConquistas
              ? conquistas
              : conquistas.slice(0, 3)
            ).map((item, index) => (
              <div
                className={styles.item}
                key={index}
              >
                <div className={styles.conquistaIcon}>
                  <Star
                    size={15}
                    fill="#61a6fa"
                    color="#61a6fa"
                  />
                </div>

                <div>
                  <strong>{item.titulo}</strong>
                  <span>{item.descricao}</span>
                </div>

                <small>{item.tempo}</small>
              </div>
            ))}
          </div>

          {/* AMIGOS */}

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <div>
                <Users size={17} />
                <h3>Amigos</h3>
              </div>

              <button
                onClick={() =>
                  setMostrarAmigos(
                    (anterior) => !anterior
                  )
                }
              >
                {mostrarAmigos
                  ? "Mostrar menos"
                  : "Ver todos"}
              </button>
            </div>

            {(mostrarAmigos
              ? amigos
              : amigos.slice(0, 3)
            ).map((item, index) => (
              <div
                className={styles.item}
                key={index}
              >
                <div className={styles.avatarMini}>
                  {item.nome.charAt(0)}
                </div>

                <div>
                  <strong>{item.nome}</strong>
                  <span>{item.nivel}</span>
                </div>

                <small
                  className={
                    item.status === "Online"
                      ? styles.statusOnline
                      : styles.statusOffline
                  }
                >
                  {item.status}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================
          MENSAGEM TEMPORÁRIA
      ========================================= */}

      {mensagem && (
        <div className={styles.toast}>
          <Check size={17} />
          {mensagem}
        </div>
      )}

      {/* =========================================
          MODAL EDITAR PERFIL
      ========================================= */}

      {modalAberto && (
        <div
          className={styles.modalOverlay}
          onClick={fecharModal}
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className={styles.modalHeader}>
              <div>
                <Pencil size={19} />
                <h2>Editar Perfil</h2>
              </div>

              <button
                className={styles.fecharModal}
                onClick={fecharModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className={styles.formulario}
              onSubmit={salvarPerfil}
            >
              <label>
                Nome
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    alterarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Biografia
                <textarea
                  value={formulario.bio}
                  onChange={(event) =>
                    alterarCampo(
                      "bio",
                      event.target.value
                    )
                  }
                  rows={3}
                  maxLength={180}
                />
              </label>

              <label>
                Localização
                <input
                  type="text"
                  value={formulario.localizacao}
                  onChange={(event) =>
                    alterarCampo(
                      "localizacao",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Interesses
                <input
                  type="text"
                  value={formulario.interesses.join(
                    ", "
                  )}
                  onChange={(event) =>
                    alterarCampo(
                      "interesses",
                      event.target.value
                    )
                  }
                  placeholder="Fantasia, Distopia, Mistério"
                />

                <small>
                  Separe os interesses por vírgula.
                </small>
              </label>

              <div className={styles.modalBotoes}>
                <button
                  type="button"
                  className={styles.cancelar}
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.salvar}
                >
                  <Save size={17} />
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;