import { useState } from "react";
import styles from "./index.module.css";
import CardLivro from "../../componentes/CardLivro";
import { Bookmark, Search, X } from "lucide-react";

const livros = [
  {
    titulo: "A Quinta Estação",
    autor: "N. K. Jemisin",
    tipo: "Livro",
    tag: "Fantasia",
    corTag: "#8b5cf6",
  },
  {
    titulo: "Jogos Vorazes",
    autor: "Suzanne Collins",
    tipo: "Livro",
    tag: "Popular",
    corTag: "#fb923c",
  },
  {
    titulo: "Duna",
    autor: "Frank Herbert",
    tipo: "Livro",
    tag: "Épico",
    corTag: "#0FA6B3",
  },
  {
    titulo: "1984",
    autor: "George Orwell",
    tipo: "Livro",
    tag: "Clássico",
    corTag: "#4f7cff",
  },
  {
    titulo: "Fahrenheit 451",
    autor: "Ray Bradbury",
    tipo: "Livro",
    tag: "Distopia",
    corTag: "#b45eff",
  },
  {
    titulo: "Neuromancer",
    autor: "William Gibson",
    tipo: "Livro",
    tag: "Cyberpunk",
    corTag: "#22c55e",
  },
];

function Salvos() {
  const [busca, setBusca] = useState("");

  const livrosFiltrados = livros.filter((livro) => {
    const termo = busca.toLowerCase().trim();

    return (
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo) ||
      livro.tag.toLowerCase().includes(termo)
    );
  });

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <Bookmark className={styles.iconeHeader} />

        <div>
          <h1>Minhas Obras Salvas</h1>
          <p>Todas as obras que você salvou para ler depois.</p>
        </div>
      </header>

      {/* Pesquisa */}
      <section className={styles.searchArea}>
        <div className={styles.searchBar}>
          <Search className={styles.iconeBusca} size={20} />

          <input
            type="text"
            placeholder="Buscar por título, autor ou gênero..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar nas obras salvas"
          />

          {busca && (
            <button
              type="button"
              className={styles.limparBusca}
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              title="Limpar busca"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className={styles.resultados}>
          <span>
            {livrosFiltrados.length}{" "}
            {livrosFiltrados.length === 1 ? "obra encontrada" : "obras encontradas"}
          </span>
        </div>
      </section>

      {/* Lista de obras */}
      {livrosFiltrados.length > 0 ? (
        <section className={styles.grid}>
          {livrosFiltrados.map((livro) => (
            <CardLivro
              key={livro.titulo}
              titulo={livro.titulo}
              autor={livro.autor}
              tipo={livro.tipo}
              tag={livro.tag}
              corTag={livro.corTag}
            />
          ))}
        </section>
      ) : (
        <section className={styles.estadoVazio}>
          <div className={styles.iconeVazio}>
            <Search size={30} />
          </div>

          <h2>Nenhuma obra encontrada</h2>

          <p>
            Não encontramos nenhuma obra correspondente a "{busca}".
            Experimente pesquisar por outro título, autor ou gênero.
          </p>

          <button type="button" onClick={() => setBusca("")}>
            Limpar pesquisa
          </button>
        </section>
      )}
    </div>
  );
}

export default Salvos;