import styles from "./index.module.css";

import { useRef } from "react";

import CardLivro from "../../componentes/cardLivro";

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

function Home() {
  // Referência da área que terá o scroll
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  // Scroll para a esquerda
  const scrollEsquerda1 = () => {
    scrollRef1.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  // Scroll para a direita
  const scrollDireita1 = () => {
    scrollRef1.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

    const scrollEsquerda2 = () => {
    scrollRef2.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  // Scroll para a direita
  const scrollDireita2 = () => {
    scrollRef2.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

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

      <h2 className={styles.tituloLeitCard}>
        <Road />
        Explore novos Caminhos
      </h2>

      
      <div className={styles.areaLivros}>
       
        <button
          className={`${styles.botaoScroll} ${styles.esquerdaScroll}`}
          onClick={scrollEsquerda1}
          aria-label="Ver livros anteriores"
        >
          <ChevronLeft size={26} />
        </button>

       
        <div
          className={styles.leitCard}
          ref={scrollRef1}
        >
          <CardLivro
            titulo="Deserto"
            autor="Amigo loko"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />
        </div>

        {/* BOTÃO DIREITO */}
        <button
          className={`${styles.botaoScroll} ${styles.direitaScroll}`}
          onClick={scrollDireita1}
          aria-label="Ver próximos livros"
        >
          <ChevronRight size={26} />
        </button>
      </div>



      <h2 className={styles.tituloLeitCard}>
        <HatGlasses/>
        Mistérios
      </h2>

      <div className={styles.areaLivros}>
       
        <button
          className={`${styles.botaoScroll} ${styles.esquerdaScroll}`}
          onClick={scrollEsquerda2}
          aria-label="Ver livros anteriores"
        >
          <ChevronLeft size={26} />
        </button>

       
        <div
          className={styles.leitCard}
          ref={scrollRef2}
        >
          <CardLivro
            titulo="Deserto"
            autor="Amigo loko"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />

          <CardLivro
            titulo="Duna"
            autor="Frank Herbert"
            tipo="Livro"
          />
        </div>

        {/* BOTÃO DIREITO */}
        <button
          className={`${styles.botaoScroll} ${styles.direitaScroll}`}
          onClick={scrollDireita2}
          aria-label="Ver próximos livros"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
}

export default Home;