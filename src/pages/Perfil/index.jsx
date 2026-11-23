import styles from "./index.module.css";

import { useEffect, useRef, useState } from "react";
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
  ImagePlus,
} from "lucide-react";



function Perfil() {
  const [us, setUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [seguindo, setSeguindo] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [formulario, setFormulario] = useState({ nome: "", bio: "", imagem: null });
  const [previewImagem, setPreviewImagem] = useState("");
  const [sequencia, setSequencia] = useState(0);
  const seletorImagem = useRef(null);

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
      imagem: null,
    });
    setPreviewImagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setPreviewImagem("");
  }

  async function selecionarImagem(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido.");
      return;
    }

    setFormulario((anterior) => ({ ...anterior, imagem: arquivo }));
    setPreviewImagem(URL.createObjectURL(arquivo));

    if (!modalAberto) {
      try {
        const usuarioAtualizado = {
          ...us,
          imagemArquivo: arquivo,
        };
        const usuarioId = us.id ?? us.Us_ID;
        const dados = montarDadosUsuario(
          usuarioAtualizado,
          us.Us_dt_ultimo_acesso
        );
        await api.put(`/usuarios/${usuarioId}`, dados);

        setUs((anterior) => ({ ...anterior, imagemArquivo: arquivo }));
        localStorage.setItem(
          "usuario",
          JSON.stringify({ ...us, imagemArquivo: undefined })
        );
        mostrarMensagem("Imagem do perfil atualizada.");
      } catch (error) {
        console.error("Erro ao atualizar imagem:", error);
        setErro("Não foi possível atualizar a imagem do perfil.");
      }
    }
  }

  function montarDadosUsuario(usuarioAtualizado, dataUltimoAcesso) {
    const dados = new FormData();
    // Nome
    const nome =
        usuarioAtualizado.US_nome ??
        usuarioAtualizado.nome;

    if (nome !== undefined) {
        dados.append("US_nome", nome);
    }

    // Biografia
    const biografia =
        usuarioAtualizado.Us_biografia ??
        usuarioAtualizado.biografia;

    if (biografia !== undefined) {
        dados.append("Us_biografia", biografia);
    }

    // Imagem nova
    if (usuarioAtualizado.imagemArquivo) {
        dados.append("img", usuarioAtualizado.imagemArquivo);
    }

    // Data de último acesso, somente quando informada
   if (dataUltimoAcesso) {
    const dataFormatada = new Date(dataUltimoAcesso)
        .toISOString()
        .slice(0, 10);

    dados.append("Us_dt_ultimo_acesso", dataFormatada);
}

    return dados;
}
  async function salvarPerfil(event) {
    event.preventDefault();
    const usuarioAtualizado = {
      ...us,
      nome: formulario.nome,
      US_nome: formulario.nome,
      Us_biografia: formulario.bio,
      imagemArquivo: formulario.imagem,
    };

    try {
      const usuarioId = usuarioAtualizado.id ?? usuarioAtualizado.Us_ID;
      const dados = montarDadosUsuario(usuarioAtualizado, usuarioAtualizado.Us_dt_ultimo_acesso);
      const resposta = await api.put(`/usuarios/${usuarioId}`, dados);
      const dadosAtualizados = resposta.data?.dados ?? resposta.data?.usuario ?? {};
      const usuarioSalvo = {
        ...usuarioAtualizado,
        ...dadosAtualizados,
        id: dadosAtualizados.Us_ID ?? usuarioAtualizado.id,
        nome: dadosAtualizados.US_nome ?? dadosAtualizados.Us_nome ?? formulario.nome,
        Us_biografia: dadosAtualizados.Us_biografia ?? formulario.bio,
        Us_imagem: dadosAtualizados.Us_imagem ?? dadosAtualizados.img ?? usuarioAtualizado.Us_imagem,
        imagemPerfil: dadosAtualizados.Us_imagem ?? dadosAtualizados.img ?? usuarioAtualizado.imagemPerfil,
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioSalvo));
      setUs(usuarioSalvo);
      fecharModal();
      mostrarMensagem("Perfil atualizado.");
    }catch (error) {
    console.error("ERRO AO SALVAR PERFIL:");
    console.error("Status:", error.response?.status);
    console.error("Resposta do backend:", error.response?.data);
    console.error("Erro completo:", error);

    setErro(
        error.response?.data?.dados ||
        error.response?.data?.mensagem ||
        "Não foi possível salvar as alterações do perfil."
    );
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
        biografia:
          usuarioEncontrado.Us_biografia ?? usuarioEncontrado.biografia ?? "",
        imagemPerfil:
          usuarioEncontrado.Us_imagem ??
          usuarioEncontrado.img ??
          "",
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

      const chaveSequencia = `readduo-sequencia-${usuarioId}`;
      const sequenciaSalva = localStorage.getItem(chaveSequencia);
      let registroAnterior = null;
      try {
        registroAnterior = sequenciaSalva ? JSON.parse(sequenciaSalva) : null;
      } catch {
        registroAnterior = null;
      }
      const ontemData = new Date(agora);
      ontemData.setDate(ontemData.getDate() - 1);
      const ontem = [
        ontemData.getFullYear(),
        String(ontemData.getMonth() + 1).padStart(2, "0"),
        String(ontemData.getDate()).padStart(2, "0"),
      ].join("-");

      let proximaSequencia;
      if (registroAnterior?.data === hoje) {
        proximaSequencia = Math.max(1, Number(registroAnterior.sequencia) || 1);
      } else if (
        registroAnterior?.data === ontem &&
        (dataUltimoAcessoLocal === ontem || dataUltimoAcessoLocal === hoje)
      ) {
        proximaSequencia = Math.max(1, Number(registroAnterior.sequencia) || 0) + 1;
      } else if (dataUltimoAcessoLocal === ontem) {
        proximaSequencia = 2;
      } else {
        proximaSequencia = 1;
      }

      localStorage.setItem(
        chaveSequencia,
        JSON.stringify({ data: hoje, sequencia: proximaSequencia })
      );
      setSequencia(proximaSequencia);

      if (dataUltimoAcessoLocal !== hoje) {
        try {
          const usuarioComAcesso = {
            ...usuarioPerfil,
            Us_dt_ultimo_acesso: hoje,
          };
          await api.put(
            `/usuarios/${usuarioId}`,
            montarDadosUsuario(usuarioComAcesso, hoje)
          );
        } catch (erroAcesso) {
          console.error("Erro ao registrar o último acesso:", erroAcesso);
        }
      }
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
            <div
              className={styles.avatar}
              role="button"
              tabIndex={0}
              aria-label="Editar imagem do perfil"
              onClick={() => seletorImagem.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  seletorImagem.current?.click();
                }
              }}
            >
              <img
                src={previewImagem || us.imagemPerfil || us.Us_imagem || us.imagem || us.img}
                alt="Avatar"
              />
            </div>

            <input
              ref={seletorImagem}
              type="file"
              accept="image/*"
              onChange={selecionarImagem}
              hidden
            />

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
              <div className={styles.imagemFormulario}>
                <button
                  type="button"
                  className={styles.avatarEdicao}
                  onClick={() => seletorImagem.current?.click()}
                >
                  <img
                    src={previewImagem || us.imagemPerfil || us.Us_imagem || us.imagem || us.img}
                    alt="Prévia da imagem do perfil"
                  />
                  <span>
                    <ImagePlus size={16} />
                    Editar imagem
                  </span>
                </button>
              </div>

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