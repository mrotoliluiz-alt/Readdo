import styles from "./index.module.css";

import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  User,
  BookOpen,
  Flame,
  Star,
  BadgeCheck,
  Pencil,
  X,
  Users,
  Check,
  Save,
  Trophy,
} from "lucide-react";



function Perfil() {
  const [us, setUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [seguindo, setSeguindo] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [formulario, setFormulario] = useState({ nome: "", bio: "" });
  const [sequencia, setSequencia] = useState(0);

  const atividades = [];
  const conquistas = [];
  const amigos = [];
  const dias = Array.from({ length: Math.min(sequencia, 7) }, (_, index) => {
    const data = new Date();
    data.setDate(data.getDate() - (Math.min(sequencia, 7) - index - 1));
    return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(data);
  });
  const estatisticas = us
    ? [
        {
          titulo: "Nível",
          valor: us.nivel ?? "—",
          extra: "Nível atual",
          icone: <BookOpen size={17} />,
        },
        {
          titulo: "Experiência",
          valor: us.xpTotal ?? "—",
          extra: "XP acumulado",
          icone: <Flame size={17} />,
        },
      ]
    : [];

  function mostrarMensagem(texto) {
    setMensagem(texto);
    window.setTimeout(() => setMensagem(""), 2500);
  }

  function abrirEdicao() {
    setFormulario({
      nome: us.nome,
      bio: us.Us_biografia ?? "",
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function salvarPerfil(event) {
    event.preventDefault();
    const usuarioAtualizado = {
      ...us,
      nome: formulario.nome,
      Us_biografia: formulario.bio,
    };

    try {
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      setUs(usuarioAtualizado);
      fecharModal();
      mostrarMensagem("Perfil atualizado.");
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
      setErro("Não foi possível salvar as alterações do perfil.");
    }
  }

  useEffect(() => {
    async function carregarUsuario() {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");
      if (!usuarioSalvo) {
        setErro("Não foi possível carregar os dados do usuário.");
        return;
      }

      const usuarioAtual = JSON.parse(usuarioSalvo);
      const usuarioId = Number(usuarioAtual?.Us_ID ?? usuarioAtual?.id);
      if (!Number.isFinite(usuarioId)) {
        throw new Error("O usuário salvo não possui um ID válido.");
      }

      const resposta = await api.get("/usuarios");
      const usuarios = Array.isArray(resposta.data)
        ? resposta.data
        : resposta.data?.dados;
      if (!Array.isArray(usuarios)) {
        throw new Error("A resposta de /usuarios não contém uma lista de usuários.");
      }

      const usuarioEncontrado = usuarios.find(
        (usuario) => Number(usuario.Us_ID ?? usuario.id) === usuarioId
      );
      if (!usuarioEncontrado) {
        throw new Error("O usuário atual não foi encontrado em /usuarios.");
      }

      const usuarioPerfil = {
        ...usuarioEncontrado,
        id: usuarioEncontrado.Us_ID ?? usuarioEncontrado.id,
        nome:
          usuarioEncontrado.US_nome ??
          usuarioEncontrado.Us_nome ??
          usuarioEncontrado.nome ??
          "",
        nivel: usuarioEncontrado.Us_nivel ?? usuarioEncontrado.nivel,
        xpTotal:
          usuarioEncontrado.Us_XP_total ?? usuarioEncontrado.xpTotal,
      };
      setUs(usuarioPerfil);
      localStorage.setItem("usuario", JSON.stringify(usuarioPerfil));

      const agora = new Date();
      const hoje = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0"),
      ].join("-");
      const ultimoAcesso = usuarioEncontrado.Us_dt_ultimo_acesso;
      const dataUltimoAcesso = ultimoAcesso ? new Date(ultimoAcesso) : null;
      const dataUltimoAcessoLocal =
        dataUltimoAcesso && !Number.isNaN(dataUltimoAcesso.getTime())
          ? [
              dataUltimoAcesso.getFullYear(),
              String(dataUltimoAcesso.getMonth() + 1).padStart(2, "0"),
              String(dataUltimoAcesso.getDate()).padStart(2, "0"),
            ].join("-")
          : null;

      if (dataUltimoAcessoLocal !== hoje) {
        setSequencia(0);
        return;
      }

      const chaveSequencia = `readduo-sequencia-${usuarioId}`;
      const sequenciaSalva = localStorage.getItem(chaveSequencia);
      const registroAnterior = sequenciaSalva
        ? JSON.parse(sequenciaSalva)
        : null;
      const ontemData = new Date(agora);
      ontemData.setDate(ontemData.getDate() - 1);
      const ontem = [
        ontemData.getFullYear(),
        String(ontemData.getMonth() + 1).padStart(2, "0"),
        String(ontemData.getDate()).padStart(2, "0"),
      ].join("-");

      const proximaSequencia =
        registroAnterior?.data === hoje
          ? Math.max(1, Number(registroAnterior.sequencia) || 1)
          : registroAnterior?.data === ontem
            ? Math.max(1, Number(registroAnterior.sequencia) || 0) + 1
            : 1;

      localStorage.setItem(
        chaveSequencia,
        JSON.stringify({ data: hoje, sequencia: proximaSequencia })
      );
      setSequencia(proximaSequencia);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setErro("Erro ao carregar dados do usuário.");
    } finally {
      setLoading(false);
    }
    }

    carregarUsuario();
  }, []);


  if (loading) return <p>Carregando usuario...</p>
  if (erro) return <p>{erro}</p>
  if (!us) return <p>Não foi possível carregar os dados do usuário.</p>

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <div className={styles.titulo}>
          <User />
          <h1>Meu Perfil</h1>
        </div>
      </div>

      <div className={styles.layout}>

        <div className={styles.left}>

          <section className={styles.profileCard}>
            <div className={styles.avatar}>
              <User size={42} />
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.nomeLinha}>
                <h2 key={us.id}>{us.nome}</h2>

                <BadgeCheck
                  size={18}
                  color="#4f7cff"
                  fill="rgba(79,124,255,0.12)"
                />
              </div>

              <p key={us.id} className={styles.nivel}>
                Nível {us.nivel ?? "—"}
              </p>

              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  key={us.id}
                />
                {us.xpTotal ?? 0} XP
              </div>

              <p className={styles.bio}>{us.Us_biografia || "Adicione uma biografia ao seu perfil."}</p>

            </div>

            <div className={styles.profileButtons}>
              <button
                className={`${styles.botaoPerfil} ${
                  seguindo ? styles.seguindo : ""
                }`}
                onClick={() => setSeguindo((anterior) => !anterior)}
              >
                {seguindo ? (
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


            <button
              className={styles.contadorSeguidores}
              onClick={() =>
                mostrarMensagem(
                  ` seguidores`
                )
              }
            >
              <Users size={14} />
             seguidores
            </button>
          </section>


          <div className={styles.cards}>

            <div className={styles.card}>
              <div className={styles.cardTitulo}>
                <h3>Atividade recente</h3>

                <span className={styles.cardQuantidade}>
                  {atividades.length}
                </span>
              </div>

              {atividades.length === 0 && (
                <p>Nenhuma atividade recente.</p>
              )}
              {atividades.map((item, index) => (
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

              {atividades.length > 3 && (
                <button className={styles.verTudo} type="button">
                  Ver todas
                </button>
              )}
            </div>


            <div className={styles.card}>
              <h3>Gêneros mais lidos</h3>

              <p>Seus gêneros mais lidos aparecerão aqui.</p>
            </div>
          </div>


          <section className={styles.sequencia}>
            <div className={styles.seqTitulo}>
              <div>
                <Flame color="#fb923c" size={19} />
                <h2>Sequência de leitura</h2>
              </div>

              <span>{dias.length} dias</span>
            </div>

            <div className={styles.dias}>
              {dias.length === 0 && <p>Sem sequência de leitura registrada.</p>}
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

        <div className={styles.right}>

          <div className={styles.statsGrid}>
            {estatisticas.map((item) => (
              <div
                className={styles.statCard}
                key={item.titulo}
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


          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <div>
                <Trophy size={17} />
                <h3>Conquistas recentes</h3>
              </div>

              <button type="button" aria-label="Conquistas recentes" />
            </div>

            {conquistas.length === 0 && <p>Nenhuma conquista recente.</p>}
            {conquistas.map((item, index) => (
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


          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <div>
                <Users size={17} />
                <h3>Amigos</h3>
              </div>

              <button type="button" aria-label="Amigos" />
            </div>

            {amigos.length === 0 && <p>Nenhum amigo para exibir.</p>}
            {amigos.map((item, index) => (
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



        {mensagem && (
          <div className={styles.toast}>
            <Check size={17} />
            {mensagem}
          </div>
        )}

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
                type="button"
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
                    setFormulario({ ...formulario, nome: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Biografia
                <textarea
                  value={formulario.bio}
                  onChange={(event) =>
                    setFormulario({ ...formulario, bio: event.target.value })
                  }
                  rows={3}
                  maxLength={180}
                />
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