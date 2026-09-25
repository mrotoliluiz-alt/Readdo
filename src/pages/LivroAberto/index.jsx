import styles from "./index.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookOpen } from "lucide-react";

function LivroAberto() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className={styles.container}>

      <button
        className={styles.voltar}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className={styles.livro}>

        <div className={styles.capa}>
          <div className={styles.capaLivro}>
            <span>CAPA DO LIVRO</span>
          </div>
        </div>

        <div className={styles.informacoes}>

          <span className={styles.tipo}>
            Livro
          </span>

          <h1>Duna</h1>

          <h2>Frank Herbert</h2>

          <p className={styles.descricao}>
            Uma história de ficção científica que acompanha
            Paul Atreides e sua jornada pelo planeta Arrakis.
          </p>

          <div className={styles.botoes}>

            <button className={styles.ler}
             onClick={() => navigate(`/livro/${id}/ler`)}>
              <BookOpen size={20} />
              Começar a ler
            </button>

            <button className={styles.salvar}>
              <Bookmark size={20} />
              Salvar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LivroAberto;