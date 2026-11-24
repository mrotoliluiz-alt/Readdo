import styles from "./index.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";
import api from "../../services/api";

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
  const obraLendoCadastrada = useRef("");

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

      const chave =
        `readduo-capitulos-lidos-${usuarioId}`;
      const salvo =
        JSON.parse(localStorage.getItem(chave) || "[]");
      const registros =
        Array.isArray(salvo) ? salvo : [];
      const registro =
        String(capituloAtual.Cap_ID);

      if (!registros.includes(registro)) {
        localStorage.setItem(
          chave,
          JSON.stringify([...registros, registro])
        );
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

      api.post("/favoritossalvos", {
        Ob_ID: obraId,
        Us_ID: usuarioId,
        Fav_status: "Lendo",
      }).catch((erroApi) => {
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
