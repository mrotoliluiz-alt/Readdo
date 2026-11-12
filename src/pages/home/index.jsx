
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import CardLivro from "../../componentes/CardLivro";
import api from "../../services/api";
import apiGoogle from "../../services/googleBooks";

import {
  House,
  Road,
  ChevronLeft,
  ChevronRight,
  HatGlasses,
} from "lucide-react";

const CACHE_KEY = "readduo_home_google_books_v2";
const CACHE_TIME = 30 * 60 * 1000;
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

function Home() {
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const [obras, setObras] = useState([]);
  const [us, setUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Google Books
  const carregandoInicial = useRef(false);

  const [livrosExplore, setLivrosExplore] = useState([]);
  const [livrosMisterio, setLivrosMisterio] = useState([]);
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [erroGoogle, setErroGoogle] = useState("");

  // Busca as obras cadastradas no banco de dados
  const fetchDados = async () => {
    try {
      setLoading(true);

      const responseObra = await api.get("/obras");
      setObras(responseObra.data.dados);

    } catch (err) {
      console.error("Erro na requisição:", err.message);
      setErro("Não foi possível carregar os dados.");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    setUs(usuario);
}, []);

  // Busca livros na Google Books API.
  
const GoogleBooks = async (termo, tentativa = 0) => {
  const MAX_TENTATIVAS = 3;

  try {
    const resposta = await apiGoogle.get("/volumes", {
      params: {
        q: termo,
        maxResults: 20,
        orderBy: "relevance",
        printType: "books",
        ...(API_KEY && { key: API_KEY }),
      },
    });

    return Array.isArray(resposta.data.items)
      ? resposta.data.items
      : [];

  } catch (erro) {
    if (erro.response?.status === 429 && tentativa < MAX_TENTATIVAS) {
      const espera = 2000 * 2 ** tentativa;

      await new Promise((resolve) => setTimeout(resolve, espera));

      return GoogleBooks(termo, tentativa + 1);
    }

   console.error(`Erro na busca "${termo}":`, {
    status: erro.response?.status,
    mensagem: erro.response?.data,
    url: erro.config?.url,
    parametros: erro.config?.params
});

throw erro;
  }
};


  // Remove resultados duplicados e livros sem título.
  const prepararLivros = (livros) => {
    const unicos = new Map();

    livros.forEach((livro) => {
      if (
        livro?.id &&
        livro?.volumeInfo?.title &&
        !unicos.has(livro.id)
      ) {
        unicos.set(livro.id, livro);
      }
    });

    return Array.from(unicos.values());
  };

  // Tenta termos alternativos quando uma busca não encontra livros.
  const buscarComAlternativa = async (termos) => {
    for (const termo of termos) {
      const resultados = await GoogleBooks(termo);

      if (resultados.length > 0) {
        return resultados;
      }
    }

    return [];
  };

  // Carrega as duas seções e guarda os resultados em cache.
  const carregarLivros = async () => {
    if (carregandoInicial.current) return;

    carregandoInicial.current = true;
    setLoadingGoogle(true);
    setErroGoogle("");

    try {
      // Reaproveita resultados recentes.
      const cache = sessionStorage.getItem(CACHE_KEY);

      if (cache) {
        try {
          const cacheData = JSON.parse(cache);

          const cacheValido =
            Date.now() - cacheData.timestamp < CACHE_TIME &&
            Array.isArray(cacheData.explore) &&
            Array.isArray(cacheData.misterios);

          if (cacheValido) {
            setLivrosExplore(cacheData.explore);
            setLivrosMisterio(cacheData.misterios);
            return;
          }

        } catch {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }

      // Busca as duas seções independentemente.
      const resultados = await Promise.allSettled([
        buscarComAlternativa([
          "fiction",
          "literature",
          "books",
        ]),
        buscarComAlternativa([
          "mystery",
          "suspense",
          "detective fiction",
        ]),
      ]);

      const falhaExplore = resultados[0].status === "rejected";
      const falhaMisterios = resultados[1].status === "rejected";

      const explorar =
        resultados[0].status === "fulfilled"
          ? prepararLivros(resultados[0].value)
          : [];

      const misterios =
        resultados[1].status === "fulfilled"
          ? prepararLivros(resultados[1].value)
          : [];

      setLivrosExplore(explorar);
      setLivrosMisterio(misterios);

      // Salva os resultados no cache.
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          explore: explorar,
          misterios,
        })
      );

      if (falhaExplore && falhaMisterios) {
        throw new Error("Não foi possível consultar a Google Books API.");
      }

      if (falhaExplore || falhaMisterios) {
        setErroGoogle(
          "Alguns livros não puderam ser carregados. Você pode tentar novamente."
        );

      } else if (!explorar.length && !misterios.length) {
        setErroGoogle("A busca não encontrou livros. Tente novamente.");
      }

    } catch (erro) {
      console.error("Erro ao carregar os livros:", erro);

      setErroGoogle(
        "Não foi possível carregar os livros. Verifique sua conexão e tente novamente."
      );

    } finally {
      setLoadingGoogle(false);
      carregandoInicial.current = false;
    }
  };

  // Executa as buscas quando a página é aberta.
  useEffect(() => {
    fetchDados();
    carregarLivros();
  }, []);

  // Controla a rolagem horizontal dos livros.
  const rolar = (referencia, direcao) => {
    referencia.current?.scrollBy({
      left: direcao * 400,
      behavior: "smooth",
    });
  };

  // Transforma os dados da Google Books em CardLivro.
  const renderizarLivro = (livro) => {
    const info = livro.volumeInfo || {};

    const imagem = (
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      ""
    ).replace(/^http:/, "https:");

    return (
      <CardLivro
        key={`google-${livro.id}`}
        id={livro.id}
        titulo={info.title || "Título desconhecido"}
        autor={info.authors?.join(", ") || "Autor desconhecido"}
        tipo="Livro"
        imagem={imagem || undefined}
        link={
          info.previewLink ||
          info.infoLink ||
          info.canonicalVolumeLink ||
          undefined
        }
      />
    );
  };

  // Organiza as seções de livros da Google Books.
  const renderizarSecao = (
    titulo,
    Icone,
    livros,
    referencia,
    id
  ) => (
    <>
      <h2 className={styles.tituloLeitCard}>
        <Icone />
        {titulo}
      </h2>

      <div className={styles.areaLivros}>
        <button
          type="button"
          className={`${styles.botaoScroll} ${styles.esquerdaScroll}`}
          onClick={() => rolar(referencia, -1)}
          aria-label={`Ver livros anteriores de ${titulo}`}
          disabled={loadingGoogle || livros.length === 0}
        >
          <ChevronLeft size={26} />
        </button>

        <div
          className={styles.leitCard}
          ref={referencia}
          id={id}
        >
          {loadingGoogle ? (
            <p>Carregando livros...</p>
          ) : livros.length > 0 ? (
            livros.map(renderizarLivro)
          ) : (
            <p>Nenhum livro encontrado nesta seção.</p>
          )}
        </div>

        <button
          type="button"
          className={`${styles.botaoScroll} ${styles.direitaScroll}`}
          onClick={() => rolar(referencia, 1)}
          aria-label={`Ver próximos livros de ${titulo}`}
          disabled={loadingGoogle || livros.length === 0}
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </>
  );

  //estatus do loading 
  if (loading && obras.length === 0 && us.length === 0) return <p>Carregando os dados...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div className={styles.Conteiner}>

      <div className={styles.header}>
        <House />
        <h1>Início</h1>
      </div>

      <section className={styles.welcome}>

        <div className={styles.welcomeInfo}>

          <span className={styles.welcomeLabel}>
            SEJA BEM-VINDO AO READDUO
          </span>

          <h2>
            Olá, <span key= {us.id}className={styles.distaque}>
              {us.nome}!
            </span>
          </h2>

          <p>
            Que tal continuar sua jornada literária hoje?
            Cada página lida é uma nova conquista!
          </p>

        </div>

        <div className={styles.stats}>

          <div className={styles.statCard}>
            <h3>3</h3>
            <span>Livros lidos</span>
          </div>

          <div className={styles.statCard}>
            <h3>4.2K</h3>
            <span>Palavras lidas</span>
          </div>

        </div>

      </section>

      <section>
        <h2>Descubra algo novo</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className={styles.leitCard}>
            {obras.map((obra) => (
              <CardLivro
                key={obra.id}
                id={obra.id}
                titulo={obra.titulo}
                autor={obra.Autor}
                tipo={obra.Genero}
                imagem={obra.Imagem}
              />
            ))}
          </div>
        )}
      </section>

      {/* Google Books API */}

      {renderizarSecao(
        "Explore novos Caminhos",
        Road,
        livrosExplore,
        scrollRef1,
        "livros-explore"
      )}

      {renderizarSecao(
        "Mistérios",
        HatGlasses,
        livrosMisterio,
        scrollRef2,
        "livros-misterios"
      )}

      {erroGoogle && (
        <div role="alert" className={styles.erroLivros}>
          <p>{erroGoogle}</p>

          <button
            type="button"
            onClick={carregarLivros}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? "Carregando..." : "Tentar novamente"}
          </button>
        </div>
      )}

    </div>
  );
}

export default Home;
