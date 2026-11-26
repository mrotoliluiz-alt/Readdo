import { useEffect, useState } from "react";
import styles from "./index.module.css";
import CardLivro from "../../componentes/CardLivro";
import { Bookmark } from "lucide-react";
import { buscarObrasDoUsuario } from "../../services/obrasUsuario";

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

        const obrasSalvas = await buscarObrasDoUsuario(
          usuarioId,
          "favorito"
        );

        if (requisicaoAtiva) {
          setObras(obrasSalvas);
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
              key={obra.Ob_ID ?? obra.id}
              id={obra.Ob_ID ?? obra.id}
              titulo={obra.titulo ?? obra.Ob_titulo}
              autor={obra.autor ?? obra.Ob_autor ?? obra.Autor}
              tipo={obra.genero ?? obra.Genero ?? obra.Ob_genero}
              imagem={obra.imagem ?? obra.Ob_imagem ?? obra.Imagem}
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