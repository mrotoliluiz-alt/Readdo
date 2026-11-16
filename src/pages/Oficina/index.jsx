import styles from "./index.module.css";

import { useEffect, useRef, useState } from "react";
import api from '../../services/api'

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