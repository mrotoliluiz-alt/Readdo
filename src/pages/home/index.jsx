import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import CardLivro from "../../componentes/CardLivro";

import {
  Flame,
  Star,
  House,
  PenTool,
  BookOpen,
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
  const carregandoInicial = useRef(false);

  const [livrosExplore, setLivrosExplore] = useState([]);
  const [livrosMisterio, setLivrosMisterio] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Busca livros na Google Books API.
  const buscarNaGoogleBooks = async (termo, tentativa = 0) => {
    const MAX_TENTATIVAS = 3;

    const parametros = new URLSearchParams({
      q: termo,
      maxResults: "20",
      orderBy: "relevance",
      printType: "books",
    });

    if (API_KEY) {
      parametros.set("key", API_KEY);
    }

    const url =
      `https://www.googleapis.com/books/v1/volumes?${parametros.toString()}`;

    try {
      const resposta = await fetch(url);

      if (resposta.status === 429) {
        if (tentativa >= MAX_TENTATIVAS) {
          throw new Error(
            "Limite de requisições da Google Books atingido."
          );
        }

        const espera = 2000 * 2 ** tentativa;

        await new Promise((resolve) =>
          setTimeout(resolve, espera)
        );

        return buscarNaGoogleBooks(termo, tentativa + 1);
      }

      if (!resposta.ok) {
        throw new Error(
          `Erro na Google Books: ${resposta.status}`
        );
      }

      const dados = await resposta.json();

      return Array.isArray(dados.items) ? dados.items : [];
    } catch (erro) {
      console.error(`Erro na busca "${termo}":`, erro);
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
      const resultados = await buscarNaGoogleBooks(termo);

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
    setCarregando(true);
    setErro("");

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

      // Salva o cache mesmo que apenas uma seção tenha resultados.
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          explore: explorar,
          misterios,
        })
      );

      if (falhaExplore && falhaMisterios) {
        throw new Error(
          "Não foi possível consultar a Google Books API."
        );
      }

      if (falhaExplore || falhaMisterios) {
        setErro(
          "Alguns livros não puderam ser carregados. Você pode tentar novamente."
        );
      } else if (!explorar.length && !misterios.length) {
        setErro(
          "A busca não encontrou livros. Tente novamente."
        );
      }
    } catch (erro) {
      console.error("Erro ao carregar os livros:", erro);

      setErro(
        "Não foi possível carregar os livros. Verifique sua conexão e tente novamente."
      );
    } finally {
      setCarregando(false);
      carregandoInicial.current = false;
    }
  };

  useEffect(() => {
    carregarLivros();
  }, []);

  const rolar = (referencia, direcao) => {
    referencia.current?.scrollBy({
      left: direcao * 400,
      behavior: "smooth",
    });
  };

  const renderizarLivro = (livro) => {
    const info = livro.volumeInfo || {};

    const imagem = (
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      ""
    ).replace(/^http:/, "https:");

    return (
      <CardLivro
        key={livro.id}
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
          disabled={carregando || livros.length === 0}
        >
          <ChevronLeft size={26} />
        </button>

        <div
          className={styles.leitCard}
          ref={referencia}
          id={id}
        >
          {carregando ? (
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
          disabled={carregando || livros.length === 0}
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.Conteiner}>
      <div className={styles.header}>
        <House />
        <h1>Início</h1>
      </div>

      <section className={styles.welcome}>
        <div>
          <h2>Olá, nome do usuário</h2>

          <p>
            Continue sua jornada literária. Você está indo muito bem!!
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <BookOpen color="#61a6fa" />
            <h3>3</h3>
            <span>Lidos</span>
          </div>

          <div className={styles.statCard}>
            <PenTool color="#4ade80" />
            <h3>4.2K</h3>
            <span>Palavras</span>
          </div>

          <div className={styles.statCard}>
            <Flame color="#fb923c" />
            <h3>8 dias</h3>
            <span>Sequência</span>
          </div>

          <div className={styles.statCard}>
            <Star color="#ffdb0c" />
            <h3>+850</h3>
            <span>XP</span>
          </div>
        </div>
      </section>

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

      {erro && (
        <div role="alert" className={styles.erroLivros}>
          <p>{erro}</p>

          <button
            type="button"
            onClick={carregarLivros}
            disabled={carregando}
          >
            {carregando ? "Carregando..." : "Tentar novamente"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;