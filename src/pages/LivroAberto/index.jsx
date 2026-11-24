import styles from "./index.module.css";

import { useEffect, useRef, useState } from "react";

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
    const [salvandoFavorito, setSalvandoFavorito] = useState(false);
    const [favoritoSalvo, setFavoritoSalvo] = useState(false);
    const [erroFavorito, setErroFavorito] = useState("");
    const obraLendoCadastrada = useRef("");

    useEffect(() => {
        const buscarLivro = async () => {
            try {
                setCarregando(true);
                setErro("");
                setFavoritoSalvo(false);
                setErroFavorito("");

                const obraSelecionada = location.state;
                if (
                    obraSelecionada &&
                    String(obraSelecionada.Ob_ID ?? obraSelecionada.id) === id
                ) {
                    setLivro(obraSelecionada);
                    return;
                }

                const resposta = await api.get("/obras");
                const obras = resposta.data?.dados || [];
                const obra = obras.find(
                    (item) => String(item.Ob_ID ?? item.id) === id
                );

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

    useEffect(() => {
        const cadastrarObraLendo = async () => {
            if (!livro) return;

            let usuario;
            try {
                usuario = JSON.parse(localStorage.getItem("usuario") || "null");
            } catch (error) {
                console.error("Erro ao ler o usuário salvo:", error);
                setErroFavorito("Não foi possível identificar o usuário salvo.");
                return;
            }

            const usuarioId = Number(usuario?.id ?? usuario?.Us_ID);
            const obraId = Number(livro?.Ob_ID ?? livro?.id);
            const cadastroId = `${usuarioId}:${obraId}`;

            if (
                !Number.isInteger(usuarioId) ||
                usuarioId <= 0 ||
                !Number.isInteger(obraId) ||
                obraId <= 0 ||
                obraLendoCadastrada.current === cadastroId
            ) {
                return;
            }

            obraLendoCadastrada.current = cadastroId;

            try {
                setErroFavorito("");
                setSalvandoFavorito(true);

                const resposta = await api.post("/favoritossalvos", {
                    Ob_ID: obraId,
                    Us_ID: usuarioId,
                    Fav_status: "Lendo",
                });

                if (resposta.data?.sucesso === false) {
                    throw new Error(
                        resposta.data.mensagem || "Não foi possível cadastrar a obra como lendo."
                    );
                }

                setFavoritoSalvo(true);
            } catch (error) {
                console.error("Erro ao cadastrar obra como lendo:", error);
                obraLendoCadastrada.current = "";
                setErroFavorito(
                    error.response?.data?.mensagem ||
                        error.message ||
                        "Não foi possível cadastrar a obra como lendo."
                );
            } finally {
                setSalvandoFavorito(false);
            }
        };

        cadastrarObraLendo();
    }, [livro]);

    const salvarFavorito = async () => {
        setErroFavorito("");

        let usuario;
        try {
            usuario = JSON.parse(localStorage.getItem("usuario") || "null");
        } catch (error) {
            console.error("Erro ao ler o usuário salvo:", error);
            setErroFavorito("Não foi possível identificar o usuário salvo.");
            return;
        }

        const usuarioId = usuario?.id ?? usuario?.Us_ID;
        const obraId = livro?.Ob_ID ?? livro?.id;
        const usuarioIdNumerico = Number(usuarioId);
        const obraIdNumerico = Number(obraId);

        if (
            !Number.isInteger(usuarioIdNumerico) ||
            usuarioIdNumerico <= 0 ||
            !Number.isInteger(obraIdNumerico) ||
            obraIdNumerico <= 0
        ) {
            setErroFavorito("Não foi possível identificar o usuário ou a obra.");
            return;
        }

        try {
            setSalvandoFavorito(true);

            const resposta = await api.post("/favoritossalvos", {
                Ob_ID: obraIdNumerico,
                Us_ID: usuarioIdNumerico,
                Fav_status: "Lendo",
            });

            if (resposta.data?.sucesso === false) {
                throw new Error(
                    resposta.data.mensagem || "Não foi possível salvar a obra."
                );
            }

            setFavoritoSalvo(true);
        } catch (error) {
            console.error("Erro ao salvar obra nos favoritos:", error);
            setErroFavorito(
                error.response?.data?.mensagem ||
                    error.message ||
                    "Não foi possível salvar a obra."
            );
        } finally {
            setSalvandoFavorito(false);
        }
    };

    if (carregando) {
        return (
            <div className={styles.container}>
                <p>Carregando livro...</p>
            </div>
        );
    }

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


    const imagem = livro.imagem || livro.Ob_imagem || livro.Imagem;

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



                <div className={styles.informacoes}>

                    <span className={styles.tipo}>
                        {livro.genero || livro.Genero || "Livro"}
                    </span>

                    <h1>
                        {livro.titulo || livro.Ob_titulo ||
                            "Título desconhecido"}
                    </h1>

                    <h2>
                        {livro.autor || livro.Ob_autor || livro.Autor ||
                            "Autor desconhecido"}
                    </h2>


                    {(livro.sinopse || livro.Ob_sinopse) && (
                        <div
                            className={styles.descricao}
                        >
                            {livro.sinopse || livro.Ob_sinopse}
                        </div>
                    )}


                    {/* Botões */}
                    <div className={styles.botoes}>

                        <button
                        className={styles.ler}
                        onClick={() =>
                            navigate(`/livro/${id}/ler`, {
                                state: { livro },
                            })
                        }
                    >
                        <BookOpen size={20} />

                        Começar a ler
                    </button>

                    <button
                        type="button"
                        className={styles.salvar}
                        onClick={salvarFavorito}
                        disabled={salvandoFavorito || favoritoSalvo}
                        aria-label={favoritoSalvo ? "Obra salva" : "Salvar obra"}
                        title={favoritoSalvo ? "Obra salva" : "Salvar obra"}
                    >
                        <Bookmark
                            size={20}
                            fill={favoritoSalvo ? "currentColor" : "none"}
                        />
                    </button>

                    </div>

                    {salvandoFavorito && (
                        <p className={styles.feedbackFavorito} role="status">
                            Salvando obra...
                        </p>
                    )}
                    {favoritoSalvo && (
                        <p className={styles.feedbackFavorito} role="status">
                            Obra adicionada aos salvos.
                        </p>
                    )}
                    {erroFavorito && (
                        <p className={styles.erroFavorito} role="alert">
                            {erroFavorito}
                        </p>
                    )}
                    
                </div>

            </div>

        </div>
    );
}

export default LivroAberto;