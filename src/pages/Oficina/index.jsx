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

function Oficina() {
  const fileInputRef = useRef(null);
  const imagemInputRef = useRef(null);
  const editorRef = useRef(null);

  const [obras, setObras] = useState([]);
  const [obraAtivaId, setObraAtivaId] = useState(null);
  const [capituloAtivoId, setCapituloAtivoId] = useState(null);

  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [modalNovaObra, setModalNovaObra] = useState(false);
  const [modalEditarObra, setModalEditarObra] = useState(false);
  const [modalNovoCapitulo, setModalNovoCapitulo] = useState(false);

  const [novaObra, setNovaObra] = useState({
    titulo: "",
    genero: "",
    descricao: "",
    img: null,
  });

  const [obraEditada, setObraEditada] = useState({
    titulo: "",
    genero: "",
    descricao: "",
    img: null,
  });

  const [novoCapitulo, setNovoCapitulo] = useState({ titulo: "" });
  const [preview, setPreview] = useState(null);

  const [menuEstilo, setMenuEstilo] = useState(false);
  const [menuFonte, setMenuFonte] = useState(false);

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  const usuarioId =
    usuario?.Us_ID ??
    usuario?.us_id ??
    usuario?.id ??
    usuario?.ID;

  const normalizarObra = (obra) => {
    const capitulos = Array.isArray(obra.capitulos)
      ? obra.capitulos.map((capitulo, index) => ({
          id: capitulo.id ?? capitulo.Cap_ID ?? index + 1,
          titulo:
            capitulo.titulo ??
            capitulo.Cap_titulo ??
            `Capítulo ${index + 1}`,
          conteudo: capitulo.conteudo ?? capitulo.Cap_conteudo ?? "",
        }))
      : [];

    return {
      ...obra,
      id: obra.id ?? obra.Ob_ID,
      titulo: obra.titulo ?? obra.Ob_titulo ?? "",
      descricao: obra.descricao ?? obra.Ob_sinopse ?? "",
      genero: obra.genero ?? obra.Ob_genero ?? "",
      imagem: obra.imagem ?? obra.Ob_imagem ?? null,
      capitulos,
      data: obra.data ?? "",
    };
  };

  const carregarObras = async (idSelecionado = null) => {
    try {
      setLoading(true);
      setErro("");

      if (!usuarioId) {
        setObras([]);
        setErro("Não foi possível identificar o usuário conectado.");
        return;
      }

      const resposta = await api.get(`/obras/usuario/${usuarioId}`);
      const dados = Array.isArray(resposta.data?.dados)
        ? resposta.data.dados
        : Array.isArray(resposta.data)
          ? resposta.data
          : [];

      const lista = dados.map(normalizarObra);
      setObras(lista);

      const idParaSelecionar = idSelecionado ?? obraAtivaId;
      const obraSelecionada = lista.find(
        (obra) => String(obra.id) === String(idParaSelecionar)
      );

      if (obraSelecionada) {
        setObraAtivaId(obraSelecionada.id);
        setCapituloAtivoId(obraSelecionada.capitulos[0]?.id ?? null);
      } else if (lista.length > 0) {
        setObraAtivaId(lista[0].id);
        setCapituloAtivoId(lista[0].capitulos[0]?.id ?? null);
      } else {
        setObraAtivaId(null);
        setCapituloAtivoId(null);
      }
    } catch (error) {
      console.error("Erro ao carregar as obras:", error);
      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível carregar suas obras."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarObras();
    // A carga inicial deve acontecer apenas quando a tela abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obraAtiva = obras.find(
    (obra) => String(obra.id) === String(obraAtivaId)
  );

  const capituloAtivo = obraAtiva?.capitulos?.find(
    (capitulo) => String(capitulo.id) === String(capituloAtivoId)
  );

  // Aguarda 500 ms após a digitação antes de atualizar o filtro,
  // seguindo a técnica de debounce apresentada no material do professor.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaDebounced(busca);
    }, 500);

    return () => clearTimeout(temporizador);
  }, [busca]);

  const obrasFiltradas = useMemo(
    () =>
      obras.filter((obra) =>
        (obra.titulo || "").toLowerCase().includes(buscaDebounced.toLowerCase())
      ),
    [obras, buscaDebounced]
  );

  const palavras = editorRef.current?.innerText
    ?.trim()
    .split(/\s+/)
    .filter(Boolean).length || 0;

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = capituloAtivo?.conteudo || "";
    }
  }, [obraAtivaId, capituloAtivoId]);

  const abrirModalNovaObra = () => {
    setNovaObra({
      titulo: "",
      genero: "",
      descricao: "",
      img: null,
    });
    setPreview(null);
    setErro("");
    setModalNovaObra(true);
  };

  const abrirModalEditarObra = () => {
    if (!obraAtiva) return;

    setObraEditada({
      titulo: obraAtiva.titulo,
      genero: obraAtiva.genero,
      descricao: obraAtiva.descricao,
      img: null,
    });
    setPreview(obraAtiva.imagem || null);
    setErro("");
    setModalEditarObra(true);
  };

  const selecionarObra = (id) => {
    setObraAtivaId(id);
    const obra = obras.find((item) => String(item.id) === String(id));
    setCapituloAtivoId(obra?.capitulos?.[0]?.id ?? null);
  };

  const selecionarCapitulo = (id) => {
    setCapituloAtivoId(id);
  };

  const criarNovaObra = async () => {
    if (!novaObra.titulo.trim()) {
      setErro("Informe o título da obra.");
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const data = new FormData();
      data.append("Ob_titulo", novaObra.titulo.trim());
      data.append("Ob_sinopse", novaObra.descricao);
      data.append("Ob_genero", novaObra.genero);

      if (novaObra.img) {
        data.append("img", novaObra.img);
      }

      // Caso o backend associe a obra ao usuário pelo corpo da requisição.
      if (usuarioId) data.append("Us_ID", usuarioId);

      const resposta = await api.post("/obras", data);
      const idCriado =
        resposta.data?.dados?.id ??
        resposta.data?.dados?.Ob_ID ??
        resposta.data?.dados?.insertId;

      setModalNovaObra(false);
      await carregarObras(idCriado ?? null);
    } catch (error) {
      console.error("Erro ao criar a obra:", error);
      console.log("Resposta do backend:", error.response?.data);
      console.log("Status:", error.response?.status);
      console.log("Dados enviados:", [...data.entries()]);

      setErro(
          error.response?.data?.mensagem ||
          "Não foi possível criar a obra."
      );
  }
  };

  const salvarEdicaoObra = async () => {
    if (!obraAtiva) return;

    if (!obraEditada.titulo.trim()) {
      setErro("Informe o título da obra.");
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const data = new FormData();
      data.append("Ob_titulo", obraEditada.titulo.trim());
      data.append("Ob_sinopse", obraEditada.descricao);
      data.append("Ob_genero", obraEditada.genero);

      if (obraEditada.img) {
        data.append("img", obraEditada.img);
      }

      await api.put(`/obras/${obraAtiva.id}`, data);

      setModalEditarObra(false);
      await carregarObras(obraAtiva.id);
    } catch (error) {
      console.error("Erro ao editar a obra:", error);
      setErro(
        error.response?.data?.mensagem || "Não foi possível editar a obra."
      );
    } finally {
      setLoading(false);
    }
  };

  const excluirObra = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza de que deseja excluir esta obra?"
    );
    if (!confirmar) return;

    try {
      setLoading(true);
      setErro("");
      await api.delete(`/obras/${id}`);

      // Atualiza a lista local após a exclusão, sem fazer outro GET.
      const novaLista = obras.filter((obra) => String(obra.id) !== String(id));
      setObras(novaLista);

      if (String(obraAtivaId) === String(id)) {
        setObraAtivaId(novaLista[0]?.id ?? null);
        setCapituloAtivoId(novaLista[0]?.capitulos?.[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Erro ao excluir a obra:", error);
      setErro(
        error.response?.data?.mensagem || "Não foi possível excluir a obra."
      );
    } finally {
      setLoading(false);
    }
  };

  const selecionarImagemNova = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setNovaObra((anterior) => ({ ...anterior, img: arquivo }));
    setPreview(URL.createObjectURL(arquivo));
  };

  const selecionarImagemEdicao = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setObraEditada((anterior) => ({ ...anterior, img: arquivo }));
    setPreview(URL.createObjectURL(arquivo));
  };

  const adicionarImagem = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo || !obraAtiva) return;

    setObraEditada((anterior) => ({ ...anterior, img: arquivo }));
    setPreview(URL.createObjectURL(arquivo));
    setModalEditarObra(true);
  };

  const importarArquivo = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      const texto = String(leitor.result || "");
      if (editorRef.current) {
        editorRef.current.innerText = texto;
        atualizarConteudo();
      }
    };
    leitor.readAsText(arquivo);
    event.target.value = "";
  };

  const atualizarConteudo = () => {
    if (!editorRef.current || !obraAtiva || !capituloAtivoId) return;

    const conteudo = editorRef.current.innerHTML;
    setObras((anteriores) =>
      anteriores.map((obra) =>
        String(obra.id) === String(obraAtivaId)
          ? {
              ...obra,
              capitulos: obra.capitulos.map((capitulo) =>
                String(capitulo.id) === String(capituloAtivoId)
                  ? { ...capitulo, conteudo }
                  : capitulo
              ),
            }
          : obra
      )
    );
  };

  const abrirModalNovoCapitulo = () => {
    setNovoCapitulo({ titulo: "" });
    setModalNovoCapitulo(true);
  };

  const criarNovoCapitulo = () => {
    if (!novoCapitulo.titulo.trim() || !obraAtiva) return;

    const novoId = `local-${Date.now()}`;
    const capitulo = {
      id: novoId,
      titulo: novoCapitulo.titulo.trim(),
      conteudo: "",
    };

    setObras((anteriores) =>
      anteriores.map((obra) =>
        String(obra.id) === String(obraAtivaId)
          ? { ...obra, capitulos: [...obra.capitulos, capitulo] }
          : obra
      )
    );
    setCapituloAtivoId(novoId);
    setModalNovoCapitulo(false);
  };

  const formatarTexto = (comando) => {
    editorRef.current?.focus();
    document.execCommand(comando, false, null);
    atualizarConteudo();
  };

  const aplicarEstilo = (estilo) => {
    const comandos = {
      titulo1: "H1",
      titulo2: "H2",
      titulo3: "H3",
      paragrafo: "P",
    };
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, comandos[estilo]);
    setMenuEstilo(false);
    atualizarConteudo();
  };

  const aplicarFonte = (fonte) => {
    editorRef.current?.focus();
    document.execCommand("fontName", false, fonte);
    setMenuFonte(false);
    atualizarConteudo();
  };

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
          <button
            className={styles.importar}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            Importar obra
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            style={{ display: "none" }}
            onChange={importarArquivo}
          />
          <button className={styles.novaObra} onClick={abrirModalNovaObra}>
            <Plus size={18} />
            Nova Obra
          </button>
        </div>
      </div>

      {erro && <p role="alert" className={styles.semObras}>{erro}</p>}

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBar}>
            <input
              placeholder="Buscar obra..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search size={18} />
          </div>

          <div className={styles.obrasHeader}>
            <span>MINHAS OBRAS</span>
            <button onClick={abrirModalNovaObra} title="Nova obra">
              <Plus size={16} />
            </button>
          </div>

          <div className={styles.listaObras}>
            {loading && obras.length === 0 ? (
              <p className={styles.semObras}>Carregando obras...</p>
            ) : obrasFiltradas.length === 0 ? (
              <p className={styles.semObras}>Nenhuma obra encontrada.</p>
            ) : (
              obrasFiltradas.map((obra) => (
                <div
                  key={obra.id}
                  className={`${styles.obraCard} ${
                    String(obra.id) === String(obraAtivaId)
                      ? styles.obraAtiva
                      : ""
                  }`}
                  onClick={() => selecionarObra(obra.id)}
                >
                  <div className={styles.miniCapa}>
                    {obra.imagem ? (
                      <img src={obra.imagem} alt={`Capa de ${obra.titulo}`} />
                    ) : (
                      <Image size={20} />
                    )}
                  </div>

                  <div className={styles.obraTextos}>
                    <h3 title={obra.titulo}>{obra.titulo}</h3>
                    <span>{obra.genero}</span>
                    <p>
                      {obra.capitulos.length || 0} capítulo
                      {obra.capitulos.length === 1 ? "" : "s"}
                      {obra.data ? ` • ${obra.data}` : ""}
                    </p>
                  </div>

                  <button
                    className={styles.botaoExcluir}
                    onClick={(e) => {
                      e.stopPropagation();
                      excluirObra(obra.id);
                    }}
                    title="Excluir obra"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className={styles.editor}>
          {obraAtiva ? (
            <>
              <div className={styles.editorHeader}>
                <div className={styles.infoObra}>
                  <div
                    className={styles.capaObra}
                    onClick={() => imagemInputRef.current?.click()}
                    title="Clique para adicionar ou trocar a imagem"
                  >
                    {preview && modalEditarObra ? (
                      <img src={preview} alt="Prévia da capa" />
                    ) : obraAtiva.imagem ? (
                      <img src={obraAtiva.imagem} alt={`Capa de ${obraAtiva.titulo}`} />
                    ) : (
                      <div className={styles.semImagem}>
                        <Image size={30} />
                        <span>Adicionar imagem</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={imagemInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={adicionarImagem}
                  />

                  <div className={styles.dadosObra}>
                    <div className={styles.tituloLinha}>
                      <h2>{obraAtiva.titulo}</h2>
                      <button
                        className={styles.editarInfo}
                        onClick={abrirModalEditarObra}
                        title="Editar obra"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    </div>

                    <p className={styles.descricaoObra}>
                      {obraAtiva.descricao ||
                        "Adicione uma descrição para sua obra."}
                    </p>

                    <div className={styles.salvamento}>
                      <CheckCircle2 size={15} color="#22c55e" />
                      <span>
                        {"Texto não salvo no servidor"}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={styles.palavras}>
                  {palavras.toLocaleString("pt-BR")} palavras
                </span>
              </div>

              <div className={styles.capitulosContainer}>
                <div className={styles.capitulosHeader}>
                  <div>
                    <span>CAPÍTULOS</span>
                    <small>
                      {obraAtiva.capitulos.length} capítulo
                      {obraAtiva.capitulos.length === 1 ? "" : "s"}
                    </small>
                  </div>
                  <button
                    className={styles.novoCapitulo}
                    onClick={abrirModalNovoCapitulo}
                  >
                    <Plus size={16} />
                    Novo capítulo
                  </button>
                </div>

                <div className={styles.listaCapitulos}>
                  {obraAtiva.capitulos.map((capitulo, index) => (
                    <button
                      key={capitulo.id}
                      className={`${styles.capituloBotao} ${
                        String(capitulo.id) === String(capituloAtivoId)
                          ? styles.capituloAtivo
                          : ""
                      }`}
                      onClick={() => selecionarCapitulo(capitulo.id)}
                    >
                      <span className={styles.numeroCapitulo}>{index + 1}</span>
                      <span className={styles.nomeCapitulo}>
                        {capitulo.titulo}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownBotao}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setMenuEstilo(!menuEstilo);
                      setMenuFonte(false);
                    }}
                  >
                    Título 1 <ChevronDown size={15} />
                  </button>
                  {menuEstilo && (
                    <div className={styles.dropdownMenu}>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("titulo1")}>
                        <span className={styles.previewH1}>Título 1</span>
                      </button>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("titulo2")}>
                        <span className={styles.previewH2}>Título 2</span>
                      </button>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("titulo3")}>
                        <span className={styles.previewH3}>Título 3</span>
                      </button>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("paragrafo")}>
                        Parágrafo
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownBotao}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setMenuFonte(!menuFonte);
                      setMenuEstilo(false);
                    }}
                  >
                    <span id="nomeFonte">Arial</span>
                    <ChevronDown size={15} />
                  </button>
                  {menuFonte && (
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
                  )}
                </div>

                <button title="Negrito" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("bold")}>
                  <Bold size={16} />
                </button>
                <button title="Itálico" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("italic")}>
                  <Italic size={16} />
                </button>
                <button title="Sublinhado" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("underline")}>
                  <Underline size={16} />
                </button>
                <button title="Tachado" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("strikeThrough")}>
                  <Strikethrough size={16} />
                </button>
                <button title="Alinhar à esquerda" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("justifyLeft")}>
                  <AlignLeft size={16} />
                </button>
                <button title="Centralizar" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("justifyCenter")}>
                  <AlignCenter size={16} />
                </button>
                <button title="Alinhar à direita" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("justifyRight")}>
                  <AlignRight size={16} />
                </button>
                <button title="Justificar" onMouseDown={(e) => e.preventDefault()} onClick={() => formatarTexto("justifyFull")}>
                  <AlignJustify size={16} />
                </button>
              </div>

              <div
                ref={editorRef}
                className={styles.textEditor}
                contentEditable
                suppressContentEditableWarning
                onInput={atualizarConteudo}
              />
            </>
          ) : (
            <div className={styles.editorVazio}>
              <PenTool size={45} />
              <h2>{loading ? "Carregando suas obras..." : "Crie sua primeira obra"}</h2>
              <p>Comece a escrever sua história.</p>
              <button className={styles.novaObra} onClick={abrirModalNovaObra}>
                <Plus size={18} />
                Nova Obra
              </button>
            </div>
          )}
        </main>
      </section>

      {modalNovaObra && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalNovaObra(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Nova obra</h2>
                <p>Comece uma nova história.</p>
              </div>
              <button className={styles.fecharModal} onClick={() => setModalNovaObra(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalForm}>
              <label>
                Título da obra
                <input
                  autoFocus
                  placeholder="Ex.: A Cidade Perdida"
                  value={novaObra.titulo}
                  onChange={(e) => setNovaObra({ ...novaObra, titulo: e.target.value })}
                />
              </label>
              <label>
                Gênero
                <input
                  placeholder="Ex.: Fantasia"
                  value={novaObra.genero}
                  onChange={(e) => setNovaObra({ ...novaObra, genero: e.target.value })}
                />
              </label>
              <label>
                Descrição
                <textarea
                  placeholder="Escreva uma breve descrição da sua obra..."
                  value={novaObra.descricao}
                  onChange={(e) => setNovaObra({ ...novaObra, descricao: e.target.value })}
                />
              </label>
              <label>
                Capa da obra
                <input type="file" accept="image/*" onChange={selecionarImagemNova} />
                {preview && <img src={preview} alt="Prévia da capa" style={{ maxWidth: 120, marginTop: 8 }} />}
              </label>
              {erro && <p role="alert">{erro}</p>}
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelar} onClick={() => setModalNovaObra(false)}>
                Cancelar
              </button>
              <button className={styles.confirmar} onClick={criarNovaObra} disabled={loading}>
                <Plus size={18} />
                {loading ? "Criando..." : "Criar obra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarObra && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalEditarObra(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Editar obra</h2>
                <p>Altere as informações da sua história.</p>
              </div>
              <button className={styles.fecharModal} onClick={() => setModalEditarObra(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalForm}>
              <label>
                Título da obra
                <input
                  autoFocus
                  value={obraEditada.titulo}
                  onChange={(e) => setObraEditada({ ...obraEditada, titulo: e.target.value })}
                />
              </label>
              <label>
                Gênero
                <input
                  placeholder="Ex.: Fantasia"
                  value={obraEditada.genero}
                  onChange={(e) => setObraEditada({ ...obraEditada, genero: e.target.value })}
                />
              </label>
              <label>
                Descrição
                <textarea
                  placeholder="Escreva uma breve descrição da sua obra..."
                  value={obraEditada.descricao}
                  onChange={(e) => setObraEditada({ ...obraEditada, descricao: e.target.value })}
                />
              </label>
              <label>
                Trocar capa
                <input type="file" accept="image/*" onChange={selecionarImagemEdicao} />
                {preview && <img src={preview} alt="Prévia da capa" style={{ maxWidth: 120, marginTop: 8 }} />}
              </label>
              {erro && <p role="alert">{erro}</p>}
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelar} onClick={() => setModalEditarObra(false)}>
                Cancelar
              </button>
              <button className={styles.confirmar} onClick={salvarEdicaoObra} disabled={loading}>
                <Save size={18} />
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalNovoCapitulo && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalNovoCapitulo(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Novo capítulo</h2>
                <p>Adicione um novo capítulo à sua obra.</p>
              </div>
              <button className={styles.fecharModal} onClick={() => setModalNovoCapitulo(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalForm}>
              <label>
                Título do capítulo
                <input
                  autoFocus
                  placeholder="Ex.: Capítulo 2 – A descoberta"
                  value={novoCapitulo.titulo}
                  onChange={(e) => setNovoCapitulo({ titulo: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") criarNovoCapitulo();
                  }}
                />
              </label>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelar} onClick={() => setModalNovoCapitulo(false)}>
                Cancelar
              </button>
              <button className={styles.confirmar} onClick={criarNovoCapitulo}>
                <Plus size={18} />
                Criar capítulo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Oficina;
