import styles from "./index.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import DOMPurify from "dompurify";
import api from "../../services/api";

function obterLista(resposta, recurso) {
  const dados = resposta.data?.dados ?? resposta.data;

  if (!Array.isArray(dados)) {
    throw new Error(`A resposta de ${recurso} não contém uma lista.`);
  }

  return dados;
}

function formatarData(data) {
  const valor = String(data);
  const instante = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? new Date(`${valor}T12:00:00`)
    : new Date(data);

  if (Number.isNaN(instante.getTime())) {
    return "Data não disponível";
  }

  return instante.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const tagsPermitidas = [
  "p",
  "h1",
  "h2",
  "h3",
  "div",
  "span",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "font",
  "ul",
  "ol",
  "li",
];

const fontesPermitidas = new Set([
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
]);

function sanitizarConteudo(conteudo) {
  const htmlSeguro = DOMPurify.sanitize(conteudo || "", {
    ALLOWED_TAGS: tagsPermitidas,
    ALLOWED_ATTR: ["style", "face", "align"],
    ALLOW_DATA_ATTR: false,
  });
  const documento = new DOMParser().parseFromString(htmlSeguro, "text/html");

  documento.body.querySelectorAll("[style]").forEach((elemento) => {
    const estilos = [];
    const alinhamento = elemento.style.textAlign.toLowerCase();

    if (["left", "center", "right", "justify"].includes(alinhamento)) {
      estilos.push(`text-align: ${alinhamento}`);
    }

    const fonte = elemento.style.fontFamily
      .replace(/["']/g, "")
      .split(",")[0]
      .trim();

    if (fontesPermitidas.has(fonte)) {
      estilos.push(`font-family: "${fonte}"`);
    }

    if (estilos.length > 0) {
      elemento.setAttribute("style", estilos.join("; "));
    } else {
      elemento.removeAttribute("style");
    }
  });

  documento.body.querySelectorAll("font[face]").forEach((elemento) => {
    const fonte = elemento.getAttribute("face").trim();

    if (!fontesPermitidas.has(fonte)) {
      elemento.removeAttribute("face");
    }
  });

  documento.body.querySelectorAll("[align]").forEach((elemento) => {
    const alinhamento = elemento.getAttribute("align").toLowerCase();

    if (["left", "center", "right", "justify"].includes(alinhamento)) {
      elemento.setAttribute("align", alinhamento);
    } else {
      elemento.removeAttribute("align");
    }
  });

  return documento.body.innerHTML;
}

function Leitura() {
  const { id, capituloId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [capitulos, setCapitulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch (error) {
      console.error("Erro ao encontrar o usuário salvo:", error);
      return null;
    }
  });
  const [comentarios, setComentarios] = useState([]);
  const [usuariosPorId, setUsuariosPorId] = useState(new Map());
  const [textoComentario, setTextoComentario] = useState("");
  const [carregandoComentarios, setCarregandoComentarios] = useState(true);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [erroComentarios, setErroComentarios] = useState("");
  const [mensagemComentario, setMensagemComentario] = useState("");
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const obraLendoCadastrada = useRef("");
  const fimCapituloRef = useRef(null);
  const usuarioId = Number(usuario?.Us_ID ?? usuario?.id);
  const usuarioAutenticado =
    Number.isInteger(usuarioId) && usuarioId > 0;

  const livro = location.state?.livro;
  const tituloLivro =
    livro?.titulo || livro?.Ob_titulo || `Obra ${id}`;
  const autor =
    livro?.autor || livro?.Ob_autor || livro?.Autor || "Leitura";

  useEffect(() => {
    const buscarCapitulos = async () => {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get(`/capitulos/obra/${id}`);
        const dados = resposta.data?.dados;

        if (resposta.data?.sucesso === false) {
          throw new Error(
            resposta.data.mensagem || "Não foi possível carregar os capítulos."
          );
        }

        if (!Array.isArray(dados)) {
          throw new Error("A resposta da API não contém uma lista de capítulos.");
        }

        setCapitulos(
          [...dados].sort(
            (a, b) => Number(a.Cap_ordem) - Number(b.Cap_ordem)
          )
        );
      } catch (error) {
        console.error("Erro ao carregar capítulos:", error);
        setErro(
          error.response?.data?.mensagem ||
            error.message ||
            "Não foi possível carregar os capítulos."
        );
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      buscarCapitulos();
    }
  }, [id]);

  const buscarComentarios = useCallback(async () => {
    const [respostaComentarios, respostaUsuarios] = await Promise.all([
      api.get("/comentarios"),
      api.get("/usuarios"),
    ]);

    if (
      respostaComentarios.data?.sucesso === false ||
      respostaUsuarios.data?.sucesso === false
    ) {
      throw new Error(
        respostaComentarios.data?.mensagem ||
          respostaUsuarios.data?.mensagem ||
          "Não foi possível carregar os comentários."
      );
    }

    const comentariosDaObra = obterLista(
      respostaComentarios,
      "/comentarios"
    )
      .filter((comentario) => Number(comentario?.Ob_ID) === Number(id))
      .sort(
        (a, b) =>
          new Date(b.Com_obr_Dtenvio).getTime() -
            new Date(a.Com_obr_Dtenvio).getTime() ||
          Number(b.Com_ID) - Number(a.Com_ID)
      );

    const usuarios = obterLista(respostaUsuarios, "/usuarios");
    const mapaUsuarios = new Map(
      usuarios
        .map((item) => ({
          id: Number(item.Us_ID ?? item.id),
          nome: item.US_nome ?? item.Us_nome ?? item.nome,
        }))
        .filter((item) => Number.isInteger(item.id))
        .map((item) => [item.id, item.nome])
    );

    return { comentariosDaObra, mapaUsuarios };
  }, [id]);

  useEffect(() => {
    let requisicaoAtiva = true;

    const carregarComentarios = async () => {
      try {
        setCarregandoComentarios(true);
        setErroComentarios("");
        const resultado = await buscarComentarios();

        if (requisicaoAtiva) {
          setComentarios(resultado.comentariosDaObra);
          setUsuariosPorId(resultado.mapaUsuarios);
        }
      } catch (error) {
        console.error("Erro ao carregar comentários:", error);

        if (requisicaoAtiva) {
          setErroComentarios(
            error.response?.data?.mensagem ||
              error.message ||
              "Não foi possível carregar os comentários."
          );
        }
      } finally {
        if (requisicaoAtiva) {
          setCarregandoComentarios(false);
        }
      }
    };

    carregarComentarios();

    return () => {
      requisicaoAtiva = false;
    };
  }, [buscarComentarios]);

  const enviarComentario = async (event) => {
    event.preventDefault();

    if (!usuarioAutenticado) {
      setErroComentarios("Entre na sua conta para enviar um comentário.");
      return;
    }

    const texto = textoComentario.trim();
    if (!texto) return;

    const dataAtual = new Date();
    const dataEnvio = [
      dataAtual.getFullYear(),
      String(dataAtual.getMonth() + 1).padStart(2, "0"),
      String(dataAtual.getDate()).padStart(2, "0"),
    ].join("-");

    try {
      setEnviandoComentario(true);
      setErroComentarios("");
      setMensagemComentario("");

      const resposta = await api.post("/comentarios", {
        Us_ID: usuarioId,
        Ob_ID: Number(id),
        com_obr_Dtenvio: dataEnvio,
        com_obr_texto: texto,
        com_obr_moderacao: "Aprovado",
      });

      if (resposta.data?.sucesso === false) {
        throw new Error(
          resposta.data.mensagem || "Não foi possível enviar o comentário."
        );
      }

      setTextoComentario("");
      setMensagemComentario("Comentário enviado com sucesso.");

      try {
        const resultado = await buscarComentarios();
        setComentarios(resultado.comentariosDaObra);
        setUsuariosPorId(resultado.mapaUsuarios);
      } catch (errorAtualizacao) {
        console.error("Erro ao atualizar comentários:", errorAtualizacao);
        setErroComentarios(
          "Seu comentário foi enviado, mas não foi possível atualizar a lista."
        );
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      setErroComentarios(
        error.response?.data?.mensagem ||
          error.message ||
          "Não foi possível enviar o comentário."
      );
    } finally {
      setEnviandoComentario(false);
    }
  };

  const comentariosVisiveis = comentarios.filter(
    (comentario) =>
      comentario.Com_obr_moderacao === "Aprovado" ||
      (usuarioAutenticado && Number(comentario.Us_ID) === usuarioId)
  );

  useEffect(() => {
    if (!comentariosAbertos) return undefined;

    const fecharComEscape = (event) => {
      if (event.key === "Escape") {
        setComentariosAbertos(false);
      }
    };

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [comentariosAbertos]);

  const indiceCapitulo = useMemo(() => {
    if (capitulos.length === 0) return -1;
    if (!capituloId) return 0;

    return capitulos.findIndex(
      (capitulo) => String(capitulo.Cap_ID) === capituloId
    );
  }, [capitulos, capituloId]);

  const capituloAtual =
    indiceCapitulo >= 0 ? capitulos[indiceCapitulo] : null;

  useEffect(() => {
    if (!capituloAtual) {
      return;
    }

    try {
      const usuario =
        JSON.parse(localStorage.getItem("usuario") || "null");
      const usuarioId =
        Number(usuario?.Us_ID ?? usuario?.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return;
      }

      const obraId = Number(id);
      const cadastroId = `${usuarioId}:${obraId}`;

      if (
        !Number.isInteger(obraId) ||
        obraId <= 0 ||
        obraLendoCadastrada.current === cadastroId
      ) {
        return;
      }

      obraLendoCadastrada.current = cadastroId;

      api
        .get(`/favoritos/usuario/${usuarioId}`)
        .then((respostaFavoritos) => {
          const favoritos = respostaFavoritos.data?.dados;

          if (!Array.isArray(favoritos)) {
            throw new Error(
              "A resposta da API não contém uma lista de favoritos."
            );
          }

          const registroExistente = favoritos.some(
            (favorito) => Number(favorito?.Ob_ID) === obraId
          );

          if (registroExistente) return null;

          return api.post("/favoritossalvos", {
            Ob_ID: obraId,
            Us_ID: usuarioId,
            Fav_status: "lendo",
          });
        })
        .then((respostaCadastro) => {
          if (respostaCadastro?.data?.sucesso === false) {
            throw new Error(
              respostaCadastro.data.mensagem ||
                "Não foi possível cadastrar a obra como lendo."
            );
          }
        })
        .catch((erroApi) => {
          obraLendoCadastrada.current = "";
          console.error("Erro ao cadastrar obra como lendo:", erroApi);
        });
    } catch (erro) {
      console.error(
        "Erro ao registrar capítulo lido:",
        erro
      );
    }
  }, [capituloAtual, id]);

  useEffect(() => {
    const marcador = fimCapituloRef.current;
    if (!capituloAtual || !marcador || !usuarioAutenticado) {
      return undefined;
    }

    let registrado = false;
    const registrarCapituloConcluido = () => {
      if (registrado) return;
      registrado = true;

      try {
        const chave =
          `readduo-capitulos-concluidos-${usuarioId}`;
        let registros = [];

        try {
          const salvo = JSON.parse(
            localStorage.getItem(chave) || "[]"
          );
          registros = Array.isArray(salvo) ? salvo.map(String) : [];
        } catch (error) {
          console.error("Erro ao ler capítulos concluídos:", error);
        }

        const capituloIdLido = String(capituloAtual.Cap_ID);
        if (!registros.includes(capituloIdLido)) {
          localStorage.setItem(
            chave,
            JSON.stringify([...registros, capituloIdLido])
          );
        }
      } catch (error) {
        console.error("Erro ao registrar capítulo concluído:", error);
      }
    };

    if ("IntersectionObserver" in window) {
      const observador = new IntersectionObserver((entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          registrarCapituloConcluido();
          observador.disconnect();
        }
      });

      observador.observe(marcador);
      return () => observador.disconnect();
    }

    const verificarMarcador = () => {
      if (marcador.getBoundingClientRect().top <= window.innerHeight) {
        registrarCapituloConcluido();
        window.removeEventListener("scroll", verificarMarcador);
        window.removeEventListener("resize", verificarMarcador);
      }
    };

    window.addEventListener("scroll", verificarMarcador, {
      passive: true,
    });
    window.addEventListener("resize", verificarMarcador);
    verificarMarcador();

    return () => {
      window.removeEventListener("scroll", verificarMarcador);
      window.removeEventListener("resize", verificarMarcador);
    };
  }, [capituloAtual, usuarioAutenticado, usuarioId]);

  const navegarParaCapitulo = (capitulo) => {
    navigate(`/livro/${id}/ler/${capitulo.Cap_ID}`, {
      state: location.state,
    });
  };

  if (carregando || erro || capitulos.length === 0 || !capituloAtual) {
    const mensagem = carregando
      ? "Carregando capítulos..."
      : erro ||
        (capitulos.length === 0
          ? "Esta obra ainda não possui capítulos."
          : "Capítulo não encontrado para esta obra.");

    return (
      <div className={styles.container}>
        <button
          type="button"
          className={styles.voltar}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />
          <span>Voltar</span>
        </button>
        <main className={styles.estado} role={erro ? "alert" : undefined}>
          <BookOpen size={42} />
          <h2>{mensagem}</h2>
        </main>
      </div>
    );
  }

  const anterior = capitulos[indiceCapitulo - 1];
  const proximo = capitulos[indiceCapitulo + 1];

  return (
    <div className={styles.container}>
      <header className={styles.topo}>
        <button
          type="button"
          className={styles.voltar}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />
          <span>Voltar</span>
        </button>

        <div className={styles.informacoesLivro}>
          <div className={styles.iconeLivro}>
            <BookOpen size={22} />
          </div>
          <div className={styles.textosLivro}>
            <h1 title={tituloLivro}>{tituloLivro}</h1>
            <span title={autor}>{autor}</span>
          </div>
        </div>

        <div className={styles.status}>
          <span className={styles.statusPonto} />
          <span>
            Capítulo {indiceCapitulo + 1} de {capitulos.length}
          </span>
        </div>
      </header>

      <main className={styles.areaLeitura}>
        <div className={styles.tituloArea}>
          <div>
            <span>LEITURA</span>
            <h2>{capituloAtual.Cap_titulo}</h2>
          </div>
          <div className={styles.indicadorLeitura}>
            <BookOpen size={17} />
            <span>Capítulo {capituloAtual.Cap_ordem}</span>
          </div>
        </div>

        <article
          className={styles.conteudoCapitulo}
          dangerouslySetInnerHTML={{
            __html: sanitizarConteudo(capituloAtual.Cap_conteudo),
          }}
        />
        <div
          ref={fimCapituloRef}
          className={styles.marcadorFimCapitulo}
          aria-hidden="true"
        />

        <nav className={styles.navegacaoCapitulos} aria-label="Navegação entre capítulos">
          <button
            type="button"
            className={styles.botaoCapitulo}
            onClick={() => navegarParaCapitulo(anterior)}
            disabled={!anterior}
          >
            <ChevronLeft size={18} />
            Capítulo anterior
          </button>
          <button
            type="button"
            className={styles.botaoCapitulo}
            onClick={() => navegarParaCapitulo(proximo)}
            disabled={!proximo}
          >
            Próximo capítulo
            <ChevronRight size={18} />
          </button>
        </nav>

        <button
          type="button"
          className={styles.abrirComentarios}
          onClick={() => setComentariosAbertos(true)}
          aria-expanded={comentariosAbertos}
          aria-haspopup="dialog"
          aria-label={`Abrir comentários, ${comentariosVisiveis.length} comentários`}
        >
          <MessageCircle size={20} />
          <span>Comentários</span>
          <span className={styles.contagemBotaoComentarios}>
            {comentariosVisiveis.length}
          </span>
        </button>

        {comentariosAbertos && (
          <div
            className={styles.fundoModalComentarios}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setComentariosAbertos(false);
              }
            }}
          >
            <section
              className={styles.secaoComentarios}
              aria-labelledby="titulo-comentarios"
              role="dialog"
              aria-modal="true"
            >
              <div className={styles.cabecalhoComentarios}>
                <div>
                  <span>COMUNIDADE</span>
                  <h2 id="titulo-comentarios">Comentários</h2>
                </div>
                <div className={styles.acoesCabecalhoComentarios}>
                  <div className={styles.contagemComentarios}>
                    <MessageCircle size={17} />
                    <span>{comentariosVisiveis.length}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.fecharComentarios}
                    onClick={() => setComentariosAbertos(false)}
                    aria-label="Fechar comentários"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {usuarioAutenticado ? (
                <form
                  className={styles.formularioComentario}
                  onSubmit={enviarComentario}
                >
                  <label htmlFor="texto-comentario">
                    Compartilhe sua opinião
                  </label>
                  <textarea
                    id="texto-comentario"
                    value={textoComentario}
                    onChange={(event) => setTextoComentario(event.target.value)}
                    placeholder="O que você achou desta obra?"
                    maxLength={1000}
                    rows={4}
                    required
                  />
                  <div className={styles.acoesComentario}>
                    <span>{textoComentario.length}/1000</span>
                    <button
                      type="submit"
                      className={styles.botaoEnviarComentario}
                      disabled={enviandoComentario || !textoComentario.trim()}
                    >
                      <Send size={16} />
                      {enviandoComentario ? "Enviando..." : "Comentar"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.avisoLoginComentario}>
                  <p>Entre na sua conta para participar da conversa.</p>
                  <button
                    type="button"
                    className={styles.botaoEnviarComentario}
                    onClick={() => navigate("/login")}
                  >
                    Entrar
                  </button>
                </div>
              )}

              {erroComentarios && (
                <p className={styles.erroComentario} role="alert">
                  {erroComentarios}
                </p>
              )}
              {mensagemComentario && (
                <p className={styles.sucessoComentario} role="status">
                  {mensagemComentario}
                </p>
              )}

              <div className={styles.listaComentarios} aria-live="polite">
                {carregandoComentarios ? (
                  <p className={styles.estadoComentarios}>
                    Carregando comentários...
                  </p>
                ) : erroComentarios && comentarios.length === 0 ? null : comentariosVisiveis.length ===
                  0 ? (
                  <p className={styles.estadoComentarios}>
                    Ainda não há comentários nesta obra. Seja o primeiro!
                  </p>
                ) : (
                  comentariosVisiveis.map((comentario) => {
                    const autorComentario =
                      usuariosPorId.get(Number(comentario.Us_ID)) ||
                      `Leitor ${comentario.Us_ID}`;
                    const emAnalise =
                      comentario.Com_obr_moderacao !== "Aprovado";

                    return (
                      <article
                        className={styles.comentario}
                        key={comentario.Com_ID}
                      >
                        <div
                          className={styles.avatarComentario}
                          aria-hidden="true"
                        >
                          {String(autorComentario).charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.conteudoComentario}>
                          <div className={styles.metaComentario}>
                            <strong>{autorComentario}</strong>
                            <time dateTime={comentario.Com_obr_Dtenvio}>
                              {formatarData(comentario.Com_obr_Dtenvio)}
                            </time>
                            {emAnalise && (
                              <span className={styles.statusComentario}>
                                Em análise
                              </span>
                            )}
                          </div>
                          <p>{comentario.Com_obr_texto}</p>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className={styles.rodape}>
        <div>
          <BookOpen size={16} />
          <span>Leitura integrada ao Readduo</span>
        </div>
      </footer>
    </div>
  );
}

export default Leitura;
