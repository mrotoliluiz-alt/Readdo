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



function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fetchDados = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuario");
      setUsuario(response.data.dados);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setErro("Erro ao carregar dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  if (loading && usuario.length === 0) return <p>Carregando usuario...</p>
  if (erro) return <p>{erro}</p>

  return (
    <div className={styles.container}>

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