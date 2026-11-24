import { useEffect, useState } from "react";
import styles from "./index.module.css";
import CardLivro from "../../componentes/CardLivro";
import { Bookmark, Search, X } from "lucide-react";
import api from "../../services/api";


function Salvos() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let requisicaoAtiva = true;

    const fetchDados = async () => {
      try {
        setLoading(true);
        setErro("");

        let usuario;
        try {
          usuario = JSON.parse(localStorage.getItem("usuario") || "null");
        } catch (error) {
          console.error("Erro ao encontrar o usuário salvo:", error);
        }

        const usuarioId = Number(usuario?.id ?? usuario?.Us_ID);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
          throw new Error("Usuario invalido");
        }

        const respostaFavoritos = await api.get(
          `/favoritos/usuario/${usuarioId}`
        );
        const favoritos = respostaFavoritos.data?.dados;

        if (!Array.isArray(favoritos)) {
          throw new Error("A resposta da API não contém uma lista de favoritos.");
        }

        const favoritosSalvos = favoritos.filter(
          (favorito) =>
            String(favorito.Fav_status ?? "").trim().toLowerCase() === "favorito"
        );

        const obrasDetalhadas = await Promise.all(
          favoritosSalvos.map(async (favorito) => {
            const obraId = Number(favorito.Ob_ID);

            if (!Number.isInteger(obraId) || obraId <= 0) {
              throw new Error("Um favorito não possui um ID de obra válido.");
            }

            const respostaObra = await api.get(`/obras/detalhada/${obraId}`);
            const obra = respostaObra.data?.dados ?? respostaObra.data;

            if (!obra?.Ob_ID) {
              throw new Error(`Não foi possível carregar a obra ${obraId}.`);
            }

            return obra;
          })
        );

        if (requisicaoAtiva) {
          setObras(obrasDetalhadas);
        }
      } catch (error) {
        console.error("Erro ao carregar obras salvas:", error);

        if (requisicaoAtiva) {
          setErro(
            error.response?.data?.mensagem ||
              error.message ||
              "Não foi possível carregar os dados."
          );
        }
      } finally {
        if (requisicaoAtiva) {
          setLoading(false);
        }
      }
    };

    fetchDados();

    return () => {
      requisicaoAtiva = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Bookmark className={styles.iconeHeader} />

        <div>
          <h1>Minhas Obras Salvas</h1>
          <p>Todas as obras que você salvou para ler depois.</p>
        </div>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : erro ? (
        <p role="alert">{erro}</p>
      ) : obras.length > 0 ? (
        <section className={styles.cardObras}>
          {obras.map((obra) => (
            <CardLivro
              key={obra.Ob_ID}
              id={obra.Ob_ID}
              titulo={obra.Ob_titulo}
              autor={obra.Autor}
              tipo={obra.Ob_genero}
              imagem={
                obra.Ob_imagem && /^https?:\/\//i.test(obra.Ob_imagem)
                  ? obra.Ob_imagem
                  : obra.Ob_imagem
                    ? `${api.defaults.baseURL.replace(/\/$/, "")}/public/obras/${encodeURIComponent(obra.Ob_imagem)}`
                    : undefined
              }
              navigationState={obra}
            />
          ))}
        </section>
      ) : (
        <p>Você ainda não salvou nenhuma obra.</p>
      )}
    </div>
  );
};

export default Salvos;