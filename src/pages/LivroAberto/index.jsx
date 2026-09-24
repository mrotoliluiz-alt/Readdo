import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import CardLivro from "../../componentes/cardLivro";
import TopBar from "../../componentes/topBar";
import Mascotão from "../../assets/Mascotão.png";
import { useRef } from "react";

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

                   
                        <img
                            src={Mascotão}
                            alt="Ilustração do Readduo"
                        />

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

    <div
        className={styles.leitCard}
        ref={livrosRef}
    >
        <CardLivro
            titulo="Deserto"
            autor="Amigo loko"
            tipo="Livro"
        />

        <CardLivro
            titulo="Cuna"
            autor="Herbert Frank"
            tipo="Livro"
        />

        <CardLivro
            titulo="Harry Poter"
            autor="Minha varinha magica"
            tipo="Livro"
        />

        <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
        />

        <CardLivro
            titulo="O Peso das Palavras Cura a Alma"
            autor="Sthefany Oliveira"
            tipo="Livro"
        />

    <CardLivro
            titulo="O Peso das Palavras Cura a Alma"
            autor="Sthefany Oliveira"
            tipo="Livro"
        />

        <CardLivro
            titulo="O Peso das Palavras Cura a Alma"
            autor="Sthefany Oliveira"
            tipo="Livro"
        />
    </div>

    <button
        className={`${styles.botaoScroll} ${styles.direitaScroll}`}
        onClick={rolarDireita}
        aria-label="Ver próximos livros"
    >
        <ChevronRight size={24} />
    </button>

    </div>

            </section>

        </div>
    );
}

export default Landing;