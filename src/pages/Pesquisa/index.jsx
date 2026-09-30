import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import CardLivro from "../../componentes/cardLivro";

import {
  Search,
  SearchCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const sugestoes = [
  "Dom Casmurro",
  "Jorge Amado",
  "Distopia",
  "Autoajuda",
  "Machado de Assis",
  "Romance",
];

const CACHE_KEY = "readduo_google_books";
const CACHE_TIME = 30 * 60 * 1000;

// CHAVE DA GOOGLE BOOKS
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

function Pesquisa() {
  const [busca, setBusca] = useState("");
  const [livros, setLivros] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [pesquisou, setPesquisou] = useState(false);

  const [erro, setErro] = useState("");

  const carregandoInicial = useRef(false);

  const popularesRef = useRef(null);
  const recomendadosRef = useRef(null);
  const explorarRef = useRef(null);
  const resultadosRef = useRef(null);

  // --------------------------------------------------
  // BUSCAR NA GOOGLE BOOKS
  // --------------------------------------------------

  const buscarNaGoogleBooks = async (termo, tentativa = 0) => {
    const MAX_TENTATIVAS = 3;

    try {
      const url =
        `https://www.googleapis.com/books/v1/volumes` +
        `?q=${encodeURIComponent(termo)}` +
        `&maxResults=20` +
        `&orderBy=relevance` +
        `&key=${API_KEY}`;

      const resposta = await fetch(url);

      // Se a API bloquear por excesso de requisições
      if (resposta.status === 429) {
        if (tentativa >= MAX_TENTATIVAS) {
          throw new Error(
            "A Google Books atingiu o limite de requisições."
          );
        }

        const espera = 2000 * Math.pow(2, tentativa);

        console.log(
          `Google Books: limite atingido. Nova tentativa em ${
            espera / 1000
          } segundos...`
        );

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

      return dados.items || [];
    } catch (erro) {
      console.error("Erro na Google Books API:", erro);
      throw erro;
    }
  };

  // --------------------------------------------------
  // CARREGAR RECOMENDAÇÕES
  // --------------------------------------------------

  const carregarLivros = async () => {
    if (carregandoInicial.current) {
      return;
    }

    carregandoInicial.current = true;

    setCarregando(true);
    setErro("");

    try {
      // VERIFICAR CACHE

      const cache = sessionStorage.getItem(CACHE_KEY);

      if (cache) {
        const cacheData = JSON.parse(cache);

        const agora = Date.now();

        const cacheAindaValido =
          agora - cacheData.timestamp < CACHE_TIME;

        if (
          cacheAindaValido &&
          Array.isArray(cacheData.livros) &&
          cacheData.livros.length > 0
        ) {
          console.log(
            "Readduo: usando livros armazenados em cache."
          );

          setLivros(cacheData.livros);
          setCarregando(false);

          return;
        }
      }

      // UMA ÚNICA REQUISIÇÃO INICIAL

      console.log(
        "Readduo: buscando recomendações na Google Books..."
      );

      const dados = await buscarNaGoogleBooks("fiction");

      // SALVAR NO CACHE

      if (dados.length > 0) {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            livros: dados,
          })
        );
      }

      setLivros(dados);
    } catch (erro) {
      console.error(erro);

      setErro(
        "Não foi possível carregar os livros agora. Tente novamente em alguns instantes."
      );
    } finally {
      setCarregando(false);
      carregandoInicial.current = false;
    }
  };

  // --------------------------------------------------
  // CARREGAR AO ABRIR A PÁGINA
  // --------------------------------------------------

  useEffect(() => {
    carregarLivros();
  }, []);

  // --------------------------------------------------
  // PESQUISA
  // --------------------------------------------------

  const pesquisar = async (termo = busca) => {
    const termoPesquisa = termo.trim();

    if (!termoPesquisa) {
      return;
    }

    setBusca(termoPesquisa);
    setPesquisou(true);
    setCarregando(true);
    setErro("");

    try {
      const dados = await buscarNaGoogleBooks(
        termoPesquisa
      );

      setResultados(dados);
    } catch (erro) {
      console.error(erro);

      setResultados([]);

      setErro(
        "Não foi possível realizar a pesquisa agora. Tente novamente em alguns instantes."
      );
    } finally {
      setCarregando(false);
    }
  };

  // --------------------------------------------------
  // ENTER
  // --------------------------------------------------

  const pressionarEnter = (e) => {
    if (e.key === "Enter") {
      pesquisar();
    }
  };

  // --------------------------------------------------
  // SUGESTÕES
  // --------------------------------------------------

  const pesquisarSugestao = (sugestao) => {
    setBusca(sugestao);
    pesquisar(sugestao);
  };

  // --------------------------------------------------
  // SCROLL
  // --------------------------------------------------

  const scrollEsquerda = (referencia) => {
    referencia.current?.scrollBy({
      left: -500,
      behavior: "smooth",
    });
  };

  const scrollDireita = (referencia) => {
    referencia.current?.scrollBy({
      left: 500,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // RENDERIZAR LIVRO
  // --------------------------------------------------

  const renderizarLivro = (livro) => {
  const info = livro.volumeInfo || {};

  return (
    <CardLivro
      key={livro.id}
      id={livro.id}
      titulo={info.title || "Título desconhecido"}
      autor={
        info.authors?.join(", ") ||
        "Autor desconhecido"
      }
      tipo="Livro"
      imagem={info.imageLinks?.thumbnail}
      link={
        info.previewLink ||
        info.infoLink ||
        info.canonicalVolumeLink
      }
    />
  );
};

  // --------------------------------------------------
  // FILEIRA DE LIVROS
  // --------------------------------------------------

  const FileiraLivros = ({
    titulo,
    descricao,
    livros,
    referencia,
  }) => {
    if (!livros || livros.length === 0) {
      return null;
    }

    return (
      <section className={styles.secaoLivros}>
        <div className={styles.tituloSecao}>
          <div>
            <h2>{titulo}</h2>
            <p>{descricao}</p>
          </div>

          <div className={styles.botoesScroll}>
            <button
              type="button"
              onClick={() =>
                scrollEsquerda(referencia)
              }
              aria-label="Voltar livros"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollDireita(referencia)
              }
              aria-label="Avançar livros"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          className={styles.fileira}
          ref={referencia}
        >
          {livros.map(renderizarLivro)}
        </div>
      </section>
    );
  };

  // --------------------------------------------------
  // TELA
  // --------------------------------------------------

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <SearchCheck size={28} />
        <h1>Pesquisar</h1>
      </div>

      <section className={styles.searchArea}>
        <h2>
          O que você quer descobrir hoje?
        </h2>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Pesquise por livros, autores ou categorias..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            onKeyDown={pressionarEnter}
          />

          <button
            type="button"
            onClick={() => pesquisar()}
            aria-label="Pesquisar"
          >
            <Search size={22} />
          </button>
        </div>

        <div className={styles.sugestoes}>
          <span>Experimente:</span>

          {sugestoes.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() =>
                pesquisarSugestao(sugestao)
              }
            >
              {sugestao}
            </button>
          ))}
        </div>
      </section>

      {erro && (
        <div className={styles.mensagem}>
          <p>{erro}</p>

          <button
            type="button"
            onClick={() => {
              setErro("");
              carregarLivros();
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {carregando && (
        <div className={styles.mensagem}>
          <p>Carregando livros...</p>
        </div>
      )}

      {!carregando &&
        pesquisou &&
        resultados.length > 0 && (
          <FileiraLivros
            titulo={`Resultados para "${busca}"`}
            descricao="Livros encontrados na Google Books"
            livros={resultados}
            referencia={resultadosRef}
          />
        )}

      {!carregando &&
        pesquisou &&
        resultados.length === 0 &&
        !erro && (
          <div className={styles.mensagem}>
            <p>
              Nenhum livro encontrado para "{busca}".
            </p>
          </div>
        )}

      {!pesquisou &&
        !carregando &&
        !erro &&
        livros.length > 0 && (
          <>
            <FileiraLivros
              titulo="Livros recomendados"
              descricao="Descubra novas histórias"
              livros={livros.slice(0, 8)}
              referencia={popularesRef}
            />

            <FileiraLivros
              titulo="Mais livros para você"
              descricao="Continue explorando novos mundos"
              livros={livros.slice(8, 16)}
              referencia={recomendadosRef}
            />

            <FileiraLivros
              titulo="Explore mais histórias"
              descricao="Encontre sua próxima leitura"
              livros={livros.slice(4, 12)}
              referencia={explorarRef}
            />
          </>
        )}

    </div>
  );
}

export default Pesquisa;