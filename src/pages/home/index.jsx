
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
  const scrollRefObras = useRef(null);

  const [obras, setObras] = useState([]);
  const [us, setUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

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

      </section>

      <section>
        <h2>Descubra algo novo</h2>

        <div className={styles.areaLivros}>
          
          <button 
        type="button"
        className={`${styles.botaoScroll} ${styles.direitaScroll}`}
        onClick={() => rolar(scrollRefObras, 1)}
        aria-label="Ver próximos livros"
        disabled={loading || obras.length === 0}>
          {'>'}
        </button>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className={styles.leitCard}
          ref={scrollRefObras}>
            {obras.map((obra) => (
              <CardLivro
                key={obra.Ob_ID ?? obra.id}
                id={obra.Ob_ID ?? obra.id}
                titulo={obra.titulo ?? obra.Ob_titulo}
                autor={obra.autor ?? obra.Ob_autor ?? obra.Autor}
                tipo={obra.genero ?? obra.Genero}
                imagem={obra.imagem ?? obra.Ob_imagem ?? obra.Imagem}
                navigationState={obra}
              />
            ))}
          </div>
        )}
        
        <button 
        type="button"
        className={`${styles.botaoScroll} ${styles.esquerdaScroll}`}
        onClick={() => rolar(scrollRefObras, -1)}
        aria-label="Ver livros anteriores"
        disabled={loading || obras.length === 0}>
          {'<'}
        </button>
      
      </ div>
        
        
      </section>

     

    </div>
  );
}

export default Home;
