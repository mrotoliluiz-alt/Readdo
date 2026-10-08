import styles from "./index.module.css";

import { useMemo, useState } from "react";

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

/* =========================================================
   USUÁRIOS MOCK

   Futuramente esses usuários virão do banco através da
   tabela USUARIO.

   Para testar:
   ID 2 = Mariana Costa
   ID 3 = Lucas Ferreira
   ID 4 = Rafael Monteiro
   ID 5 = Ana Beatriz
========================================================= */

const usuariosMock = [
  {
    id: 2,
    nome: "Mariana Costa",
    online: true,
  },
  {
    id: 3,
    nome: "Lucas Ferreira",
    online: true,
  },
  {
    id: 4,
    nome: "Rafael Monteiro",
    online: false,
  },
  {
    id: 5,
    nome: "Ana Beatriz",
    online: true,
  },
];

/* =========================================================
   CONVERSAS MOCK
========================================================= */

const conversasIniciais = [
  {
    id: 1,
    usuarioId: 2,
    nome: "Mariana Costa",
    mensagem: "Você terminou Duna?",
    tempo: "09:32",
    online: true,
    grupo: false,

    mensagens: [
      {
        id: 1,
        autor: "Mariana Costa",
        texto: "Oi! Você terminou Duna?",
        horario: "09:30",
        propria: false,
      },
      {
        id: 2,
        autor: "Você",
        texto: "Ainda não! Estou quase terminando.",
        horario: "09:31",
        propria: true,
      },
      {
        id: 3,
        autor: "Mariana Costa",
        texto: "Nossa, você está na melhor parte!",
        horario: "09:32",
        propria: false,
      },
    ],
  },

  {
    id: 2,
    usuarioId: null,
    nome: "Clube da Distopia",
    mensagem: "Nova discussão iniciada.",
    tempo: "Ontem",
    online: false,
    grupo: true,

    mensagens: [
      {
        id: 1,
        autor: "Mariana Costa",
        texto: "Pessoal, alguém já leu 1984?",
        horario: "18:20",
        propria: false,
      },
      {
        id: 2,
        autor: "Lucas Ferreira",
        texto: "Comecei ontem. Estou gostando bastante.",
        horario: "18:35",
        propria: false,
      },
      {
        id: 3,
        autor: "Você",
        texto: "Também estou lendo! Podemos discutir depois.",
        horario: "19:02",
        propria: true,
      },
    ],
  },

  {
    id: 3,
    usuarioId: 3,
    nome: "Lucas Ferreira",
    mensagem: "Gostei muito da sua história!",
    tempo: "Seg",
    online: true,
    grupo: false,

    mensagens: [
      {
        id: 1,
        autor: "Lucas Ferreira",
        texto: "Ei! Li sua história nova.",
        horario: "14:20",
        propria: false,
      },
      {
        id: 2,
        autor: "Lucas Ferreira",
        texto: "Gostei muito da sua história!",
        horario: "14:21",
        propria: false,
      },
      {
        id: 3,
        autor: "Você",
        texto: "Sério? Muito obrigado!",
        horario: "14:25",
        propria: true,
      },
    ],
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

function Chat() {
  const [conversas, setConversas] = useState(conversasIniciais);

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

  const enviarMensagem = () => {
    const texto = mensagem.trim();

    if (!texto || !conversaAtual) {
      return;
    }

    const horario = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const novaMensagem = {
      id: Date.now(),
      autor: "Você",
      texto,
      horario,
      propria: true,
    };

    setConversas((lista) =>
      lista.map((conversa) => {
        if (conversa.id !== conversaAtual.id) {
          return conversa;
        }

        return {
          ...conversa,
          mensagem: texto,
          tempo: "Agora",
          mensagens: [
            ...conversa.mensagens,
            novaMensagem,
          ],
        };
      })
    );

    setMensagem("");
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
     BUSCAR USUÁRIO PELO ID

     MOCK ATUAL.

     FUTURAMENTE:

     const resposta = await fetch(
       `http://localhost:3000/usuarios/${id}`
     );

     const dados = await resposta.json();

     return dados.dados;
  ======================================================= */

  const buscarUsuarioPorId = async (id) => {
    const usuario = usuariosMock.find(
      (item) => item.id === Number(id)
    );

    return usuario || null;
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
      const usuario = await buscarUsuarioPorId(idInformado);

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
        id: Date.now(),

        usuarioId: usuario.id,

        nome: usuario.nome,

        mensagem: "Nova conversa iniciada.",

        tempo: "Agora",

        online: usuario.online,

        grupo: false,

        mensagens: [],
      };

      setConversas((lista) => [
        novaConversa,
        ...lista,
      ]);

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

          {conversasFiltradas.length === 0 ? (

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

                    <div
                      className={`
                        ${styles.avatar}
                        ${
                          item.grupo
                            ? styles.avatarGrupo
                            : ""
                        }
                      `}
                    >
                      {item.grupo ? (
                        <Users size={20} />
                      ) : (
                        item.nome
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

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

                <div
                  className={`
                    ${styles.avatar}
                    ${
                      conversaAtual.grupo
                        ? styles.avatarGrupo
                        : ""
                    }
                  `}
                >
                  {conversaAtual.grupo ? (
                    <Users size={20} />
                  ) : (
                    conversaAtual.nome
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

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
                          <div
                            className={
                              styles.miniAvatar
                            }
                          >
                            {item.autor
                              .charAt(0)
                              .toUpperCase()}
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

              <div className={styles.areaMensagem}>

                <textarea
                  value={mensagem}
                  onChange={(evento) =>
                    setMensagem(
                      evento.target.value
                    )
                  }
                  onKeyDown={pressionarEnter}
                  placeholder="Digite uma mensagem..."
                  rows={1}
                />

                <button
                  type="button"
                  className={styles.botaoEnviar}
                  onClick={enviarMensagem}
                  disabled={!mensagem.trim()}
                  title="Enviar mensagem"
                >
                  <Send size={19} />
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