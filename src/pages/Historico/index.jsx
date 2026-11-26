
import { useEffect, useState } from "react";
import { History, BookOpen } from "lucide-react";
import styles from "./index.module.css";
import CardLivro from "../../componentes/CardLivro";
import { buscarObrasDoUsuario } from "../../services/obrasUsuario";

function Historico() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let requisicaoAtiva = true;

    const buscarHistorico = async () => {
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

        const obrasDoHistorico = await buscarObrasDoUsuario(
          usuarioId,
          "lendo"
        );

        if (requisicaoAtiva) {
          setObras(obrasDoHistorico);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico de leituras:", error);

        if (requisicaoAtiva) {
          setErro(
            error.response?.data?.mensagem ||
              error.message ||
              "Não foi possível carregar o histórico."
          );
        }
      } finally {
        if (requisicaoAtiva) {
          setLoading(false);
        }
      }
    };

    buscarHistorico();

    return () => {
      requisicaoAtiva = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <History size={28} />
        <div>
          <h1>Histórico de Leituras</h1>
          <p>Obras que você marcou como "Lendo".</p>
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
              favorito
              navigationState={obra}
            />
          ))}
        </section>
      ) : (
        <div className={styles.estadoVazio}>
          <BookOpen size={42} />
          <h3>Nenhuma obra em leitura</h3>
          <p>Abra uma obra para adicioná-la ao histórico automaticamente.</p>
        </div>
      )}
    </div>
  );
}

export default Historico;