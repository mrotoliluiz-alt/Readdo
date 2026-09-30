import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";

function Leitura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const viewerRef = useRef(null);

  const [livro, setLivro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoViewer, setCarregandoViewer] = useState(true);
  const [erro, setErro] = useState("");
  const [erroViewer, setErroViewer] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  // =====================================================
  // BUSCAR LIVRO
  // =====================================================

  useEffect(() => {
    const buscarLivro = async () => {
      try {
        setCarregando(true);
        setErro("");

        if (!API_KEY) {
          throw new Error(
            "A chave da Google Books API não foi configurada."
          );
        }

        const resposta = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`
        );

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível encontrar este livro."
          );
        }

        const dados = await resposta.json();

        setLivro(dados);
      } catch (error) {
        console.error("Erro ao buscar livro:", error);

        setErro(
          error.message ||
            "Não foi possível carregar o livro."
        );
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      buscarLivro();
    }
  }, [id]);

  // =====================================================
  // GOOGLE BOOKS VIEWER
  // =====================================================

  useEffect(() => {
    if (!livro || !viewerRef.current) {
      return;
    }

    let intervalo;

    setCarregandoViewer(true);
    setErroViewer(false);

    const iniciarViewer = () => {
      if (
        !window.google ||
        !window.google.books ||
        !window.google.books.DefaultViewer
      ) {
        return false;
      }

      try {
        viewerRef.current.innerHTML = "";

        const viewer =
          new window.google.books.DefaultViewer(
            viewerRef.current
          );

        viewer.load(
          id,

          // Erro
          () => {
            console.error(
              "A Google Books não conseguiu incorporar este livro."
            );

            setCarregandoViewer(false);
            setErroViewer(true);
          },

          // Sucesso
          () => {
            console.log(
              "Livro carregado com sucesso no Google Books Viewer."
            );

            setCarregandoViewer(false);
            setErroViewer(false);
          }
        );

        return true;
      } catch (error) {
        console.error(
          "Erro ao inicializar Google Books Viewer:",
          error
        );

        setCarregandoViewer(false);
        setErroViewer(true);

        return true;
      }
    };

    const verificarAPI = () => {
      if (iniciarViewer()) {
        clearInterval(intervalo);
      }
    };

    verificarAPI();

    intervalo = setInterval(verificarAPI, 300);

    return () => {
      clearInterval(intervalo);
    };
  }, [livro, id]);

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.estado}>
          <LoaderCircle
            size={42}
            className={styles.spinner}
          />

          <h2>Carregando livro...</h2>

          <p>
            Buscando a obra na Google Books.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERRO
  // =====================================================

  if (erro || !livro) {
    return (
      <div className={styles.container}>
        <button
          className={styles.voltar}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />
          Voltar
        </button>

        <div className={styles.estado}>
          <BookOpen size={48} />

          <h2>
            Não foi possível carregar o livro
          </h2>

          <p>
            {erro || "Livro não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INFORMAÇÕES
  // =====================================================

  const info = livro.volumeInfo || {};
  const acesso = livro.accessInfo || {};

  const titulo =
    info.title || "Livro";

  const autor =
    info.authors?.join(", ") ||
    "Autor desconhecido";

  const viewability =
    acesso.viewability || "UNKNOWN";

  const embeddable =
    acesso.embeddable === true;

  const webReaderLink =
    acesso.webReaderLink || "";

  // =====================================================
  // STATUS DA LEITURA
  // =====================================================

  let textoStatus = "Visualização disponível";

  if (viewability === "ALL_PAGES") {
    textoStatus = "Livro completo disponível";
  } else if (viewability === "PARTIAL") {
    textoStatus = "Prévia disponível";
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div className={styles.container}>

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <header className={styles.topo}>

        <button
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

            <h1 title={titulo}>
              {titulo}
            </h1>

            <span title={autor}>
              {autor}
            </span>

          </div>

        </div>

        <div className={styles.status}>

          <span className={styles.statusPonto}></span>

          <span>{textoStatus}</span>

        </div>

      </header>


      {/* =================================================
          ÁREA DE LEITURA
      ================================================= */}

      <main className={styles.areaLeitura}>

        <div className={styles.tituloArea}>

          <div>
            <span>LEITURA</span>

            <h2>
              {titulo}
            </h2>
          </div>

          <div className={styles.indicadorLeitura}>
            <BookOpen size={17} />

            <span>
              Google Books
            </span>
          </div>

        </div>


        {/* =================================================
            VISUALIZADOR
        ================================================= */}

        {embeddable ? (

          <section
            className={styles.leitorWrapper}
          >

            {/* Carregamento */}

            {carregandoViewer && (
              <div
                className={
                  styles.carregandoViewer
                }
              >

                <div
                  className={
                    styles.carregandoIcone
                  }
                >
                  <LoaderCircle
                    size={35}
                    className={styles.spinner}
                  />
                </div>

                <h3>
                  Abrindo o livro...
                </h3>

                <p>
                  Preparando sua leitura.
                </p>

              </div>
            )}


            {/* Google Books */}

            <div
              ref={viewerRef}
              className={styles.viewer}
            />


            {/* Erro do Viewer */}

            {erroViewer && (
              <div
                className={styles.erroViewer}
              >

                <div
                  className={styles.erroIcone}
                >
                  <BookOpen size={38} />
                </div>

                <h2>
                  Não foi possível abrir
                  este livro aqui
                </h2>

                <p>
                  A Google Books não
                  disponibilizou uma
                  visualização incorporável
                  para esta obra.
                </p>

                {webReaderLink && (
                  <a
                    href={webReaderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      styles.botaoGoogle
                    }
                  >
                    <ExternalLink
                      size={18}
                    />

                    Abrir no Google Books
                  </a>
                )}

              </div>
            )}

          </section>

        ) : (

          /* =================================================
             SEM VISUALIZAÇÃO
          ================================================= */

          <section
            className={
              styles.semVisualizacao
            }
          >

            <div
              className={styles.erroIcone}
            >
              <BookOpen size={40} />
            </div>

            <h2>
              Este livro não pode ser
              incorporado
            </h2>

            <p>
              A Google Books não permite
              que a visualização desta
              obra seja incorporada
              diretamente ao Readduo.
            </p>

            {webReaderLink && (
              <a
                href={webReaderLink}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  styles.botaoGoogle
                }
              >
                <ExternalLink
                  size={18}
                />

                Abrir no Google Books
              </a>
            )}

          </section>

        )}

      </main>


      {/* =================================================
          RODAPÉ
      ================================================= */}

      <footer className={styles.rodape}>

        <div>
          <BookOpen size={16} />

          <span>
            Leitura integrada ao Readduo
          </span>
        </div>

        <span>
          Conteúdo fornecido pelo
          Google Books
        </span>

      </footer>

    </div>
  );
}

export default Leitura;