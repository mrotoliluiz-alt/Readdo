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
} from "lucide-react";

const conversasIniciais = [
  {
    id: 1,
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
    nome: "Grupo • Clube da Distopia",
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

function Chat() {
  const [conversas, setConversas] = useState(conversasIniciais);

  const [conversaSelecionada, setConversaSelecionada] = useState(null);

  const [busca, setBusca] = useState("");

  const [mensagem, setMensagem] = useState("");

  const [mostrarNovaConversa, setMostrarNovaConversa] =
    useState(false);

  const [novoNome, setNovoNome] = useState("");

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

  const conversaAtual = conversas.find(
    (conversa) => conversa.id === conversaSelecionada
  );

  /*
   * Seleciona uma conversa.
   */
  const selecionarConversa = (id) => {
    setConversaSelecionada(id);
  };

  /*
   * Envia uma mensagem.
   */
  const enviarMensagem = () => {
    const texto = mensagem.trim();

    if (!texto || !conversaAtual) {
      return;
    }

    const novaMensagem = {
      id: Date.now(),
      autor: "Você",
      texto,
      horario: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
          mensagens: [...conversa.mensagens, novaMensagem],
        };
      })
    );

    setMensagem("");

    /*
     * Resposta automática apenas para demonstração.
     * Quando o backend estiver pronto, esta parte será
     * substituída pelo envio real da mensagem.
     */
    setTimeout(() => {
      const resposta = {
        id: Date.now() + 1,
        autor: conversaAtual.nome,
        texto: "Legal! Vou responder assim que possível 😊",
        horario: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        propria: false,
      };

      setConversas((lista) =>
        lista.map((conversa) => {
          if (conversa.id !== conversaAtual.id) {
            return conversa;
          }

          return {
            ...conversa,
            mensagem: resposta.texto,
            tempo: "Agora",
            mensagens: [...conversa.mensagens, resposta],
          };
        })
      );
    }, 900);
  };

  /*
   * Permite enviar com Enter.
   */
  const pressionarEnter = (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      enviarMensagem();
    }
  };

  /*
   * Cria uma nova conversa.
   */
  const criarConversa = () => {
    const nome = novoNome.trim();

    if (!nome) {
      return;
    }

    const novaConversa = {
      id: Date.now(),
      nome,
      mensagem: "Nova conversa iniciada.",
      tempo: "Agora",
      online: true,
      grupo: false,
      mensagens: [],
    };

    setConversas((lista) => [novaConversa, ...lista]);

    setConversaSelecionada(novaConversa.id);

    setNovoNome("");

    setMostrarNovaConversa(false);
  };

  /*
   * Abre o formulário de nova conversa.
   */
  const abrirNovaConversa = () => {
    setNovoNome("");
    setMostrarNovaConversa(true);
  };

  /*
   * Fecha o formulário.
   */
  const fecharNovaConversa = () => {
    setMostrarNovaConversa(false);
    setNovoNome("");
  };

  return (
    <div className={styles.container}>
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header className={styles.header}>
        <div className={styles.titulo}>
          <MessageCircle size={30} />
          <h1>Chat</h1>
        </div>

        <p>
          Converse, compartilhe ideias e aprenda com outros
          leitores e escritores.
        </p>
      </header>

      {/* =====================================================
          ÁREA PRINCIPAL
      ====================================================== */}

      <section className={styles.chatArea}>
        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside className={styles.sidebar}>
          {/* Pesquisa */}

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

          {/* Lista */}

          {conversasFiltradas.length === 0 ? (
            <div className={styles.semConversa}>
              <MessageCircle size={48} />

              <h3>Nenhuma conversa encontrada</h3>

              <p>
                Tente pesquisar por outro nome ou inicie uma
                nova conversa.
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
                    className={`${styles.conversa} ${
                      selecionada ? styles.conversaAtiva : ""
                    }`}
                    onClick={() =>
                      selecionarConversa(item.id)
                    }
                  >
                    <div
                      className={`${styles.avatar} ${
                        item.grupo
                          ? styles.avatarGrupo
                          : ""
                      }`}
                    >
                      {item.grupo ? (
                        <Users size={20} />
                      ) : (
                        item.nome.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className={styles.info}>
                      <strong>{item.nome}</strong>

                      <span>{item.mensagem}</span>
                    </div>

                    <div className={styles.direita}>
                      <small>{item.tempo}</small>

                      {item.online && (
                        <div className={styles.online} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dica */}

          <div className={styles.dica}>
            <Lightbulb size={18} />

            <div>
              <strong>Dica</strong>

              <p>
                Converse sobre livros, personagens e suas
                histórias favoritas.
              </p>
            </div>
          </div>
        </aside>

        {/* ===================================================
            CHAT
        ==================================================== */}

        <main className={styles.chat}>
          {!conversaAtual ? (
            /* ===============================================
               ESTADO VAZIO
            ================================================ */

            <div className={styles.chatVazio}>
              <div className={styles.iconeVazio}>
                <MessageCircle size={64} />
              </div>

              <h2>Selecione uma conversa</h2>

              <p>
                Escolha uma conversa existente ou inicie uma
                nova para conversar sobre livros, escrita e
                leitura.
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
            /* ===============================================
               CONVERSA ABERTA
            ================================================ */

            <div className={styles.conversaAberta}>
              {/* Cabeçalho da conversa */}

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
                  className={`${styles.avatar} ${
                    conversaAtual.grupo
                      ? styles.avatarGrupo
                      : ""
                  }`}
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
                  <strong>{conversaAtual.nome}</strong>

                  <span>
                    {conversaAtual.grupo
                      ? "Grupo"
                      : conversaAtual.online
                      ? "Online"
                      : "Offline"}
                  </span>
                </div>
              </div>

              {/* Mensagens */}

              <div className={styles.mensagens}>
                {conversaAtual.mensagens.length === 0 ? (
                  <div className={styles.semMensagens}>
                    <MessageCircle size={38} />

                    <h3>Comece a conversa</h3>

                    <p>
                      Envie uma mensagem para iniciar esta
                      conversa.
                    </p>
                  </div>
                ) : (
                  conversaAtual.mensagens.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.mensagemLinha} ${
                        item.propria
                          ? styles.mensagemPropria
                          : ""
                      }`}
                    >
                      {!item.propria && (
                        <div className={styles.miniAvatar}>
                          {item.autor
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className={styles.mensagemConteudo}>
                        {!item.propria && (
                          <span className={styles.autor}>
                            {item.autor}
                          </span>
                        )}

                        <div className={styles.balao}>
                          <span>{item.texto}</span>

                          <small>{item.horario}</small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Campo de mensagem */}

              <div className={styles.areaMensagem}>
                <textarea
                  value={mensagem}
                  onChange={(evento) =>
                    setMensagem(evento.target.value)
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

      {/* =====================================================
          MODAL NOVA CONVERSA
      ====================================================== */}

      {mostrarNovaConversa && (
        <div
          className={styles.overlay}
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              fecharNovaConversa();
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalIcone}>
                  <UserPlus size={20} />
                </span>

                <div>
                  <h2>Nova conversa</h2>

                  <p>
                    Comece uma conversa com outro leitor.
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

            <div className={styles.modalCorpo}>
              <label htmlFor="nomeConversa">
                Nome do usuário
              </label>

              <input
                id="nomeConversa"
                type="text"
                placeholder="Ex.: Mariana Costa"
                value={novoNome}
                onChange={(evento) =>
                  setNovoNome(evento.target.value)
                }
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    criarConversa();
                  }
                }}
                autoFocus
              />
            </div>

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
                disabled={!novoNome.trim()}
              >
                <MessageCircle size={17} />
                Iniciar conversa
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;