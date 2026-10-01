import styles from "./index.module.css";

import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { BookOpen, ArrowLeft, Bookmark } from "lucide-react";

function LivroAberto() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [livro, setLivro] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const buscarLivro = async () => {
            try {
                setCarregando(true);
                setErro("");

                const API_KEY =
                    import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

                if (!API_KEY) {
                    throw new Error(
                        "A chave da Google Books API não foi configurada."
                    );
                }

                const resposta = await fetch(
                    `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`
                );

                if (!resposta.ok) {
                    throw new Error("Livro não encontrado.");
                }

                const dados = await resposta.json();

                setLivro(dados);
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
    }, [id]);

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

    const info = livro.volumeInfo || {};

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

                    {info.imageLinks?.thumbnail ? (
                        <img
                            src={info.imageLinks.thumbnail}
                            alt={`Capa de ${
                                info.title || "livro"
                            }`}
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
                        Livro
                    </span>

                    <h1>
                        {info.title ||
                            "Título desconhecido"}
                    </h1>

                    <h2>
                        {info.authors?.join(", ") ||
                            "Autor desconhecido"}
                    </h2>


                    {/* DESCRIÇÃO */}

                    {info.description && (
                        <div
                            className={styles.descricao}
                            dangerouslySetInnerHTML={{
                                __html: info.description,
                            }}
                        />
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