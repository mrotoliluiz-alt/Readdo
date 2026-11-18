
import styles from "./index.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";

import {
  PenTool,
  Upload,
  Plus,
  Search,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  CheckCircle2,
  Trash2,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
  Pencil,
  Save,
} from "lucide-react";

export default function Oficina() {
  const usuarioSalvo = localStorage.getItem("usuario");
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  const Us_ID = usuario?.id;

  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Guarda a obra que está sendo editada no modal.
  const [obraSelecionada, setObraSelecionada] = useState(null);

  // Guarda a obra aberta no editor.
  const [obraAberta, setObraAberta] = useState(null);

  // Guarda os capítulos da obra aberta.
  const [capitulos, setCapitulos] = useState([]);
  const [capituloSelecionado, setCapituloSelecionado] = useState(null);
  const [loadingCapitulos, setLoadingCapitulos] = useState(false);
  const [erroCapitulos, setErroCapitulos] = useState(null);

  const [formData, setFormData] = useState({
    Ob_titulo: "",
    Ob_genero: "",
    Ob_sinopse: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

 const fetchDados = async () => {
  try {
    setLoading(true);
    setErro(null);

    const response = await api.get(`/obras/usuario/${Us_ID}`);

    setObras(response.data.dados);

    return response.data.dados;
  } catch (error) {
    console.error("Erro ao listar obras:", error);
    setErro("Não foi possível carregar suas obras.");
  } finally {
    setLoading(false);
  }
};

  // Busca os capítulos da obra selecionada.
  const fetchCapitulos = async (Ob_ID) => {
    try {
      setLoadingCapitulos(true);
      setErroCapitulos(null);
      setCapitulos([]);
      setCapituloSelecionado(null);

      const response = await api.get(`/capitulos/obra/${Ob_ID}`);

      if (response.data.sucesso) {
        setCapitulos(response.data.dados);
      }
    } catch (error) {
      console.error("Erro ao listar capítulos:", error);
      console.log("Resposta do backend:", error.response?.data);

      setErroCapitulos(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os capítulos."
      );
    } finally {
      setLoadingCapitulos(false);
    }
  };

  // Abre uma obra e carrega seus capítulos.
  const handleObraClick = (obra) => {
    setObraAberta(obra);
    fetchCapitulos(obra.Ob_ID);
  };

  // Seleciona um capítulo para exibir seu conteúdo no editor.
  const handleCapituloClick = (capitulo) => {
    setCapituloSelecionado(capitulo);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Abre o modal preenchendo os campos com os dados da obra selecionada.
  const handleEditClick = (obra) => {
    setObraSelecionada(obra);

    setFormData({
      Ob_titulo: obra.Ob_titulo || "",
      Ob_genero: obra.Ob_genero || "",
      Ob_sinopse: obra.Ob_sinopse || "",
    });

    setSelectedFile(null);
    setErro(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErro(null);

      const data = new FormData();

      data.append("Us_ID", Us_ID);
      data.append("Ob_titulo", formData.Ob_titulo);
      data.append("Ob_sinopse", formData.Ob_sinopse);
      data.append("Ob_genero", formData.Ob_genero);

      if (selectedFile) {
        data.append("img", selectedFile);
      }

      if (obraSelecionada) {
        // EDIÇÃO: PUT /obras/:id
        const response = await api.put(
          `/obras/${obraSelecionada.Ob_ID}`,
          data
        );

        if (response.data.sucesso) {
          alert("Obra atualizada com sucesso!");

          // Atualiza a listagem com os dados do servidor.
          const obrasAtualizadas = await fetchDados();

          // Atualiza também a obra que está aberta no editor.
          if (obraAberta?.Ob_ID === obraSelecionada.Ob_ID) {
            const obraAtualizada = obrasAtualizadas.find((obra) => obra.Ob_ID === obraSelecionada.Ob_ID)

            if (obraAtualizada) {
    setObraAberta(obraAtualizada);
  }

          };

          
        }
      } else {
        // CADASTRO: POST /obras
        const response = await api.post("/obras", data);

        setObras([...obras, response.data.dados]);

        alert("Obra cadastrada com sucesso!");
      }

      setFormData({
        Ob_titulo: "",
        Ob_genero: "",
        Ob_sinopse: "",
      });

      setSelectedFile(null);
      setObraSelecionada(null);
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar obra:", error);
      console.log("Resposta do backend:", error.response?.data);
      console.log("ID do usuário:", Us_ID);

      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível salvar a obra."
      );
    } finally {
      setLoading(false);
    }
  };

  // Exclui uma obra.
  const excluirObra = async (Ob_ID) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta obra?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      const response = await api.delete(`/obras/${Ob_ID}`);

      if (response.data.sucesso) {
        setObras(obras.filter((obra) => obra.Ob_ID !== Ob_ID));

        // Limpa o editor caso a obra excluída estivesse aberta.
        if (obraAberta?.Ob_ID === Ob_ID) {
          setObraAberta(null);
          setCapitulos([]);
          setCapituloSelecionado(null);
        }

        alert("Obra excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir obra:", error);
      console.log("Resposta do backend:", error.response?.data);

      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível excluir a obra."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Us_ID) {
      fetchDados();
    } else {
      setErro("Usuário não identificado. Faça login novamente.");
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.title}>
            <PenTool />
            <h1>Oficina Autoral</h1>
          </div>
          <p>Crie, escreva e dê vida às suas histórias.</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.importar}>
            <Upload size={18} />
            Importar obra
          </button>

          <input type="file" accept=".txt" />

          <button
            className={styles.novaObra}
            onClick={() => {
              setObraSelecionada(null);
              setFormData({
                Ob_titulo: "",
                Ob_genero: "",
                Ob_sinopse: "",
              });
              setSelectedFile(null);
              setErro(null);
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            Nova Obra
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className={styles.semObras}>
          {erro}
        </p>
      )}

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Buscar obra..." />
            <Search size={18} />
          </div>

          <div className={styles.obrasHeader}>
            <span>MINHAS OBRAS</span>
            <button
              title="Nova obra"
              onClick={() => {
                setObraSelecionada(null);
                setFormData({
                  Ob_titulo: "",
                  Ob_genero: "",
                  Ob_sinopse: "",
                });
                setSelectedFile(null);
                setErro(null);
                setShowModal(true);
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className={styles.listaObras}>
            {loading ? (
              <p className={styles.semObras}>Carregando obras...</p>
            ) : erro ? (
              <p className={styles.semObras}>{erro}</p>
            ) : obras.length === 0 ? (
              <p className={styles.semObras}>Nenhuma obra ainda :(</p>
            ) : (
              obras.map((obra) => (
                <div
                  key={obra.Ob_ID}
                  className={styles.obraCard}
                  onClick={() => handleObraClick(obra)}
                  style={{
                    cursor: "pointer",
                    border:
                      obraAberta?.Ob_ID === obra.Ob_ID
                        ? "1px solid #0FA6B3"
                        : undefined,
                  }}
                >
                  <div className={styles.miniCapa}>
                    {obra.Ob_imagem ? (
                      <img
                        src={obra.Ob_imagem}
                        alt={`Capa de ${obra.Ob_titulo}`}
                      />
                    ) : (
                      <Image size={20} />
                    )}
                  </div>

                  <div className={styles.obraTextos}>
                    <h3 title={obra.Ob_titulo}>{obra.Ob_titulo}</h3>
                    <span>{obra.Ob_genero}</span>
                    <p></p>
                  </div>

                  <button
                    className={styles.botaoExcluir}
                    onClick={(e) => {
                      e.stopPropagation();
                      excluirObra(obra.Ob_ID);
                    }}
                    title="Excluir obra"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    className={styles.editarInfo}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(obra);
                    }}
                    title="Editar obra"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className={styles.editor}>
          <>
            <div className={styles.editorHeader}>
              <div className={styles.infoObra}>
                <div
                  className={styles.capaObra}
                  title="Clique para adicionar ou trocar a imagem"
                >
                  {obraAberta?.Ob_imagem ? (
                    <img
                      src={obraAberta.Ob_imagem}
                      alt={`Capa de ${obraAberta.Ob_titulo}`}
                    />
                  ) : (
                    <div className={styles.semImagem}>
                      <Image size={30} />
                      <span>Adicionar imagem</span>
                    </div>
                  )}
                </div>

                <input type="file" accept="image/*" hidden />

                <div className={styles.dadosObra}>
                  <div className={styles.tituloLinha}>
                    <h2>{obraAberta?.Ob_titulo || ""}</h2>
                    {obraAberta && (
                      <button
                        className={styles.editarInfo}
                        title="Editar obra"
                        onClick={() => handleEditClick(obraAberta)}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    )}
                  </div>

                  <p className={styles.descricaoObra}>
                    {obraAberta?.Ob_sinopse || ""}
                  </p>

                  <div className={styles.salvamento}>
                    <CheckCircle2 size={15} color="#22c55e" />
                    <span>
                      {capituloSelecionado
                        ? "Texto carregado do servidor"
                        : "Selecione um capítulo"}
                    </span>
                  </div>
                </div>
              </div>

              <span className={styles.palavras}>palavras</span>
            </div>

            <div className={styles.capitulosContainer}>
              <div className={styles.capitulosHeader}>
                <div>
                  <span>CAPÍTULOS</span>
                  <small>{capitulos.length} capítulo(s)</small>
                </div>
                <button>
                  <Plus size={16} />
                  Novo capítulo
                </button>
              </div>

              <div className={styles.listaCapitulos}>
                {loadingCapitulos ? (
                  <p className={styles.semObras}>
                    Carregando capítulos...
                  </p>
                ) : erroCapitulos ? (
                  <p className={styles.semObras}>{erroCapitulos}</p>
                ) : !obraAberta ? (
                  <p className={styles.semObras}>
                    Selecione uma obra para visualizar seus capítulos.
                  </p>
                ) : capitulos.length === 0 ? (
                  <p className={styles.semObras}>
                    Esta obra ainda não possui capítulos.
                  </p>
                ) : (
                  capitulos.map((capitulo) => (
                    <button
                      key={capitulo.Cap_ID}
                      onClick={() => handleCapituloClick(capitulo)}
                      style={{
                        border:
                          capituloSelecionado?.Cap_ID === capitulo.Cap_ID
                            ? "1px solid #0FA6B3"
                            : undefined,
                      }}
                    >
                      <span className={styles.numeroCapitulo}>
                        {capitulo.Cap_ordem}
                      </span>
                      <span className={styles.nomeCapitulo}>
                        {capitulo.Cap_titulo}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownBotao}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Título 1 <ChevronDown size={15} />
                </button>

                <div className={styles.dropdownMenu}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => aplicarEstilo("titulo1")}
                  >
                    <span className={styles.previewH1}>Título 1</span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => aplicarEstilo("titulo2")}
                  >
                    <span className={styles.previewH2}>Título 2</span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => aplicarEstilo("titulo3")}
                  >
                    <span className={styles.previewH3}>Título 3</span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => aplicarEstilo("paragrafo")}
                  >
                    Parágrafo
                  </button>
                </div>
              </div>

              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownBotao}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {}}
                >
                  <span id="nomeFonte">Arial</span>
                  <ChevronDown size={15} />
                </button>

                <div className={styles.dropdownMenu}>
                  {[
                    "Arial",
                    "Georgia",
                    "Times New Roman",
                    "Verdana",
                    "Trebuchet MS",
                    "Courier New",
                  ].map((fonte) => (
                    <button
                      key={fonte}
                      style={{ fontFamily: fonte }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aplicarFonte(fonte)}
                    >
                      {fonte}
                    </button>
                  ))}
                </div>
              </div>

              <button
                title="Negrito"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("bold")}
              >
                <Bold size={16} />
              </button>
              <button
                title="Itálico"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("italic")}
              >
                <Italic size={16} />
              </button>
              <button
                title="Sublinhado"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("underline")}
              >
                <Underline size={16} />
              </button>
              <button
                title="Tachado"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("strikeThrough")}
              >
                <Strikethrough size={16} />
              </button>
              <button
                title="Alinhar à esquerda"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("justifyLeft")}
              >
                <AlignLeft size={16} />
              </button>
              <button
                title="Centralizar"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("justifyCenter")}
              >
                <AlignCenter size={16} />
              </button>
              <button
                title="Alinhar à direita"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("justifyRight")}
              >
                <AlignRight size={16} />
              </button>
              <button
                title="Justificar"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatarTexto("justifyFull")}
              >
                <AlignJustify size={16} />
              </button>
            </div>

            <div
              className={styles.textEditor}
              contentEditable
              suppressContentEditableWarning
            >
              {capituloSelecionado?.Cap_conteudo || ""}
            </div>
          </>

          <div className={styles.editorVazio}>
            <PenTool size={45} />
            <h2>
              {loading ? "Carregando suas obras..." : "Crie sua primeira obra"}
            </h2>
            <p>Comece a escrever sua história.</p>
            <button
              className={styles.novaObra}
              onClick={() => {
                setObraSelecionada(null);
                setFormData({
                  Ob_titulo: "",
                  Ob_genero: "",
                  Ob_sinopse: "",
                });
                setSelectedFile(null);
                setErro(null);
                setShowModal(true);
              }}
            >
              <Plus size={18} />
              Nova Obra
            </button>
          </div>
        </main>
      </section>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setObraSelecionada(null);
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{obraSelecionada ? "Editar obra" : "Nova obra"}</h2>
                <p>
                  {obraSelecionada
                    ? "Altere as informações da sua história."
                    : "Comece uma nova história."}
                </p>
              </div>

              <button
                className={styles.fecharModal}
                onClick={() => {
                  setShowModal(false);
                  setObraSelecionada(null);
                  setErro(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalForm}>
              <label>
                Título da obra
                <input
                  autoFocus
                  name="Ob_titulo"
                  placeholder="Ex.: A Cidade Perdida"
                  value={formData.Ob_titulo}
                  onChange={handleChange}
                />
              </label>

              <label>
                Gênero
                <input
                  name="Ob_genero"
                  placeholder="Ex.: Fantasia"
                  value={formData.Ob_genero}
                  onChange={handleChange}
                />
              </label>

              <label>
                Descrição
                <textarea
                  name="Ob_sinopse"
                  placeholder="Escreva uma breve descrição da sua obra..."
                  value={formData.Ob_sinopse}
                  onChange={handleChange}
                />
              </label>

              <label>
                {obraSelecionada ? "Trocar capa" : "Capa da obra"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              {selectedFile && (
                <p>{selectedFile.name}</p>
              )}

              {erro && <p role="alert">{erro}</p>}
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.cancelar}
                onClick={() => {
                  setShowModal(false);
                  setObraSelecionada(null);
                  setErro(null);
                }}
              >
                Cancelar
              </button>

              <button
                className={styles.confirmar}
                onClick={handleSubmit}
                disabled={loading}
              >
                {obraSelecionada ? (
                  <Save size={18} />
                ) : (
                  <Plus size={18} />
                )}

                {loading
                  ? "Salvando..."
                  : obraSelecionada
                    ? "Salvar alterações"
                    : "Criar obra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
