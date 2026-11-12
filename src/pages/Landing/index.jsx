import styles from './index.module.css';
import {useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import CardLivro from "../../componentes/CardLivro";
import TopBar from "../../componentes/Topbar";
import Mascotão from "../../assets/Mascotão.png";
import { useRef } from "react";
import api from "../../services/api";

import {
    Flame,
    BookText,
    Star,
    LibraryBig,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

function Landing() {

    const navigate = useNavigate();
    const livrosRef = useRef(null);

    const rolarEsquerda = () => {
    livrosRef.current?.scrollBy({
        left: -600,
        behavior: "smooth",
    });
};

    const rolarDireita = () => {
        livrosRef.current?.scrollBy({
            left: 600,
            behavior: "smooth",
        });
    };

    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

     const fetchDados = async () => {
        try {
        setLoading(true);

        const response = await api.get("/obras");
        setObras(response.data.dados);
        } catch (err) {
        console.error("Erro na requisição:", err.message);
        setErro("Não foi possível carregar os dados.");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchDados();
    }, []);
 
  if (loading && obras.length === 0) return <p>Carregando os dados...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

    return (
        

        <div className={styles.landing}>

            <TopBar variante="landing" />

            <div className={styles.conteudoPrincipal}>


                <div className={styles.esquerda}>

                    <div className={styles.Textos}>

                        <h2>
                            Leia para
                        </h2>

                        <h2>
                            <span className={styles.destaque}>
                                Conhecer
                            </span>, pratique
                        </h2>

                        <h2>
                            Para <span className={styles.destaque}>
                                aprender
                            </span>
                        </h2>

                        <h3>
                            O <span className={styles.destaqueMenor}>
                                Readduo
                            </span> é para você!
                        </h3>

                    </div>

                    <div className={styles.conteinerSinb}>

                        <div className={styles.sinb}>

                            <BookText color="#0FA6B3" />

                            <p>
                                Variedade de Livros!
                            </p>

                        </div>


                        <div className={styles.sinb}>

                            <Flame
                                color="#0FA6B3"
                                className={styles.icone}
                            />

                            <p>
                                Mantenha o Ritmo!
                            </p>

                        </div>


                        <div className={styles.sinb}>

                            <Star color="#0FA6B3" />

                            <p>
                                XP e Conquistas!
                            </p>

                        </div>

                    </div>

                </div>

                <div className={styles.direita}>

                   
                         <img src={Mascotão} 
                         height={600}
                         width={600} />
                </div>

            </div>

            <section className={styles.baixo}>

                <h3 className={styles.livraria}>

                    <LibraryBig
                        color="#0FA6B3"
                        width={38}
                        height={33}
                    />

                    Conheça alguns de nossos livros

                </h3>


   <div className={styles.areaLivros}>

    <button
        className={`${styles.botaoScroll} ${styles.esquerdaScroll}`}
        onClick={rolarEsquerda}
        aria-label="Ver livros anteriores"
    >
        <ChevronLeft size={32} strokeWidth={2.5} />
    </button>

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

                onClick={() => navigate('/Cadastro')}
              />
            ))}
          </div>
        )}

    <button
        className={`${styles.botaoScroll} ${styles.direitaScroll}`}
        onClick={rolarDireita}
        aria-label="Ver próximos livros"
    >
         <ChevronLeft size={32} strokeWidth={2.5} />
    </button>

    </div>

            </section>

        </div>
    );
}

export default Landing;