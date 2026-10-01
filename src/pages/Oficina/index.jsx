import styles from "./index.module.css";

import { useEffect, useRef, useState } from "react";

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

/* =========================================================
   OBRAS INICIAIS
   ========================================================= */

const obrasIniciais = [
  {
    id: 1,
    titulo: "Ecos de Éter",
    genero: "Fantasia",
    imagem: "",
    descricao: "",
    data: "12/05/2024",

    capitulos: [
      {
        id: 1,
        titulo: "Capítulo 8 – O Guardião Despertado",
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
    ],
  },

  {
    id: 2,
    titulo: "O Último Sussurro",
    genero: "Terror",
    imagem: "",
    descricao: "",
    data: "10/05/2024",

    capitulos: [
      {
        id: 1,
        titulo: "Capítulo 3 – O Último Sussurro",
        conteudo: `
          <h1>Capítulo 3 – O Último Sussurro</h1>

          <p>A casa estava silenciosa naquela noite.</p>

          <p>Marina caminhou lentamente pelo corredor, tentando ignorar o som que vinha do andar de cima.</p>

          <p>Então ouviu novamente.</p>

          <p>Um sussurro.</p>
        `,
      },
    ],
  },

  {
    id: 3,
    titulo: "Cidades de Néon",
    genero: "Ficção Científica",
    imagem: "",
    descricao: "",
    data: "08/05/2024",

    capitulos: [
      {
        id: 1,
        titulo: "Capítulo 5 – Cidades de Néon",
        conteudo: `
          <h1>Capítulo 5 – Cidades de Néon</h1>

          <p>As luzes da cidade refletiam nas janelas dos arranha-céus.</p>

          <p>Entre drones e veículos voadores, ninguém parecia perceber o que estava acontecendo abaixo da superfície.</p>
        `,
      },
    ],
  },

  {
    id: 4,
    titulo: "Flores no Concreto",
    genero: "Romance",
    imagem: "",
    descricao: "",
    data: "05/05/2024",

    capitulos: [
      {
        id: 1,
        titulo: "Capítulo 2 – Flores no Concreto",
        conteudo: `
          <h1>Capítulo 2 – Flores no Concreto</h1>

          <p>Ela sempre acreditou que algumas histórias começavam nos lugares mais improváveis.</p>

          <p>Naquela tarde, entre prédios cinzentos e ruas movimentadas, encontrou alguém que mudaria sua vida.</p>
        `,
      },
    ],
  },
];

/* =========================================================
   NORMALIZAÇÃO
   =========================================================
   Converte obras antigas, que tinham:
   
   obra.conteudo
   
   para:
   
   obra.capitulos[0].conteudo
   ========================================================= */

const normalizarObras = (obras) => {
  if (!Array.isArray(obras)) {
    return obrasIniciais;
  }

  return obras.map((obra) => {
    if (Array.isArray(obra.capitulos) && obra.capitulos.length > 0) {
      return obra;
    }

    return {
      ...obra,

      imagem: obra.imagem || "",
      descricao: obra.descricao || "",

      capitulos: [
        {
          id: 1,
          titulo: obra.capitulo || "Capítulo 1",
          conteudo:
            obra.conteudo ||
            `
              <h1>${obra.capitulo || "Capítulo 1"}</h1>
              <p>Comece a escrever sua história aqui...</p>
            `,
        },
      ],
    };
  });
};

/* =========================================================
   COMPONENTE
   ========================================================= */

function Oficina() {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imagemInputRef = useRef(null);

  /* =======================================================
     OBRAS
     ======================================================= */

  const [obras, setObras] = useState(() => {
    const salvas = localStorage.getItem("readduo_obras");

    if (salvas) {
      try {
        const obrasSalvas = JSON.parse(salvas);

        return normalizarObras(obrasSalvas);
      } catch {
        return obrasIniciais;
      }
    }

    return obrasIniciais;
  });

  const [obraAtivaId, setObraAtivaId] = useState(() => {
    const salva = localStorage.getItem("readduo_obra_ativa");

    return salva ? Number(salva) : 1;
  });

  /* =======================================================
     CAPÍTULO ATIVO
     ======================================================= */

  const [capituloAtivoId, setCapituloAtivoId] = useState(() => {
    const salvo = localStorage.getItem(
      "readduo_capitulo_ativo"
    );

    return salvo ? Number(salvo) : 1;
  });

  /* =======================================================
     MODAL NOVA OBRA
     ======================================================= */

  const [modalNovaObra, setModalNovaObra] =
    useState(false);

  const [novaObra, setNovaObra] = useState({
    titulo: "",
    genero: "",
    descricao: "",
  });

  /* =======================================================
     MODAL EDITAR OBRA
     ======================================================= */

  const [modalEditarObra, setModalEditarObra] =
    useState(false);

  const [obraEditada, setObraEditada] = useState({
    titulo: "",
    genero: "",
    descricao: "",
  });

  /* =======================================================
     MODAL NOVO CAPÍTULO
     ======================================================= */

  const [modalNovoCapitulo, setModalNovoCapitulo] =
    useState(false);

  const [novoCapitulo, setNovoCapitulo] = useState({
    titulo: "",
  });

  /* =======================================================
     OUTROS ESTADOS
     ======================================================= */

  const [busca, setBusca] = useState("");

  const [salvando, setSalvando] = useState(false);

  const [menuEstilo, setMenuEstilo] = useState(false);

  const [menuFonte, setMenuFonte] = useState(false);

  /* =======================================================
     OBRA ATIVA
     ======================================================= */

  const obraAtiva = obras.find(
    (obra) => obra.id === obraAtivaId
  );

  /* =======================================================
     CAPÍTULO ATIVO
     ======================================================= */

  const capituloAtivo =
    obraAtiva?.capitulos?.find(
      (capitulo) =>
        capitulo.id === capituloAtivoId
    ) || obraAtiva?.capitulos?.[0];

  /* =======================================================
     SALVAR OBRAS
     ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "readduo_obras",
      JSON.stringify(obras)
    );
  }, [obras]);

  /* =======================================================
     SALVAR OBRA ATIVA
     ======================================================= */

  useEffect(() => {
    if (obraAtivaId !== null) {
      localStorage.setItem(
        "readduo_obra_ativa",
        obraAtivaId
      );
    } else {
      localStorage.removeItem(
        "readduo_obra_ativa"
      );
    }
  }, [obraAtivaId]);

  /* =======================================================
     SALVAR CAPÍTULO ATIVO
     ======================================================= */

  useEffect(() => {
    if (capituloAtivoId !== null) {
      localStorage.setItem(
        "readduo_capitulo_ativo",
        capituloAtivoId
      );
    }
  }, [capituloAtivoId]);

  /* =======================================================
     GARANTIR CAPÍTULO VÁLIDO
     ======================================================= */

  useEffect(() => {
    if (!obraAtiva) return;

    const existe = obraAtiva.capitulos?.some(
      (capitulo) =>
        capitulo.id === capituloAtivoId
    );

    if (!existe && obraAtiva.capitulos?.length > 0) {
      setCapituloAtivoId(
        obraAtiva.capitulos[0].id
      );
    }
  }, [obraAtiva, capituloAtivoId]);

  /* =======================================================
     CARREGAR CAPÍTULO NO EDITOR
     ======================================================= */

  useEffect(() => {
    if (!capituloAtivo || !editorRef.current) {
      return;
    }

    editorRef.current.innerHTML =
      capituloAtivo.conteudo || "";
  }, [obraAtivaId, capituloAtivoId]);

  /* =======================================================
     CONTAGEM DE PALAVRAS
     ======================================================= */

  const contarPalavras = () => {
    if (!editorRef.current) return 0;

    const texto =
      editorRef.current.innerText
        .replace(/\s+/g, " ")
        .trim();

    if (!texto) return 0;

    return texto.split(" ").length;
  };

  /* =======================================================
     ATUALIZAR CONTEÚDO DO CAPÍTULO
     ======================================================= */

  const atualizarConteudo = () => {
    if (
      !editorRef.current ||
      !obraAtiva ||
      !capituloAtivo
    ) {
      return;
    }

    const conteudo =
      editorRef.current.innerHTML;

    const palavrasAtuais =
      contarPalavras();

    setObras((obrasAtuais) =>
      obrasAtuais.map((obra) => {
        if (obra.id !== obraAtivaId) {
          return obra;
        }

        return {
          ...obra,

          capitulos: obra.capitulos.map(
            (capitulo) =>
              capitulo.id === capituloAtivoId
                ? {
                    ...capitulo,
                    conteudo,
                    palavras: palavrasAtuais,
                  }
                : capitulo
          ),
        };
      })
    );

    setSalvando(true);

    setTimeout(() => {
      setSalvando(false);
    }, 800);
  };

  /* =======================================================
     SELECIONAR OBRA
     ======================================================= */

  const selecionarObra = (id) => {
    const obra = obras.find(
      (item) => item.id === id
    );

    if (!obra) return;

    setObraAtivaId(id);

    if (obra.capitulos?.length > 0) {
      setCapituloAtivoId(
        obra.capitulos[0].id
      );
    }
  };

  /* =======================================================
     SELECIONAR CAPÍTULO
     ======================================================= */

  const selecionarCapitulo = (id) => {
    setCapituloAtivoId(id);
  };

  /* =======================================================
     NOVO CAPÍTULO
     ======================================================= */

  const abrirModalNovoCapitulo = () => {
    if (!obraAtiva) return;

    setNovoCapitulo({
      titulo: "",
    });

    setModalNovoCapitulo(true);
  };

  const criarNovoCapitulo = () => {
    if (!obraAtiva) return;

    if (!novoCapitulo.titulo.trim()) {
      alert("Digite um título para o capítulo.");
      return;
    }

    const capitulos =
      obraAtiva.capitulos || [];

    const novoId =
      capitulos.length > 0
        ? Math.max(
            ...capitulos.map(
              (capitulo) => capitulo.id
            )
          ) + 1
        : 1;

    const titulo =
      novoCapitulo.titulo.trim();

    const novoCap = {
      id: novoId,
      titulo,
      conteudo: `
        <h1>${titulo}</h1>
        <p>Comece a escrever este capítulo aqui...</p>
      `,
      palavras: 7,
    };

    setObras((obrasAtuais) =>
      obrasAtuais.map((obra) =>
        obra.id === obraAtivaId
          ? {
              ...obra,
              capitulos: [
                ...(obra.capitulos || []),
                novoCap,
              ],
            }
          : obra
      )
    );

    setCapituloAtivoId(novoId);

    setNovoCapitulo({
      titulo: "",
    });

    setModalNovoCapitulo(false);
  };

  /* =======================================================
     FORMATAÇÃO
     ======================================================= */

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

  const formatarTexto = (
    comando,
    valor = null
  ) => {
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

    document.execCommand(
      "fontName",
      false,
      fonte
    );

    const nomeFonte =
      document.getElementById("nomeFonte");

    if (nomeFonte) {
      nomeFonte.textContent = fonte;
    }

    setMenuFonte(false);

    atualizarConteudo();
  };

  /* =======================================================
     IMAGEM DA OBRA
     ======================================================= */

  const adicionarImagem = (event) => {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo || !obraAtiva) return;

    if (!arquivo.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = (e) => {
      const imagem = e.target.result;

      setObras((obrasAtuais) =>
        obrasAtuais.map((obra) =>
          obra.id === obraAtivaId
            ? {
                ...obra,
                imagem,
              }
            : obra
        )
      );
    };

    leitor.readAsDataURL(arquivo);

    event.target.value = "";
  };

  const selecionarImagem = () => {
    imagemInputRef.current?.click();
  };

  /* =======================================================
     NOVA OBRA
     ======================================================= */

  const abrirModalNovaObra = () => {
    setNovaObra({
      titulo: "",
      genero: "",
      descricao: "",
    });

    setModalNovaObra(true);
  };

  const criarNovaObra = () => {
    if (!novaObra.titulo.trim()) {
      alert("Digite um título para a obra.");
      return;
    }

    const id =
      obras.length > 0
        ? Math.max(
            ...obras.map(
              (obra) => obra.id
            )
          ) + 1
        : 1;

    const dataAtual =
      new Date().toLocaleDateString(
        "pt-BR"
      );

    const titulo =
      novaObra.titulo.trim();

    const obra = {
      id,

      titulo,

      genero:
        novaObra.genero.trim() ||
        "Sem gênero",

      descricao:
        novaObra.descricao.trim(),

      imagem: "",

      data: dataAtual,

      capitulos: [
        {
          id: 1,

          titulo: "Capítulo 1",

          conteudo: `
            <h1>Capítulo 1</h1>
            <p>Comece a escrever sua história aqui...</p>
          `,

          palavras: 8,
        },
      ],
    };

    setObras((obrasAtuais) => [
      ...obrasAtuais,
      obra,
    ]);

    setObraAtivaId(id);

    setCapituloAtivoId(1);

    setNovaObra({
      titulo: "",
      genero: "",
      descricao: "",
    });

    setModalNovaObra(false);
  };

  /* =======================================================
     EDITAR OBRA
     ======================================================= */

  const abrirModalEditarObra = () => {
    if (!obraAtiva) return;

    setObraEditada({
      titulo: obraAtiva.titulo || "",
      genero: obraAtiva.genero || "",
      descricao: obraAtiva.descricao || "",
    });

    setModalEditarObra(true);
  };

  const salvarEdicaoObra = () => {
    if (!obraAtiva) return;

    if (!obraEditada.titulo.trim()) {
      alert(
        "O título da obra não pode ficar vazio."
      );

      return;
    }

    setObras((obrasAtuais) =>
      obrasAtuais.map((obra) =>
        obra.id === obraAtivaId
          ? {
              ...obra,

              titulo:
                obraEditada.titulo.trim(),

              genero:
                obraEditada.genero.trim() ||
                "Sem gênero",

              descricao:
                obraEditada.descricao.trim(),
            }
          : obra
      )
    );

    setModalEditarObra(false);
  };

  /* =======================================================
     EXCLUIR OBRA
     ======================================================= */

  const excluirObra = (id) => {
    const obra = obras.find(
      (item) => item.id === id
    );

    if (!obra) return;

    const confirmar =
      window.confirm(
        `Deseja realmente excluir "${obra.titulo}"?`
      );

    if (!confirmar) return;

    const novasObras =
      obras.filter(
        (item) => item.id !== id
      );

    setObras(novasObras);

    if (id === obraAtivaId) {
      if (novasObras.length > 0) {
        const novaObraAtiva =
          novasObras[0];

        setObraAtivaId(
          novaObraAtiva.id
        );

        setCapituloAtivoId(
          novaObraAtiva.capitulos?.[0]?.id ||
            1
        );
      } else {
        setObraAtivaId(null);
        setCapituloAtivoId(null);
      }
    }
  };

  /* =======================================================
     IMPORTAR ARQUIVO
     ======================================================= */

  const importarArquivo = (event) => {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo) return;

    const leitor =
      new FileReader();

    leitor.onload = (e) => {
      const texto = e.target.result;

      const id =
        obras.length > 0
          ? Math.max(
              ...obras.map(
                (obra) => obra.id
              )
            ) + 1
          : 1;

      const nomeArquivo =
        arquivo.name.replace(
          /\.[^/.]+$/,
          ""
        );

      const conteudo = `
        <h1>${nomeArquivo}</h1>
        <p>${String(texto).replace(
          /\n/g,
          "<br />"
        )}</p>
      `;

      const obra = {
        id,

        titulo: nomeArquivo,

        genero: "Importada",

        descricao:
          "Obra importada para o Readduo.",

        imagem: "",

        data: new Date().toLocaleDateString(
          "pt-BR"
        ),

        capitulos: [
          {
            id: 1,

            titulo: "Capítulo 1",

            conteudo,

            palavras: 0,
          },
        ],
      };

      setObras((obrasAtuais) => [
        ...obrasAtuais,
        obra,
      ]);

      setObraAtivaId(id);

      setCapituloAtivoId(1);
    };

    leitor.readAsText(arquivo);

    event.target.value = "";
  };

  /* =======================================================
     BUSCA
     ======================================================= */

  const obrasFiltradas =
    obras.filter((obra) =>
      `${obra.titulo} ${obra.genero}`
        .toLowerCase()
        .includes(
          busca.toLowerCase()
        )
    );

  /* =======================================================
     PALAVRAS DO CAPÍTULO
     ======================================================= */

  const palavras = capituloAtivo
    ? capituloAtivo.palavras ??
      (() => {
        const texto =
          capituloAtivo.conteudo
            ?.replace(
              /<[^>]*>/g,
              " "
            )
            .replace(
              /\s+/g,
              " "
            )
            .trim();

        return texto
          ? texto.split(" ").length
          : 0;
      })()
    : 0;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className={styles.container}>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className={styles.header}>

        <div className={styles.headerInfo}>

          <div className={styles.title}>

            <PenTool />

            <h1>
              Oficina Autoral
            </h1>

          </div>

          <p>
            Crie, escreva e dê vida às
            suas histórias.
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
            style={{
              display: "none",
            }}
            onChange={importarArquivo}
          />

          <button
            className={styles.novaObra}
            onClick={abrirModalNovaObra}
          >
            <Plus size={18} />

            Nova Obra
          </button>

        </div>

      </div>

      {/* ===================================================
          WORKSPACE
      =================================================== */}

      <section className={styles.workspace}>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className={styles.sidebar}>

          {/* BUSCA */}

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

          {/* HEADER OBRAS */}

          <div className={styles.obrasHeader}>

            <span>
              MINHAS OBRAS
            </span>

            <button
              onClick={abrirModalNovaObra}
              title="Nova obra"
            >
              <Plus size={16} />
            </button>

          </div>

          {/* LISTA OBRAS */}

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
                    selecionarObra(obra.id)
                  }
                >

                  {/* CAPA */}

                  <div
                    className={
                      styles.miniCapa
                    }
                  >

                    {obra.imagem ? (

                      <img
                        src={obra.imagem}
                        alt={`Capa de ${obra.titulo}`}
                      />

                    ) : (

                      <Image size={20} />

                    )}

                  </div>

                  {/* INFORMAÇÕES */}

                  <div
                    className={
                      styles.obraTextos
                    }
                  >

                    <h3 title={obra.titulo}>
                      {obra.titulo}
                    </h3>

                    <span>
                      {obra.genero}
                    </span>

                    <p>

                      {obra.capitulos?.length ||
                        1}{" "}
                      capítulo
                      {(
                        obra.capitulos?.length ||
                        1
                      ) !== 1
                        ? "s"
                        : ""}

                      {" • "}

                      {obra.data}

                    </p>

                  </div>

                  {/* EXCLUIR */}

                  <button
                    className={
                      styles.botaoExcluir
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      excluirObra(
                        obra.id
                      );
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

        {/* =================================================
            EDITOR
        ================================================= */}

        <main className={styles.editor}>

          {obraAtiva ? (

            <>

              {/* ==========================================
                  CABEÇALHO DA OBRA
              ========================================== */}

              <div
                className={
                  styles.editorHeader
                }
              >

                <div
                  className={
                    styles.infoObra
                  }
                >

                  {/* CAPA */}

                  <div
                    className={
                      styles.capaObra
                    }
                    onClick={
                      selecionarImagem
                    }
                    title="Clique para adicionar ou trocar a imagem"
                  >

                    {obraAtiva.imagem ? (

                      <img
                        src={
                          obraAtiva.imagem
                        }
                        alt={`Capa de ${obraAtiva.titulo}`}
                      />

                    ) : (

                      <div
                        className={
                          styles.semImagem
                        }
                      >

                        <Image size={30} />

                        <span>
                          Adicionar imagem
                        </span>

                      </div>

                    )}

                  </div>

                  <input
                    ref={
                      imagemInputRef
                    }
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      adicionarImagem
                    }
                  />

                  {/* INFORMAÇÕES */}

                  <div
                    className={
                      styles.dadosObra
                    }
                  >

                    <div
                      className={
                        styles.tituloLinha
                      }
                    >

                      <h2>
                        {obraAtiva.titulo}
                      </h2>

                      <button
                        className={
                          styles.editarInfo
                        }
                        onClick={
                          abrirModalEditarObra
                        }
                        title="Editar obra"
                      >

                        <Pencil
                          size={15}
                        />

                        Editar

                      </button>

                    </div>

                    <p
                      className={
                        styles.descricaoObra
                      }
                    >
                      {obraAtiva.descricao ||
                        "Adicione uma descrição para sua obra."}
                    </p>

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

                </div>

                <span
                  className={
                    styles.palavras
                  }
                >

                  {palavras.toLocaleString(
                    "pt-BR"
                  )}{" "}

                  palavras

                </span>

              </div>

              {/* ==========================================
                  CAPÍTULOS
              ========================================== */}

              <div
                className={
                  styles.capitulosContainer
                }
              >

                <div
                  className={
                    styles.capitulosHeader
                  }
                >

                  <div>

                    <span>
                      CAPÍTULOS
                    </span>

                    <small>
                      {obraAtiva.capitulos?.length ||
                        1}{" "}
                      capítulo
                      {(
                        obraAtiva.capitulos?.length ||
                        1
                      ) !== 1
                        ? "s"
                        : ""}
                    </small>

                  </div>

                  <button
                    className={
                      styles.novoCapitulo
                    }
                    onClick={
                      abrirModalNovoCapitulo
                    }
                  >

                    <Plus size={16} />

                    Novo capítulo

                  </button>

                </div>

                <div
                  className={
                    styles.listaCapitulos
                  }
                >

                  {obraAtiva.capitulos?.map(
                    (capitulo, index) => (

                      <button
                        key={capitulo.id}
                        className={`
                          ${styles.capituloBotao}
                          ${
                            capitulo.id ===
                            capituloAtivoId
                              ? styles.capituloAtivo
                              : ""
                          }
                        `}
                        onClick={() =>
                          selecionarCapitulo(
                            capitulo.id
                          )
                        }
                      >

                        <span
                          className={
                            styles.numeroCapitulo
                          }
                        >
                          {index + 1}
                        </span>

                        <span
                          className={
                            styles.nomeCapitulo
                          }
                        >
                          {capitulo.titulo}
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* ==========================================
                  BARRA DE FERRAMENTAS
              ========================================== */}

              <div
                className={
                  styles.toolbar
                }
              >

                {/* ESTILO */}

                <div
                  className={
                    styles.dropdown
                  }
                >

                  <button
                    className={
                      styles.dropdownBotao
                    }
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() => {
                      setMenuEstilo(
                        !menuEstilo
                      );

                      setMenuFonte(false);
                    }}
                  >

                    Título 1

                    <ChevronDown
                      size={15}
                    />

                  </button>

                  {menuEstilo && (

                    <div
                      className={
                        styles.dropdownMenu
                      }
                    >

                      <button
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          aplicarEstilo(
                            "titulo1"
                          )
                        }
                      >
                        <span
                          className={
                            styles.previewH1
                          }
                        >
                          Título 1
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          aplicarEstilo(
                            "titulo2"
                          )
                        }
                      >
                        <span
                          className={
                            styles.previewH2
                          }
                        >
                          Título 2
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          aplicarEstilo(
                            "titulo3"
                          )
                        }
                      >
                        <span
                          className={
                            styles.previewH3
                          }
                        >
                          Título 3
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          aplicarEstilo(
                            "paragrafo"
                          )
                        }
                      >
                        Parágrafo
                      </button>

                    </div>

                  )}

                </div>

                {/* FONTE */}

                <div
                  className={
                    styles.dropdown
                  }
                >

                  <button
                    className={
                      styles.dropdownBotao
                    }
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() => {
                      setMenuFonte(
                        !menuFonte
                      );

                      setMenuEstilo(false);
                    }}
                  >

                    <span id="nomeFonte">
                      Arial
                    </span>

                    <ChevronDown
                      size={15}
                    />

                  </button>

                  {menuFonte && (

                    <div
                      className={
                        styles.dropdownMenu
                      }
                    >

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
                          style={{
                            fontFamily:
                              fonte,
                          }}
                          onMouseDown={(e) =>
                            e.preventDefault()
                          }
                          onClick={() =>
                            aplicarFonte(
                              fonte
                            )
                          }
                        >
                          {fonte}
                        </button>

                      ))}

                    </div>

                  )}

                </div>

                {/* FORMATAÇÃO */}

                <button
                  title="Negrito"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "bold"
                    )
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
                    formatarTexto(
                      "italic"
                    )
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
                    formatarTexto(
                      "underline"
                    )
                  }
                >
                  <Underline
                    size={16}
                  />
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
                  <Strikethrough
                    size={16}
                  />
                </button>

                <button
                  title="Alinhar à esquerda"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "justifyLeft"
                    )
                  }
                >
                  <AlignLeft
                    size={16}
                  />
                </button>

                <button
                  title="Centralizar"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "justifyCenter"
                    )
                  }
                >
                  <AlignCenter
                    size={16}
                  />
                </button>

                <button
                  title="Alinhar à direita"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "justifyRight"
                    )
                  }
                >
                  <AlignRight
                    size={16}
                  />
                </button>

                <button
                  title="Justificar"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatarTexto(
                      "justifyFull"
                    )
                  }
                >
                  <AlignJustify
                    size={16}
                  />
                </button>

              </div>

              {/* ==========================================
                  EDITOR
              ========================================== */}

              <div
                ref={editorRef}
                className={
                  styles.textEditor
                }
                contentEditable
                suppressContentEditableWarning
                onInput={
                  atualizarConteudo
                }
              />

            </>

          ) : (

            <div
              className={
                styles.editorVazio
              }
            >

              <PenTool size={45} />

              <h2>
                Crie sua primeira obra
              </h2>

              <p>
                Comece a escrever sua
                história.
              </p>

              <button
                className={
                  styles.novaObra
                }
                onClick={
                  abrirModalNovaObra
                }
              >

                <Plus size={18} />

                Nova Obra

              </button>

            </div>

          )}

        </main>

      </section>

      {/* ===================================================
          MODAL NOVA OBRA
      =================================================== */}

      {modalNovaObra && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setModalNovaObra(false);
            }
          }}
        >

          <div
            className={
              styles.modal
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  Nova obra
                </h2>

                <p>
                  Comece uma nova história.
                </p>

              </div>

              <button
                className={
                  styles.fecharModal
                }
                onClick={() =>
                  setModalNovaObra(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            <div
              className={
                styles.modalForm
              }
            >

              <label>

                Título da obra

                <input
                  autoFocus
                  placeholder="Ex.: A Cidade Perdida"
                  value={
                    novaObra.titulo
                  }
                  onChange={(e) =>
                    setNovaObra({
                      ...novaObra,
                      titulo:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>

                Gênero

                <input
                  placeholder="Ex.: Fantasia"
                  value={
                    novaObra.genero
                  }
                  onChange={(e) =>
                    setNovaObra({
                      ...novaObra,
                      genero:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>

                Descrição

                <textarea
                  placeholder="Escreva uma breve descrição da sua obra..."
                  value={
                    novaObra.descricao
                  }
                  onChange={(e) =>
                    setNovaObra({
                      ...novaObra,
                      descricao:
                        e.target.value,
                    })
                  }
                />

              </label>

            </div>

            <div
              className={
                styles.modalButtons
              }
            >

              <button
                className={
                  styles.cancelar
                }
                onClick={() =>
                  setModalNovaObra(
                    false
                  )
                }
              >
                Cancelar
              </button>

              <button
                className={
                  styles.confirmar
                }
                onClick={
                  criarNovaObra
                }
              >

                <Plus size={18} />

                Criar obra

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===================================================
          MODAL EDITAR OBRA
      =================================================== */}

      {modalEditarObra && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setModalEditarObra(
                false
              );
            }
          }}
        >

          <div
            className={
              styles.modal
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  Editar obra
                </h2>

                <p>
                  Altere as informações
                  da sua história.
                </p>

              </div>

              <button
                className={
                  styles.fecharModal
                }
                onClick={() =>
                  setModalEditarObra(
                    false
                  )
                }
              >

                <X size={20} />

              </button>

            </div>

            <div
              className={
                styles.modalForm
              }
            >

              <label>

                Título da obra

                <input
                  autoFocus
                  value={
                    obraEditada.titulo
                  }
                  onChange={(e) =>
                    setObraEditada({
                      ...obraEditada,
                      titulo:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>

                Gênero

                <input
                  placeholder="Ex.: Fantasia"
                  value={
                    obraEditada.genero
                  }
                  onChange={(e) =>
                    setObraEditada({
                      ...obraEditada,
                      genero:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>

                Descrição

                <textarea
                  placeholder="Escreva uma breve descrição da sua obra..."
                  value={
                    obraEditada.descricao
                  }
                  onChange={(e) =>
                    setObraEditada({
                      ...obraEditada,
                      descricao:
                        e.target.value,
                    })
                  }
                />

              </label>

            </div>

            <div
              className={
                styles.modalButtons
              }
            >

              <button
                className={
                  styles.cancelar
                }
                onClick={() =>
                  setModalEditarObra(
                    false
                  )
                }
              >
                Cancelar
              </button>

              <button
                className={
                  styles.confirmar
                }
                onClick={
                  salvarEdicaoObra
                }
              >

                <Save size={18} />

                Salvar alterações

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===================================================
          MODAL NOVO CAPÍTULO
      =================================================== */}

      {modalNovoCapitulo && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setModalNovoCapitulo(
                false
              );
            }
          }}
        >

          <div
            className={
              styles.modal
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  Novo capítulo
                </h2>

                <p>
                  Adicione um novo capítulo
                  à sua obra.
                </p>

              </div>

              <button
                className={
                  styles.fecharModal
                }
                onClick={() =>
                  setModalNovoCapitulo(
                    false
                  )
                }
              >

                <X size={20} />

              </button>

            </div>

            <div
              className={
                styles.modalForm
              }
            >

              <label>

                Título do capítulo

                <input
                  autoFocus
                  placeholder="Ex.: Capítulo 2 – A descoberta"
                  value={
                    novoCapitulo.titulo
                  }
                  onChange={(e) =>
                    setNovoCapitulo({
                      titulo:
                        e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      criarNovoCapitulo();
                    }
                  }}
                />

              </label>

            </div>

            <div
              className={
                styles.modalButtons
              }
            >

              <button
                className={
                  styles.cancelar
                }
                onClick={() =>
                  setModalNovoCapitulo(
                    false
                  )
                }
              >
                Cancelar
              </button>

              <button
                className={
                  styles.confirmar
                }
                onClick={
                  criarNovoCapitulo
                }
              >

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