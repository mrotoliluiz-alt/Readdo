import styles from "./index.module.css";
import { useCallback, useEffect, useState } from "react";
import CardLivro from "../../componentes/CardLivro";
import api from "../../services/api";

import { Search, SearchCheck } from "lucide-react";

const sugestoes = [
  "O Último Capítulo",
  "Além das Estrelas",
  "Cartas para o Amanhã",
  "O Mistério da Biblioteca",
  "Entre Linhas",
  "A Cidade Esquecida",
];

function Pesquisa() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDados = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");

      const resposta = await api.get("/obras", {
        params: { titulo: searchTerm },
      });

      setObras(Array.isArray(resposta.data?.dados) ? resposta.data.dados : []);
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os dados."
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchDados, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchDados]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SearchCheck size={28} />
        <h1>Pesquisar</h1>
      </div>

      <section className={styles.searchArea}>
        <h2>O que você quer descobrir hoje?</h2>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Pesquise pelo título da obra..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <button
            type="button"
            aria-label="Pesquisar"
            onClick={fetchDados}
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
              onClick={() => setSearchTerm(sugestao)}
            >
              {sugestao}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className={styles.mensagem}>
          <p>Carregando obras...</p>
        </div>
      ) : erro ? (
        <div className={styles.mensagem} role="alert">
          <p>{erro}</p>
          <button type="button" onClick={fetchDados}>
            Tentar novamente
          </button>
        </div>
      ) : obras.length > 0 ? (
        <div className={styles.fileira}>
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
      ) : (
        <div className={styles.mensagem}>
          <p>Nenhuma obra encontrada para &quot;{searchTerm}&quot;.</p>
        </div>
      )}
    </div>
  );
}

export default Pesquisa;
