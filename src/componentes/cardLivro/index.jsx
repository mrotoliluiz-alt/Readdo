import styles from "./index.module.css";

import {BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CardLivro({
  titulo,
  autor,
  tipo,
  imagem,
  id,
  link,
  onClick,
  navigationState
}) {
  const navigate = useNavigate();

  const tituloSeguro = titulo || "Título não disponível";

  const obterUrlImagem = (imagem) => {
    if (!imagem) return "";

    if (/^(https?:\/\/|data:image\/|blob:)/i.test(imagem)) {
      return imagem;
    }

    const baseUrl = api.defaults.baseURL.replace(/\/$/, "");

    if (imagem.startsWith("/")) {
      return `${baseUrl}${imagem}`;
    }

    if (/^public\//i.test(imagem) || /^obras\//i.test(imagem)) {
      return `${baseUrl}/${imagem}`;
    }

    return `${baseUrl}/public/obras/${encodeURIComponent(imagem)}`;
  };

  const urlImagem = obterUrlImagem(imagem);

  const abrirLivro = () => {
    if (onClick) {
        onClick();
        return;
    }

    if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
        return;
    }

    if (id) {
      navigate(`/livro/${id}`, navigationState ? { state: navigationState } : undefined);
    }
};

  

  return (
    <div className={styles.card}
    onClick={abrirLivro}>
      <div className={styles.imagemContainer}>
        {urlImagem ? (
          <img
            src={urlImagem}
            alt={titulo}
            className={styles.imagem}
          />
        ) : (
          <div className={styles.placeholder}>
            <BookOpen size={55} />

            <h4>{titulo}</h4>

            <span>{autor}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3>
          {tituloSeguro.length > 25
            ? tituloSeguro.substring(0, 25) + "..."
            : tituloSeguro}
        </h3>

        <p>{autor}</p>

        <div className={styles.footer}>
          <span>{tipo}</span>
        </div>
      </div>
    </div>
  );
}

export default CardLivro;