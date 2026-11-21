import { useState } from "react";
import { useEffect } from "react";
import styles from "./index.module.css";
import CardLivro from "../../componentes/CardLivro";
import { Bookmark, Search, X } from "lucide-react";
import api from "../../services/api";


function Salvos() {
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const usuarioId = localStorage.getItem("Us_ID");

  const fetchDados = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/favoritos/usuario/${usuarioId}`);
      setFavoritos(response.data.dados);
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  

  useEffect(() => {
    fetchDados();
  }, []);

  if (loading && favoritos.length === 0) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Bookmark className={styles.iconeHeader} />

        <div>
          <h1>Minhas Obras Salvas</h1>
          <p>Todas as obras que você salvou para ler depois.</p>
        </div>
      </header>

      {loading ? <p>carregando...</p> : (
       <section className={styles.cardObras}>
          {obras.map((livro) => (
            <CardLivro
              key={livro.id}
              titulo={livro.titulo}
              autor={livro.autor}
              tipo={livro.tipo}
              tag={livro.tag}
              corTag={livro.corTag}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default Salvos;