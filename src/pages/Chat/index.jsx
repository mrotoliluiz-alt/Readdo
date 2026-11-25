import styles from "./index.module.css";

import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
  MessageCircle,
  Search,
  SquarePen,
  Send,
  Users,
  Lightbulb,
  ChevronRight,
  ArrowLeft,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";

function obterLista(resposta, recurso) {
  const dados = resposta.data?.dados ?? resposta.data;
  if (!Array.isArray(dados)) {
    throw new Error(`A resposta de ${recurso} não contém uma lista.`);
  }
  return dados;
}

function normalizarUsuario(usuario) {
  return {
    ...usuario,
    id: Number(usuario.Us_ID ?? usuario.id),
    nome:
      usuario.US_nome ??
      usuario.Us_nome ??
      usuario.nome ??
      "",
    imagem:
      usuario.Us_imagem ??
      usuario.img ??
      usuario.imagemPerfil ??
      usuario.imagem ??
      "",
  };
}

function formatarHorario(data) {
  const instante = new Date(data);
  if (Number.isNaN(instante.getTime())) return "";
  return instante.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataHoraSql(data) {
  const dataLocal = new Date(data);
  const pad = (valor) => String(valor).padStart(2, "0");

  return `${dataLocal.getFullYear()}-${pad(dataLocal.getMonth() + 1)}-${pad(
    dataLocal.getDate()
  )} ${pad(dataLocal.getHours())}:${pad(dataLocal.getMinutes())}:${pad(
    dataLocal.getSeconds()
  )}`;
}

function formatarTempo(data) {
  const instante = new Date(data);
  if (Number.isNaN(instante.getTime())) return "";

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (instante.toDateString() === hoje.toDateString()) {
    return formatarHorario(instante);
  }
  if (instante.toDateString() === ontem.toDateString()) {
    return "Ontem";
  }
  return instante.toLocaleDateString("pt-BR");
}

function urlImagem(imagem) {
  if (!imagem) return "";
  if (/^(https?:|data:|blob:)/i.test(imagem)) return imagem;
  const baseUrl = api.defaults.baseURL.replace(/\/$/, "");
  return `${baseUrl}/${imagem.replace(/^\//, "")}`;
}

function Avatar({ nome, imagem, grupo = false, className }) {
  return (
    <div
      className={`${className} ${grupo ? styles.avatarGrupo : ""}`}
      aria-hidden="true"
    >
      {grupo ? (
        <Users size={20} />
      ) : imagem ? (
        <img src={urlImagem(imagem)} alt="" />
      ) : (
        nome.charAt(0).toUpperCase()
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

function Chat() {
  const [conversas, setConversas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAtualId, setUsuarioAtualId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");

  const [conversaSelecionada, setConversaSelecionada] =
    useState(null);

  const [busca, setBusca] = useState("");

  const [mensagem, setMensagem] = useState("");

  const [mostrarNovaConversa, setMostrarNovaConversa] =
    useState(false);

  const [usuarioId, setUsuarioId] = useState("");

  const [erroUsuario, setErroUsuario] = useState("");

  const [criandoConversa, setCriandoConversa] =
    useState(false);
  const [enviandoMensagem, setEnviandoMensagem] =
    useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  useEffect(() => {
    let requisicaoAtiva = true;

    async function carregarConversas() {
      try {
        const usuarioSalvo = JSON.parse(
          localStorage.getItem("usuario") || "null"
        );
        const idAtual = Number(usuarioSalvo?.Us_ID ?? usuarioSalvo?.id);
        if (!Number.isInteger(idAtual) || idAtual <= 0) {
          throw new Error("Não foi possível identificar o usuário conectado.");
        }

        const [respostaChats, respostaUsuarios] = await Promise.all([
          api.get("/chat"),
          api.get("/usuarios"),
        ]);
        const chats = obterLista(respostaChats, "/chat");
        const listaUsuarios = obterLista(respostaUsuarios, "/usuarios")
          .map(normalizarUsuario)
          .filter((usuario) => Number.isInteger(usuario.id));
        const usuariosPorId = new Map(
          listaUsuarios.map((usuario) => [usuario.id, usuario])
        );
        const chatsDoUsuario = chats
          .filter((chat) => {
            const remetente = Number(chat.Chat_remetente);
            const destinatario = Number(chat.Chat_destinatario);
            return remetente === idAtual || destinatario === idAtual;
          })
          .sort(
            (a, b) =>
              new Date(a.Chat_data_hora).getTime() -
                new Date(b.Chat_data_hora).getTime() ||
              Number(a.Chat_ID) - Number(b.Chat_ID)
          );
        const conversasPorUsuario = new Map();

        chatsDoUsuario.forEach((chat) => {
          const remetente = Number(chat.Chat_remetente);
          const destinatario = Number(chat.Chat_destinatario);
          const outroUsuarioId =
            remetente === idAtual ? destinatario : remetente;
          const outroUsuario = usuariosPorId.get(outroUsuarioId);
          const nome = outroUsuario?.nome || `Usuário ${outroUsuarioId}`;
          const texto = chat.Chat_mensagem ?? "";
          const mensagemChat = {
            id: chat.Chat_ID,
            autor: remetente === idAtual ? "Você" : nome,
            texto,
            horario: formatarHorario(chat.Chat_data_hora),
            propria: remetente === idAtual,
          };
          const idConversa = `usuario-${outroUsuarioId}`;
          const conversa =
            conversasPorUsuario.get(idConversa) || {
              id: idConversa,
              usuarioId: outroUsuarioId,
              chatId: null,
              remetenteId: null,
              destinatarioId: null,
              nome,
              imagem: outroUsuario?.imagem || "",
              mensagem: "",
              tempo: "",
              online: false,
              grupo: false,
              mensagens: [],
            };

          conversa.mensagens.push(mensagemChat);
          conversa.chatId = Number(chat.Chat_ID);
          conversa.remetenteId = remetente;
          conversa.destinatarioId = destinatario;
          conversa.mensagem = texto || "Nova conversa";
          conversa.tempo = formatarTempo(chat.Chat_data_hora);
          conversasPorUsuario.set(idConversa, conversa);
        });

        if (requisicaoAtiva) {
          setUsuarioAtualId(idAtual);
          setUsuarios(listaUsuarios);
          setConversas(Array.from(conversasPorUsuario.values()));
        }
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
        if (requisicaoAtiva) {
          setErroCarregamento(
            error.response?.data?.mensagem ||
              error.message ||
              "Não foi possível carregar as conversas."
          );
        }
      } finally {
        if (requisicaoAtiva) setCarregando(false);
      }
    }

    carregarConversas();
    return () => {
      requisicaoAtiva = false;
    };
  }, []);

  /* =======================================================
     CONVERSAS FILTRADAS
  ======================================================= */

  const conversasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return conversas;
    }

    return conversas.filter((conversa) => {
      return (
        conversa.nome.toLowerCase().includes(termo) ||
        conversa.mensagem.toLowerCase().includes(termo)
      );
    });
  }, [busca, conversas]);

  /* =======================================================
     CONVERSA ATUAL
  ======================================================= */

  const conversaAtual = conversas.find(
    (conversa) => conversa.id === conversaSelecionada
  );

  /* =======================================================
     SELECIONAR CONVERSA
  ======================================================= */

  const selecionarConversa = (id) => {
    setConversaSelecionada(id);
  };

  /* =======================================================
     ENVIAR MENSAGEM
  ======================================================= */

  const enviarMensagem = async () => {
    const texto = mensagem.trim();

    if (!texto || !conversaAtual || enviandoMensagem) {
      return;
    }

    setEnviandoMensagem(true);
    setErroEnvio("");

    try {
      const agora = new Date();
      const dataHora = agora.toISOString();
      const resposta = await api.post("/chat", {
        chat_remetente: usuarioAtualId,
        chat_destinatario: conversaAtual.usuarioId,
        chat_data_hora: formatarDataHoraSql(agora),
        chat_mensagem: texto,
        chat_status: 1,
      });
      const dadosResposta = resposta.data?.dados ?? resposta.data;
      const chatSalvo = Array.isArray(dadosResposta)
        ? dadosResposta[0]
        : dadosResposta;
      const chatId = Number(chatSalvo?.Chat_ID);
      if (!Number.isInteger(chatId) || chatId <= 0) {
        throw new Error(
          "A API não retornou o ID da mensagem criada."
        );
      }
      const novaMensagem = {
        id: chatId,
        autor: "Você",
        texto: chatSalvo?.chat_mensagem ?? chatSalvo?.Chat_mensagem ?? texto,
        horario: formatarHorario(
          chatSalvo?.chat_data_hora ?? chatSalvo?.Chat_data_hora ?? dataHora
        ),
        propria: true,
      };

      setConversas((lista) =>
        lista.map((conversa) =>
          conversa.id === conversaAtual.id
            ? {
                ...conversa,
                chatId,
                remetenteId:
                  conversa.remetenteId ?? usuarioAtualId,
                destinatarioId:
                  conversa.destinatarioId ?? conversa.usuarioId,
                mensagem: novaMensagem.texto,
                tempo: formatarTempo(
                  chatSalvo?.chat_data_hora ??
                    chatSalvo?.Chat_data_hora ??
                    dataHora
                ),
                mensagens: [...conversa.mensagens, novaMensagem],
              }
            : conversa
        )
      );
      setMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const dadosErro = error.response?.data;
      setErroEnvio(
        dadosErro?.mensagem ||
          dadosErro?.erro ||
          dadosErro?.message ||
          dadosErro?.dados ||
          (typeof dadosErro === "string" ? dadosErro : "") ||
        (dadosErro ? JSON.stringify(dadosErro) : "") ||
        "Não foi possível enviar a mensagem. Verifique os dados do chat e tente novamente."
      );
    } finally {
      setEnviandoMensagem(false);
    }
  };

  /* =======================================================
     ENTER PARA ENVIAR
  ======================================================= */

  const pressionarEnter = (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      enviarMensagem();
    }
  };

  /* =======================================================
     ABRIR MODAL
  ======================================================= */

  const abrirNovaConversa = () => {
    setUsuarioId("");
    setErroUsuario("");
    setMostrarNovaConversa(true);
  };

  /* =======================================================
     FECHAR MODAL
  ======================================================= */

  const fecharNovaConversa = () => {
    setMostrarNovaConversa(false);
    setUsuarioId("");
    setErroUsuario("");
  };

  /* =======================================================
     CRIAR CONVERSA
  ======================================================= */

  const criarConversa = async () => {
    const idInformado = usuarioId.trim();

    if (!idInformado) {
      setErroUsuario("Digite o ID do usuário.");
      return;
    }

    if (!/^\d+$/.test(idInformado)) {
      setErroUsuario(
        "O ID do usuário deve conter apenas números."
      );
      return;
    }

    setCriandoConversa(true);
    setErroUsuario("");

    try {
      const usuarioIdInformado = Number(idInformado);
      if (usuarioIdInformado === usuarioAtualId) {
        setErroUsuario("Informe o ID de outro usuário.");
        return;
      }
      const usuario = usuarios.find(
        (item) => item.id === usuarioIdInformado
      );

      /* Usuário não existe */

      if (!usuario) {
        setErroUsuario(
          "Nenhum usuário foi encontrado com esse ID."
        );

        return;
      }

      /* Verifica se a conversa já existe */

      const conversaExistente = conversas.find(
        (conversa) =>
          conversa.usuarioId === usuario.id &&
          !conversa.grupo
      );

      if (conversaExistente) {
        setConversaSelecionada(conversaExistente.id);
        fecharNovaConversa();
        return;
      }

      /* Cria a nova conversa */

      const novaConversa = {
        id: `usuario-${usuario.id}`,

        usuarioId: usuario.id,

        nome: usuario.nome,

        imagem: usuario.imagem,

        mensagem: "",

        tempo: "",

        online: false,

        grupo: false,

        mensagens: [],
      };

      setConversas((lista) => [novaConversa, ...lista]);

      setConversaSelecionada(novaConversa.id);

      fecharNovaConversa();
    } finally {
      setCriandoConversa(false);
    }
  };

  /* =======================================================
     EXCLUIR CONVERSA
  ======================================================= */

  const excluirConversa = (id, evento = null) => {
    if (evento) {
      evento.stopPropagation();
    }

    const conversa = conversas.find(
      (item) => item.id === id
    );

    if (!conversa) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja excluir a conversa com "${conversa.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    setConversas((lista) =>
      lista.filter((item) => item.id !== id)
    );

    if (conversaSelecionada === id) {
      setConversaSelecionada(null);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className={styles.container}>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className={styles.header}>

        <div className={styles.titulo}>
          <MessageCircle size={30} />
          <h1>Chat</h1>
        </div>

        <p>
          Converse, compartilhe ideias e aprenda com
          outros leitores e escritores.
        </p>

      </header>

      {/* ===================================================
          ÁREA DO CHAT
      =================================================== */}

      <section className={styles.chatArea}>

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <aside className={styles.sidebar}>

          {/* PESQUISA */}

          <div className={styles.searchArea}>

            <div className={styles.searchBar}>

              <input
                type="text"
                placeholder="Buscar conversas..."
                value={busca}
                onChange={(evento) =>
                  setBusca(evento.target.value)
                }
              />

              <Search size={18} />

            </div>

            <button
              type="button"
              className={styles.novaConversa}
              onClick={abrirNovaConversa}
              title="Nova conversa"
            >
              <SquarePen size={18} />
            </button>

          </div>

          {/* LISTA DE CONVERSAS */}

          {carregando ? (
            <div className={styles.semConversa}>
              <p>Carregando conversas...</p>
            </div>
          ) : erroCarregamento ? (
            <div className={styles.semConversa}>
              <h3>Não foi possível carregar as conversas</h3>
              <p>{erroCarregamento}</p>
            </div>
          ) : conversasFiltradas.length === 0 ? (

            <div className={styles.semConversa}>

              <MessageCircle size={48} />

              <h3>
                Nenhuma conversa encontrada
              </h3>

              <p>
                Tente pesquisar por outro nome
                ou inicie uma nova conversa.
              </p>

              <button
                type="button"
                onClick={abrirNovaConversa}
              >
                <SquarePen size={16} />
                Nova conversa
              </button>

            </div>

          ) : (

            <div className={styles.listaConversas}>

              {conversasFiltradas.map((item) => {

                const selecionada =
                  item.id === conversaSelecionada;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`
                      ${styles.conversa}
                      ${
                        selecionada
                          ? styles.conversaAtiva
                          : ""
                      }
                    `}
                    onClick={() =>
                      selecionarConversa(item.id)
                    }
                  >

                    {/* AVATAR */}

                    <Avatar
                      nome={item.nome}
                      imagem={item.imagem}
                      grupo={item.grupo}
                      className={styles.avatar}
                    />

                    {/* INFORMAÇÕES */}

                    <div className={styles.info}>

                      <strong>
                        {item.nome}
                      </strong>

                      <span>
                        {item.mensagem}
                      </span>

                    </div>

                    {/* DIREITA */}

                    <div className={styles.direita}>

                      <small>
                        {item.tempo}
                      </small>

                      {item.online && (
                        <div
                          className={styles.online}
                        />
                      )}

                      {/* BOTÃO EXCLUIR */}

                      <span
                        role="button"
                        tabIndex={0}
                        className={
                          styles.botaoExcluir
                        }
                        title="Excluir conversa"
                        onClick={(evento) =>
                          excluirConversa(
                            item.id,
                            evento
                          )
                        }
                        onKeyDown={(evento) => {
                          if (
                            evento.key === "Enter" ||
                            evento.key === " "
                          ) {
                            evento.preventDefault();

                            excluirConversa(
                              item.id,
                              evento
                            );
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>
          )}

          {/* DICA */}

          <div className={styles.dica}>

            <Lightbulb size={18} />

            <div>

              <strong>Dica</strong>

              <p>
                Converse sobre livros,
                personagens e suas histórias
                favoritas.
              </p>

            </div>

          </div>

        </aside>

        {/* =================================================
            CHAT
        ================================================== */}

        <main className={styles.chat}>

          {!conversaAtual ? (

            /* =============================================
               ESTADO VAZIO
            ============================================== */

            <div className={styles.chatVazio}>

              <div className={styles.iconeVazio}>
                <MessageCircle size={64} />
              </div>

              <h2>
                Selecione uma conversa
              </h2>

              <p>
                Escolha uma conversa existente ou
                inicie uma nova para conversar sobre
                livros, escrita e leitura.
              </p>

              <button
                type="button"
                onClick={abrirNovaConversa}
              >
                <SquarePen size={18} />
                Nova conversa
              </button>

            </div>

          ) : (

            /* =============================================
               CONVERSA ABERTA
            ============================================== */

            <div className={styles.conversaAberta}>

              {/* HEADER DA CONVERSA */}

              <div className={styles.chatHeader}>

                <button
                  type="button"
                  className={styles.voltar}
                  onClick={() =>
                    setConversaSelecionada(null)
                  }
                  title="Voltar"
                >
                  <ArrowLeft size={20} />
                </button>

                <Avatar
                  nome={conversaAtual.nome}
                  imagem={conversaAtual.imagem}
                  grupo={conversaAtual.grupo}
                  className={styles.avatar}
                />

                <div className={styles.chatPessoa}>

                  <strong>
                    {conversaAtual.nome}
                  </strong>

                  <span>
                    {conversaAtual.grupo
                      ? "Grupo"
                      : conversaAtual.online
                      ? "Online"
                      : "Offline"}
                  </span>

                </div>

                {/* EXCLUIR */}

                <button
                  type="button"
                  className={styles.excluirChat}
                  title="Excluir conversa"
                  onClick={() =>
                    excluirConversa(
                      conversaAtual.id
                    )
                  }
                >
                  <Trash2 size={18} />
                </button>

              </div>

              {/* MENSAGENS */}

              <div className={styles.mensagens}>

                {conversaAtual.mensagens.length ===
                0 ? (

                  <div className={styles.semMensagens}>

                    <MessageCircle size={38} />

                    <h3>
                      Comece a conversa
                    </h3>

                    <p>
                      Envie uma mensagem para iniciar
                      esta conversa.
                    </p>

                  </div>

                ) : (

                  conversaAtual.mensagens.map(
                    (item) => (

                      <div
                        key={item.id}
                        className={`
                          ${styles.mensagemLinha}
                          ${
                            item.propria
                              ? styles.mensagemPropria
                              : ""
                          }
                        `}
                      >

                        {!item.propria && (
                          <div className={styles.miniAvatar}>
                            {conversaAtual.imagem ? (
                              <img
                                src={urlImagem(conversaAtual.imagem)}
                                alt=""
                              />
                            ) : (
                              item.autor.charAt(0).toUpperCase()
                            )}
                          </div>
                        )}

                        <div
                          className={
                            styles.mensagemConteudo
                          }
                        >

                          {!item.propria && (
                            <span
                              className={
                                styles.autor
                              }
                            >
                              {item.autor}
                            </span>
                          )}

                          <div
                            className={
                              styles.balao
                            }
                          >

                            <span>
                              {item.texto}
                            </span>

                            <small>
                              {item.horario}
                            </small>

                          </div>

                        </div>

                      </div>

                    )
                  )
                )}

              </div>

              {/* ÁREA DE ENVIO */}

              {erroEnvio && (
                <p className={styles.erroEnvio}>{erroEnvio}</p>
              )}

              <div className={styles.areaMensagem}>

                <textarea
                  value={mensagem}
                  onChange={(evento) =>
                    {
                      setMensagem(evento.target.value);
                      setErroEnvio("");
                    }
                  }
                  onKeyDown={pressionarEnter}
                  placeholder="Digite uma mensagem..."
                  rows={1}
                  disabled={enviandoMensagem}
                />

                <button
                  type="button"
                  className={styles.botaoEnviar}
                  onClick={enviarMensagem}
                  disabled={!mensagem.trim() || enviandoMensagem}
                  title="Enviar mensagem"
                >
                  {enviandoMensagem ? "..." : <Send size={19} />}
                </button>

              </div>

            </div>
          )}

        </main>

      </section>

      {/* ===================================================
          MODAL — NOVA CONVERSA
      =================================================== */}

      {mostrarNovaConversa && (

        <div
          className={styles.overlay}
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              fecharNovaConversa();
            }
          }}
        >

          <div className={styles.modal}>

            {/* HEADER DO MODAL */}

            <div className={styles.modalHeader}>

              <div className={styles.modalTituloArea}>

                <span className={styles.modalIcone}>
                  <UserPlus size={20} />
                </span>

                <div>

                  <h2>
                    Nova conversa
                  </h2>

                  <p>
                    Informe o ID de um usuário
                    existente no Readduo.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={fecharNovaConversa}
                className={styles.fecharModal}
                title="Fechar"
              >
                <X size={20} />
              </button>

            </div>

            {/* CORPO */}

            <div className={styles.modalCorpo}>

              <label htmlFor="usuarioId">
                ID do usuário
              </label>

              <input
                id="usuarioId"
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 2"
                value={usuarioId}
                onChange={(evento) => {
                  setUsuarioId(
                    evento.target.value
                  );

                  setErroUsuario("");
                }}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    criarConversa();
                  }
                }}
                autoFocus
              />

              {erroUsuario && (
                <span className={styles.erroUsuario}>
                  {erroUsuario}
                </span>
              )}

              <div className={styles.infoUsuario}>

                <Users size={16} />

                <span>
                  Digite o ID de um usuário
                  cadastrado para iniciar uma
                  conversa.
                </span>

              </div>

            </div>

            {/* FOOTER */}

            <div className={styles.modalFooter}>

              <button
                type="button"
                className={styles.cancelar}
                onClick={fecharNovaConversa}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.criar}
                onClick={criarConversa}
                disabled={
                  !usuarioId.trim() ||
                  criandoConversa
                }
              >

                {criandoConversa ? (
                  "Verificando..."
                ) : (
                  <>
                    <MessageCircle size={17} />

                    Iniciar conversa

                    <ChevronRight size={17} />
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Chat;