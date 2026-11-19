import styles from "./index.module.css";

import { useEffect, useState } from "react";

import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

import { BookOpen, ArrowLeft, Bookmark } from "lucide-react";

function LivroAberto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [livro, setLivro] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const buscarLivro = async () => {
            try {
                setCarregando(true);
                setErro("");

                const obraSelecionada = location.state;
                if (obraSelecionada && String(obraSelecionada.id) === id) {
                    setLivro(obraSelecionada);
                    return;
                }

                const resposta = await api.get("/obras");
                const obras = resposta.data?.dados || [];
                const obra = obras.find((item) => String(item.id) === id);

                if (!obra) throw new Error("Livro não encontrado.");
                setLivro(obra);
            } catch (erro) {
                console.error(erro);

                setErro(
                    erro.message ||
                        "Não foi possível carregar o livro."
                );
            } finally {
                setCarregando(false);
            }
        };

        buscarLivro();
    }, [id, location.state]);

    /* =========================
       CARREGANDO
    ========================= */

    if (carregando) {
        return (
            <div className={styles.container}>
                <p>Carregando livro...</p>
            </div>
        );
    }

    /* =========================
       ERRO
    ========================= */

    if (erro || !livro) {
        return (
            <div className={styles.container}>
                <p>{erro || "Livro não encontrado."}</p>

                <button onClick={() => navigate(-1)}>
                    Voltar
                </button>
            </div>
        );
    }

    /* =========================
       INFORMAÇÕES DO LIVRO
    ========================= */

    const imagem = livro.imagem;

    return (
        <div className={styles.container}>

            {/* BOTÃO VOLTAR */}

            <button
                className={styles.voltar}
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={20} />
                Voltar
            </button>


            {/* LIVRO */}

            <div className={styles.livro}>

                {/* CAPA */}

                <div className={styles.capa}>

                    {imagem ? (
                        <img
                            src={imagem}
                            alt={`Capa de ${livro.titulo || "livro"}`}
                        />
                    ) : (
                        <div className={styles.semCapa}>
                            <BookOpen size={60} />
                        </div>
                    )}

                </div>


                {/* INFORMAÇÕES */}

                <div className={styles.informacoes}>

                    <span className={styles.tipo}>
                        {livro.genero || "Livro"}
                    </span>

                    <h1>
                        {livro.titulo ||
                            "Título desconhecido"}
                    </h1>

                    <h2>
                        {livro.autor ||
                            "Autor desconhecido"}
                    </h2>


                    {/* DESCRIÇÃO */}

                    {livro.sinopse && (
                        <div
                            className={styles.descricao}
                        >
                            {livro.sinopse}
                        </div>
                    )}


                    {/* Botões */}
                    <div className={styles.botoes}>

                        <button
                        className={styles.ler}
                        onClick={() =>
                            navigate(`/livro/${id}/ler`)
                        }
                    >
                        <BookOpen size={20} />

                        Começar a ler
                    </button>

                    <button
                    className={styles.salvar}>
                        <Bookmark size={20} />

                    </button>

                    </div>
                    
                </div>

            </div>

        </div>
    );
}

export default LivroAberto;