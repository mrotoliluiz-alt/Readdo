
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import CardLivro from "../../componentes/CardLivro";
import api from "../../services/api";

import {
  House,
  Road,
  ChevronLeft,
  ChevronRight,
  HatGlasses,
} from "lucide-react";


function Home() {
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const [obras, setObras] = useState([]);
  const [us, setUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [livrosExplore, setLivrosExplore] = useState([]);
  const [livrosMisterio, setLivrosMisterio] = useState([]);

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



  // Executa as buscas quando a página é aberta.
  useEffect(() => {
    fetchDados();
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
            Olá, <span key={us.id} className={styles.distaque}>
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
                autor={obra.autor}
                tipo={obra.genero}
                imagem={obra.imagem}
                navigationState={obra}
              />
            ))}
          </div>
        )}
      </section>

     

    </div>
  );
}

export default Home;
