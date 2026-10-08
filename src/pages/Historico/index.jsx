
import { useMemo, useState } from "react";
import styles from "./index.module.css";

import {
  History,
  BookOpen,
  Clock3,
  PenTool,
  Trophy,
  Star,
  ArrowRight,
  MoreVertical,
  X,
  CalendarDays,
  UserRound,
  BookMarked,
  Trash2,
} from "lucide-react";

// Dados fictícios para testar a interface.
// Posteriormente, poderão ser substituídos pelos dados da API.
const estatisticasIniciais = [
  {
    titulo: "Livros lidos",
    valor: "48",
    mes: "+5 este mês",
    icone: BookOpen,
    cor: "#61a6fa",
  },
  {
    titulo: "Horas de leitura",
    valor: "126h",
    mes: "+18h este mês",
    icone: Clock3,
    cor: "#b05cff",
  },
  {
    titulo: "Obras escritas",
    valor: "7",
    mes: "+2 este mês",
    icone: PenTool,
    cor: "#4ade80",
  },
  {
    titulo: "Conquistas",
    valor: "24",
    mes: "+4 este mês",
    icone: Trophy,
    cor: "#ffdb0c",
  },
  {
    titulo: "XP acumulado",
    valor: "24.850",
    mes: "+2.450 este mês",
    icone: Star,
    cor: "#2ea9ff",
  },
];

const livrosIniciais = [
  {
    id: 1,
    nome: "Duna",
    autor: "Frank Herbert",
    genero: "Ficção Científica",
    paginas: 688,
    data: "12/05/2024",
    progresso: 100,
    nota: 5,
    capa: "",
    resumo:
      "Uma jornada de ficção científica que acompanha Paul Atreides em Arrakis, um planeta desértico fundamental para o destino de um império.",
  },
  {
    id: 2,
    nome: "Jogos Vorazes",
    autor: "Suzanne Collins",
    genero: "Aventura",
    paginas: 374,
    data: "05/05/2024",
    progresso: 100,
    nota: 4,
    capa: "",
    resumo:
      "Katniss Everdeen precisa enfrentar os Jogos Vorazes, uma competição perigosa que coloca jovens em uma luta pela sobrevivência.",
  },
  {
    id: 3,
    nome: "O Problema dos Três Corpos",
    autor: "Cixin Liu",
    genero: "Ficção Científica",
    paginas: 320,
    data: "28/04/2024",
    progresso: 100,
    nota: 5,
    capa: "",
    resumo:
      "Uma investigação científica revela uma conexão inesperada entre a humanidade e uma civilização extraterrestre.",
  },
  {
    id: 4,
    nome: "A Biblioteca da Meia-Noite",
    autor: "Matt Haig",
    genero: "Fantasia",
    paginas: 308,
    data: "20/04/2024",
    progresso: 100,
    nota: 4,
    capa: "",
    resumo:
      "Entre a vida e a morte, Nora encontra uma biblioteca que permite explorar diferentes versões da própria vida.",
  },
  {
    id: 5,
    nome: "1984",
    autor: "George Orwell",
    genero: "Distopia",
    paginas: 328,
    data: "14/04/2024",
    progresso: 100,
    nota: 5,
    capa: "",
    resumo:
      "Winston Smith vive em uma sociedade totalitária na qual o governo controla a informação, a linguagem e a vida dos cidadãos.",
  },
];

function Historico() {
  const [livros, setLivros] = useState(livrosIniciais);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  const livrosVisiveis = useMemo(
    () => (mostrarTodos ? livros : livros.slice(0, 3)),
    [livros, mostrarTodos]
  );

  function avaliarLivro(id, nota) {
    setAvaliacoes((anteriores) => ({
      ...anteriores,
      [id]: nota,
    }));
  }

  function excluirLivro(id) {
    setLivros((anteriores) =>
      anteriores.filter((livro) => livro.id !== id)
    );

    setAvaliacoes((anteriores) => {
      const novasAvaliacoes = { ...anteriores };
      delete novasAvaliacoes[id];
      return novasAvaliacoes;
    });

    setMenuAberto(null);
    setConfirmarExclusao(null);

    if (livroSelecionado?.id === id) {
      setLivroSelecionado(null);
    }
  }

  function restaurarDemonstracao() {
    setLivros(livrosIniciais);
    setAvaliacoes({});
    setMenuAberto(null);
    setLivroSelecionado(null);
    setConfirmarExclusao(null);
    setMostrarTodos(false);
  }

  return (
    <div
      className={styles.container}
      onClick={() => {
        if (menuAberto !== null) setMenuAberto(null);
      }}
    >
      {/* Cabeçalho */}
      <header className={styles.header}>
        <History size={28} />

        <div>
          <h1>Histórico</h1>
          <p>
            Revise sua jornada, celebre conquistas e continue evoluindo.
          </p>
        </div>
      </header>

      {/* Estatísticas */}
      <section className={styles.cards}>
        {estatisticasIniciais.map((card) => {
          const Icone = card.icone;

          return (
            <article className={styles.card} key={card.titulo}>
              <Icone color={card.cor} size={22} />

              <span>{card.titulo}</span>
              <h2>{card.valor}</h2>
              <p>{card.mes}</p>
            </article>
          );
        })}
      </section>

      {/* Título da lista */}
      <div className={styles.titleSection}>
        <div>
          <h2>Histórico de Leituras</h2>
          <p>
            {livros.length === 0
              ? "Nenhum livro no histórico."
              : `${livros.length} ${
                  livros.length === 1
                    ? "livro registrado"
                    : "livros registrados"
                } na demonstração.`}
          </p>
        </div>

        <div className={styles.acoesLista}>
          {livros.length > 3 && (
            <button
              type="button"
              onClick={() => setMostrarTodos((valor) => !valor)}
            >
              {mostrarTodos ? "Mostrar menos" : "Ver todas"}
              <ArrowRight
                size={18}
                className={mostrarTodos ? styles.setaInvertida : ""}
              />
            </button>
          )}

          <button
            type="button"
            className={styles.restaurar}
            onClick={restaurarDemonstracao}
            title="Restaurar os livros de demonstração"
          >
            Restaurar
          </button>
        </div>
      </div>

      {/* Lista de livros */}
      {livrosVisiveis.length === 0 ? (
        <div className={styles.estadoVazio}>
          <BookOpen size={42} />
          <h3>Seu histórico está vazio</h3>
          <p>
            Os livros removidos podem ser recuperados restaurando a
            demonstração.
          </p>

          <button type="button" onClick={restaurarDemonstracao}>
            Restaurar livros
          </button>
        </div>
      ) : (
        <section className={styles.listaLivros}>
          {livrosVisiveis.map((livro) => {
            const notaAtual = avaliacoes[livro.id] ?? livro.nota;

            return (
              <article className={styles.livro} key={livro.id}>
                {/* Capa */}
                <div className={styles.capa}>
                  {livro.capa ? (
                    <img
                      src={livro.capa}
                      alt={`Capa de ${livro.nome}`}
                      onError={(evento) => {
                        evento.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <BookOpen size={32} />
                  )}
                </div>

                {/* Informações */}
                <div className={styles.info}>
                  <h3>{livro.nome}</h3>
                  <p>{livro.autor}</p>

                  <span className={styles.genero}>
                    {livro.genero}
                  </span>

                  <small>{livro.paginas} páginas</small>
                </div>

                {/* Progresso */}
                <div className={styles.progresso}>
                  <p>
                    {livro.progresso === 100
                      ? `Concluído em ${livro.data}`
                      : "Leitura em andamento"}
                  </p>

                  <div
                    className={styles.barra}
                    role="progressbar"
                    aria-valuenow={livro.progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={styles.preenchimento}
                      style={{ width: `${livro.progresso}%` }}
                    />
                  </div>

                  <span>{livro.progresso}%</span>
                </div>

                {/* Resumo */}
                <button
                  type="button"
                  className={styles.botao}
                  onClick={() => setLivroSelecionado(livro)}
                >
                  Ver resumo
                </button>

                {/* Avaliação */}
                <div className={styles.nota} aria-label="Avaliação do livro">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <button
                      key={estrela}
                      type="button"
                      className={
                        estrela <= notaAtual
                          ? styles.estrelaAtiva
                          : styles.estrela
                      }
                      onClick={() => avaliarLivro(livro.id, estrela)}
                      title={`Avaliar com ${estrela} estrela(s)`}
                      aria-label={`${estrela} estrela(s)`}
                    >
                      <Star
                        size={17}
                        fill={
                          estrela <= notaAtual
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Menu de opções */}
                <div
                  className={styles.menuContainer}
                  onClick={(evento) => evento.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.menuBotao}
                    aria-label={`Opções de ${livro.nome}`}
                    aria-expanded={menuAberto === livro.id}
                    onClick={() =>
                      setMenuAberto((atual) =>
                        atual === livro.id ? null : livro.id
                      )
                    }
                  >
                    <MoreVertical size={21} />
                  </button>

                  {menuAberto === livro.id && (
                    <div className={styles.menu}>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmarExclusao(livro);
                          setMenuAberto(null);
                        }}
                      >
                        <Trash2 size={16} />
                        Remover do histórico
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Modal de resumo */}
      {livroSelecionado && (
        <div
          className={styles.overlay}
          onClick={() => setLivroSelecionado(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloResumo"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <BookMarked size={23} />
                <h2 id="tituloResumo">Resumo da obra</h2>
              </div>

              <button
                type="button"
                className={styles.fechar}
                onClick={() => setLivroSelecionado(null)}
                aria-label="Fechar resumo"
              >
                <X size={21} />
              </button>
            </div>

            <h3>{livroSelecionado.nome}</h3>

            <p className={styles.autorModal}>
              <UserRound size={16} />
              {livroSelecionado.autor}
            </p>

            <span className={styles.generoModal}>
              {livroSelecionado.genero}
            </span>

            <p className={styles.resumo}>
              {livroSelecionado.resumo}
            </p>

            <div className={styles.detalhesModal}>
              <span>
                <BookOpen size={17} />
                {livroSelecionado.paginas} páginas
              </span>

              <span>
                <CalendarDays size={17} />
                {livroSelecionado.data}
              </span>
            </div>

            <button
              type="button"
              className={styles.fecharModal}
              onClick={() => setLivroSelecionado(null)}
            >
              Fechar
            </button>
          </section>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmarExclusao && (
        <div
          className={styles.overlay}
          onClick={() => setConfirmarExclusao(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloExclusao"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <Trash2 size={23} />
                <h2 id="tituloExclusao">Remover livro?</h2>
              </div>

              <button
                type="button"
                className={styles.fechar}
                onClick={() => setConfirmarExclusao(null)}
                aria-label="Cancelar"
              >
                <X size={21} />
              </button>
            </div>

            <p className={styles.resumo}>
              Deseja remover <strong>{confirmarExclusao.nome}</strong> do
              histórico desta demonstração?
            </p>

            <div className={styles.acoesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={() => setConfirmarExclusao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmar}
                onClick={() => excluirLivro(confirmarExclusao.id)}
              >
                <Trash2 size={16} />
                Remover
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Historico;