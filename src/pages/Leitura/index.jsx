import styles from "./index.module.css";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Bookmark,
  Settings,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Leitura() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className={styles.container}>

      {/* ---------- TOPO ---------- */}

      <header className={styles.topbar}>

        <button
          className={styles.voltar}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className={styles.infoLivro}>
          <h1>Duna</h1>
          <span>Frank Herbert</span>
        </div>

        <div className={styles.acoes}>

          <button
            className={styles.acao}
            title="Diminuir fonte"
          >
            <Minus size={19} />
          </button>

          <span className={styles.tamanhoFonte}>
            Aa
          </span>

          <button
            className={styles.acao}
            title="Aumentar fonte"
          >
            <Plus size={19} />
          </button>

          <button
            className={styles.acao}
            title="Salvar"
          >
            <Bookmark size={19} />
          </button>

          <button
            className={styles.acao}
            title="Configurações"
          >
            <Settings size={19} />
          </button>

        </div>

      </header>


      {/* ---------- ÁREA DE LEITURA ---------- */}

      <main className={styles.areaLeitura}>

        <article className={styles.livro}>

          <div className={styles.cabecalhoCapitulo}>

            <span className={styles.numeroCapitulo}>
              CAPÍTULO 1
            </span>

            <h2>
              O começo da jornada
            </h2>

          </div>


          <div className={styles.texto}>

            <p>
              Durante muito tempo, aquele lugar havia
              permanecido apenas como uma lembrança
              distante. As histórias contadas sobre ele
              pareciam pertencer a outro mundo.
            </p>

            <p>
              Agora, porém, tudo estava diferente.
              Pela primeira vez, ele podia observar
              aquele horizonte com seus próprios olhos.
              O vento atravessava lentamente a paisagem,
              levando consigo pequenos grãos de areia.
            </p>

            <p>
              Não havia ninguém por perto. Apenas o
              silêncio e o som constante do vento.
              Mesmo assim, havia algo naquele lugar
              que fazia parecer que ele estava sendo
              observado.
            </p>

            <p>
              Ele respirou profundamente e continuou
              caminhando. Sabia que aquele era apenas
              o começo de sua jornada.
            </p>

            <div className={styles.divisor}>
              <span>✦</span>
            </div>

            <h2 className={styles.proximoCapitulo}>
              Capítulo 2
            </h2>

            <p>
              O caminho à frente parecia ainda mais
              desconhecido. Mas voltar já não era
              uma opção.
            </p>

          </div>

        </article>

      </main>


      {/* ---------- RODAPÉ ---------- */}

      <footer className={styles.rodape}>

        <button className={styles.capituloBotao}>
          <ChevronLeft size={18} />
          Anterior
        </button>

        <div className={styles.progresso}>

          <div className={styles.infoProgresso}>
            <span>
              Capítulo 1 de 20
            </span>

            <span>
              35%
            </span>
          </div>

          <div className={styles.barra}>
            <div
              className={styles.progressoAtual}
            />
          </div>

        </div>

        <button className={styles.capituloBotao}>
          Próximo
          <ChevronRight size={18} />
        </button>

      </footer>

    </div>
  );
}

export default Leitura;