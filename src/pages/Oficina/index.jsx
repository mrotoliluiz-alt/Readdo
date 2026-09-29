import styles from "./index.module.css";

import { useEffect, useRef, useState } from "react";

import {
  PenTool,
  Upload,
  Plus,
  Search,
  Tag,
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
} from "lucide-react";

const obrasIniciais = [
  {
    id: 1,
    titulo: "Ecos de Éter",
    genero: "Fantasia",
    capitulo: "Cap. 8",
    data: "12/05/2024",
    conteudo: `
      <h1>Capítulo 8 – O Guardião Despertado</h1>

      <p>O vento uivava entre as torres quebradas de Veyrion, carregando consigo fragmentos de algo antigo, esquecido e perigoso.</p>

      <p>Luna sentia o peso da escolha apertar seu peito enquanto avançava em direção ao altar central. As runas brilhavam, pulsando como um coração adormecido.</p>

      <p>— Você não entende o que está prestes a fazer — disse Kael, surgindo das sombras.</p>

      <p>Mas ela já não tinha mais dúvidas.</p>

      <p>O poder nunca foi o verdadeiro problema.</p>

      <p>O problema sempre foi quem o controlava.</p>
    `,
  },
  {
    id: 2,
    titulo: "O Último Sussurro",
    genero: "Terror",
    capitulo: "Cap. 3",
    data: "10/05/2024",
    conteudo: `
      <h1>Capítulo 3 – O Último Sussurro</h1>

      <p>A casa estava silenciosa naquela noite.</p>

      <p>Marina caminhou lentamente pelo corredor, tentando ignorar o som que vinha do andar de cima.</p>

      <p>Então ouviu novamente.</p>

      <p>Um sussurro.</p>
    `,
  },
  {
    id: 3,
    titulo: "Cidades de Néon",
    genero: "Ficção Científica",
    capitulo: "Cap. 5",
    data: "08/05/2024",
    conteudo: `
      <h1>Capítulo 5 – Cidades de Néon</h1>

      <p>As luzes da cidade refletiam nas janelas dos arranha-céus.</p>

      <p>Entre drones e veículos voadores, ninguém parecia perceber o que estava acontecendo abaixo da superfície.</p>
    `,
  },
  {
    id: 4,
    titulo: "Flores no Concreto",
    genero: "Romance",
    capitulo: "Cap. 2",
    data: "05/05/2024",
    conteudo: `
      <h1>Capítulo 2 – Flores no Concreto</h1>

      <p>Ela sempre acreditou que algumas histórias começavam nos lugares mais improváveis.</p>

      <p>Naquela tarde, entre prédios cinzentos e ruas movimentadas, encontrou alguém que mudaria sua vida.</p>
    `,
  },
];

function Oficina() {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [obras, setObras] = useState(() => {
    const salvas = localStorage.getItem("readduo_obras");

    if (salvas) {
      return JSON.parse(salvas);
    }

    return obrasIniciais;
  });

  const [obraAtivaId, setObraAtivaId] = useState(() => {
    const salva = localStorage.getItem("readduo_obra_ativa");

    return salva ? Number(salva) : 1;
  });

  const [busca, setBusca] = useState("");

  const [modalNovaObra, setModalNovaObra] = useState(false);

  const [novaObra, setNovaObra] = useState({
    titulo: "",
    genero: "",
  });

  const [salvando, setSalvando] = useState(false);

  const [menuEstilo, setMenuEstilo] = useState(false);
  const [menuFonte, setMenuFonte] = useState(false);

  const aplicarEstilo = (estilo) => {
  editorRef.current?.focus();

  if (estilo === "titulo1") {
    document.execCommand(
      "formatBlock",
      false,
      "H1"
    );
  }

  if (estilo === "titulo2") {
    document.execCommand(
      "formatBlock",
      false,
      "H2"
    );
  }

  if (estilo === "titulo3") {
    document.execCommand(
      "formatBlock",
      false,
      "H3"
    );
  }

  if (estilo === "paragrafo") {
    document.execCommand(
      "formatBlock",
      false,
      "P"
    );
  }

  setMenuEstilo(false);

  atualizarConteudo();
};

  const obraAtiva = obras.find(
    (obra) => obra.id === obraAtivaId
  );

  // ==========================================
  // SALVAR OBRAS
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "readduo_obras",
      JSON.stringify(obras)
    );
  }, [obras]);

  useEffect(() => {
    localStorage.setItem(
      "readduo_obra_ativa",
      obraAtivaId
    );
  }, [obraAtivaId]);

  // ==========================================
  // CARREGAR OBRA NO EDITOR
  // ==========================================

  useEffect(() => {
    if (!obraAtiva || !editorRef.current) return;

    editorRef.current.innerHTML = obraAtiva.conteudo;
  }, [obraAtivaId]);

  // ==========================================
  // CONTAGEM DE PALAVRAS
  // ==========================================

  const contarPalavras = () => {
    if (!editorRef.current) return 0;

    const texto = editorRef.current.innerText
      .replace(/\s+/g, " ")
      .trim();

    if (!texto) return 0;

    return texto.split(" ").length;
  };

  // ==========================================
  // ALTERAR CONTEÚDO
  // ==========================================

  const atualizarConteudo = () => {
    if (!editorRef.current) return;

    const conteudo = editorRef.current.innerHTML;

    setObras((obrasAtuais) =>
      obrasAtuais.map((obra) =>
        obra.id === obraAtivaId
          ? {
              ...obra,
              conteudo,
              palavras: contarPalavras(),
            }
          : obra
      )
    );

    setSalvando(true);

    setTimeout(() => {
      setSalvando(false);
    }, 800);
  };

  // ==========================================
  // FORMATAÇÃO
  // ==========================================

  const formatarTexto = (comando, valor = null) => {
    editorRef.current?.focus();

    document.execCommand(
      comando,
      false,
      valor
    );

    atualizarConteudo();
  };

  const aplicarFonte = (fonte) => {
    editorRef.current?.focus();

    document.execCommand("fontName", false, fonte);

    setMenuFonte(false);

    atualizarConteudo();
  };


  // ==========================================
  // CRIAR NOVA OBRA
  // ==========================================

  const criarNovaObra = () => {
    if (!novaObra.titulo.trim()) {
      alert("Digite um título para a obra.");
      return;
    }

    const id =
      obras.length > 0
        ? Math.max(...obras.map((obra) => obra.id)) + 1
        : 1;

    const dataAtual = new Date().toLocaleDateString(
      "pt-BR"
    );

    const obra = {
      id,
      titulo: novaObra.titulo,
      genero: novaObra.genero || "Sem gênero",
      capitulo: "Cap. 1",
      data: dataAtual,
      conteudo: `
        <h1>Capítulo 1 – ${novaObra.titulo}</h1>

        <p>Comece a escrever sua história aqui...</p>
      `,
      palavras: 8,
    };

    setObras((obrasAtuais) => [
      ...obrasAtuais,
      obra,
    ]);

    setObraAtivaId(id);

    setNovaObra({
      titulo: "",
      genero: "",
    });

    setModalNovaObra(false);
  };

  // ==========================================
  // EXCLUIR OBRA
  // ==========================================

  const excluirObra = (id) => {
    const obra = obras.find(
      (item) => item.id === id
    );

    if (!obra) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir "${obra.titulo}"?`
    );

    if (!confirmar) return;

    const novasObras = obras.filter(
      (item) => item.id !== id
    );

    setObras(novasObras);

    if (id === obraAtivaId) {
      if (novasObras.length > 0) {
        setObraAtivaId(novasObras[0].id);
      } else {
        setObraAtivaId(null);
      }
    }
  };

  // ==========================================
  // IMPORTAR ARQUIVO
  // ==========================================

  const importarArquivo = (event) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = (e) => {
      const texto = e.target.result;

      const id =
        obras.length > 0
          ? Math.max(...obras.map((obra) => obra.id)) + 1
          : 1;

      const nomeArquivo = arquivo.name.replace(
        /\.[^/.]+$/,
        ""
      );

      const conteudo = `
        <h1>${nomeArquivo}</h1>
        <p>${String(texto).replace(/\n/g, "<br />")}</p>
      `;

      const obra = {
        id,
        titulo: nomeArquivo,
        genero: "Importada",
        capitulo: "Cap. 1",
        data: new Date().toLocaleDateString(
          "pt-BR"
        ),
        conteudo,
      };

      setObras((obrasAtuais) => [
        ...obrasAtuais,
        obra,
      ]);

      setObraAtivaId(id);
    };

    leitor.readAsText(arquivo);

    event.target.value = "";
  };

  // ==========================================
  // BUSCA
  // ==========================================

  const obrasFiltradas = obras.filter((obra) =>
    `${obra.titulo} ${obra.genero}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // ==========================================
  // PALAVRAS
  // ==========================================

  const palavras = obraAtiva
    ? obraAtiva.palavras ||
      (() => {
        const texto =
          obraAtiva.conteudo
            ?.replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        return texto
          ? texto.split(" ").length
          : 0;
      })()
    : 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.headerInfo}>

          <div className={styles.title}>
            <PenTool />

            <h1>
              Oficina Autoral
            </h1>
          </div>

          <p>
            Crie, escreva e dê vida às suas histórias.
          </p>

        </div>

        <div className={styles.headerButtons}>

          <button
            className={styles.importar}
            onClick={() =>
              fileInputRef.current?.click()
            }
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

          <button
            className={styles.novaObra}
            onClick={() =>
              setModalNovaObra(true)
            }
          >
            <Plus size={18} />
            Nova Obra
          </button>

        </div>

      </div>

      {/* CONTEÚDO */}
      <section className={styles.workspace}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>

          <div className={styles.searchBar}>

            <input
              placeholder="Buscar obra..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />

            <Search size={18} />

          </div>

          <div className={styles.obrasHeader}>

            <span>
              MINHAS OBRAS
            </span>

            <button
              onClick={() =>
                setModalNovaObra(true)
              }
            >
              <Plus size={16} />
            </button>

          </div>

          <div className={styles.listaObras}>

            {obrasFiltradas.length === 0 ? (
              <p className={styles.semObras}>
                Nenhuma obra encontrada.
              </p>
            ) : (
              obrasFiltradas.map((obra) => (

                <div
                  key={obra.id}
                  className={`
                    ${styles.obraCard}
                    ${
                      obra.id === obraAtivaId
                        ? styles.obraAtiva
                        : ""
                    }
                  `}
                  onClick={() =>
                    setObraAtivaId(obra.id)
                  }
                >

                  <div>

                    <h3>
                      {obra.titulo}
                    </h3>

                    <span>
                      {obra.genero}
                    </span>

                    <p>
                      {obra.capitulo} •{" "}
                      {obra.data}
                    </p>

                  </div>

                  <button
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

        {/* EDITOR */}
        <main className={styles.editor}>

          {obraAtiva ? (
            <>

              {/* CABEÇALHO */}
              <div className={styles.editorHeader}>

                <div>

                  <h2>
                    {obraAtiva.titulo}
                  </h2>

                  <div
                    className={
                      styles.salvamento
                    }
                  >

                    <CheckCircle2
                      size={15}
                      color="#22c55e"
                    />

                    <span>
                      {salvando
                        ? "Salvando..."
                        : "Salvo automaticamente"}
                    </span>

                  </div>

                </div>

                <span
                  className={styles.palavras}
                >
                  {palavras.toLocaleString(
                    "pt-BR"
                  )}{" "}
                  palavras
                </span>

              </div>

              {/* BARRA DE FERRAMENTAS */}
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
                    Título 1
                    <ChevronDown size={15} />
                  </button>

                  {menuEstilo && (
                    <div className={styles.dropdownMenu}>

                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          aplicarEstilo("titulo1")
                        }
                      >
                        <span className={styles.previewH1}>
                          Título 1
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          aplicarEstilo("titulo2")
                        }
                      >
                        <span className={styles.previewH2}>
                          Título 2
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          aplicarEstilo("titulo3")
                        }
                      >
                        <span className={styles.previewH3}>
                          Título 3
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          aplicarEstilo("paragrafo")
                        }
                      >
                        <span>
                          Parágrafo
                        </span>
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
                  Arial
                  <ChevronDown size={15} />
                </button>

                {menuFonte && (
                  <div className={styles.dropdownMenu}>

                    <button
                      style={{
                        fontFamily: "Arial",
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Arial")
                      }
                    >
                      Arial
                    </button>

                    <button
                      style={{
                        fontFamily: "Georgia",
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Georgia")
                      }
                    >
                      Georgia
                    </button>

                    <button
                      style={{
                        fontFamily: '"Times New Roman"',
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Times New Roman")
                      }
                    >
                      Times New Roman
                    </button>

                    <button
                      style={{
                        fontFamily: "Verdana",
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Verdana")
                      }
                    >
                      Verdana
                    </button>

                    <button
                      style={{
                        fontFamily: '"Trebuchet MS"',
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Trebuchet MS")
                      }
                    >
                      Trebuchet MS
                    </button>

                    <button
                      style={{
                        fontFamily: '"Courier New"',
                      }}
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        aplicarFonte("Courier New")
                      }
                    >
                      Courier New
                    </button>

                  </div>
                )}

              </div>

                <button
                  title="Negrito"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto("bold")
                  }
                >
                  <Bold size={16} />
                </button>

                <button
                  title="Itálico"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto("italic")
                  }
                >
                  <Italic size={16} />
                </button>

                <button
                  title="Sublinhado"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto("underline")
                  }
                >
                  <Underline size={16} />
                </button>

                <button
                  title="Tachado"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "strikeThrough"
                    )
                  }
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

              {/* EDITOR */}
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

              <h2>
                Crie sua primeira obra
              </h2>

              <p>
                Comece a escrever sua história.
              </p>

              <button
                className={styles.novaObra}
                onClick={() =>
                  setModalNovaObra(true)
                }
              >
                <Plus size={18} />
                Nova Obra
              </button>

            </div>

          )}

        </main>

      </section>

      {/* MODAL NOVA OBRA */}
      {modalNovaObra && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <div className={styles.modalHeader}>

              <div>
                <h2>
                  Nova obra
                </h2>

                <p>
                  Comece uma nova história.
                </p>
              </div>

              <button
                className={styles.fecharModal}
                onClick={() =>
                  setModalNovaObra(false)
                }
              >
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
                  onChange={(e) =>
                    setNovaObra({
                      ...novaObra,
                      titulo: e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Gênero

                <input
                  placeholder="Ex.: Fantasia"
                  value={novaObra.genero}
                  onChange={(e) =>
                    setNovaObra({
                      ...novaObra,
                      genero: e.target.value,
                    })
                  }
                />

              </label>

            </div>

            <div className={styles.modalButtons}>

              <button
                className={styles.cancelar}
                onClick={() =>
                  setModalNovaObra(false)
                }
              >
                Cancelar
              </button>

              <button
                className={styles.confirmar}
                onClick={criarNovaObra}
              >
                <Plus size={18} />
                Criar obra
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Oficina;