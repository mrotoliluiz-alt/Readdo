import styles from "./index.module.css";
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../Tema/themeContext.jsx";

import {
  Settings,
  User,
  BadgeCheck,
  Bookmark,
  Feather,
  Flame,
  Star,
  Sun,
  Moon,
  Monitor,
  Lock,
  Smartphone,
  Bell,
  Shield,
  ChevronRight,
  Pencil,
  LogOut,
} from "lucide-react";

const estatisticas = [
  {
    titulo: "Obras salvas",
    valor: "23",
    extra: "+4 este mês",
    icone: <Bookmark size={24} />,
  },
  {
    titulo: "Obras escritas",
    valor: "7",
    extra: "+1 este mês",
    icone: <Feather size={24} />,
  },
  {
    titulo: "Sequência",
    valor: "8 dias",
    extra: "Melhor: 16 dias",
    icone: <Flame size={24} />,
  },
  {
    titulo: "XP acumulado",
    valor: "24.850",
    extra: "Top 18%",
    icone: <Star size={24} />,
  },
];

const aparencia = [
  {
    titulo: "Modo Claro",
    descricao: "Tema padrão do Readduo",
    valor: "claro",
    icone: <Sun size={28} />,
  },
  {
    titulo: "Modo Escuro",
    descricao: "Ideal para leituras noturnas",
    valor: "escuro",
    icone: <Moon size={28} />,
  },
];

const seguranca = [
  {
    titulo: "Alterar senha",
    descricao: "Atualize sua senha de acesso.",
    icone: <Lock size={22} />,
  },
  {
    titulo: "Gerenciar dispositivos",
    descricao: "Veja onde sua conta está conectada.",
    icone: <Smartphone size={22} />,
  },
  {
    titulo: "Privacidade",
    descricao: "Controle quem pode visualizar seu perfil.",
    icone: <Shield size={22} />,
  },
  {
    titulo: "Notificações",
    descricao: "Configure avisos e lembretes.",
    icone: <Bell size={22} />,
  },
];

function Configuracoes() {
  const { tema, setTema } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>

      {/* Cabeçalho */}

      <div className={styles.header}>
        <div className={styles.titulo}>
          <Settings />
          <h1>Configurações</h1>
        </div>

        <p>
          Gerencie sua conta, personalize sua experiência e ajuste suas
          preferências.
        </p>
      </div>

      {/* Layout */}

      <div className={styles.layout}>

        {/* Coluna Esquerda */}

        <div className={styles.left}>

          {/* Aparência */}

          <section className={styles.card}>

            <div className={styles.cardHeader}>
              <h3>Aparência</h3>

              <p>
                Escolha como deseja visualizar o Readduo.
              </p>
            </div>

            <div className={styles.temas}>

              {aparencia.map((item) => {

                const ativo = tema === item.valor;

                return (
                  <button
                    key={item.valor}
                    className={`${styles.tema} ${
                      ativo ? styles.temaAtivo : ""
                    }`}
                    onClick={() => setTema(item.valor)}
                  >

                    <div className={styles.temaIcone}>
                      {item.icone}
                    </div>

                    <strong>
                      {item.titulo}
                    </strong>

                    <span>
                      {item.descricao}
                    </span>

                  </button>
                );

              })}

            </div>

          </section>

        </div>

        {/* Coluna Direita */}

        <div className={styles.right}>


          {/* Sobre */}

          <section className={styles.sideCard}>

            <div className={styles.cardHeader}>
              <h3>Sobre o Readduo</h3>
            </div>

            <div className={styles.sobre}>

              <div className={styles.sobreItem}>
                <User size={18} />
                <span>Conta Premium: Não</span>
              </div>

              <div className={styles.sobreItem}>
                <Star size={18} />
                <span>Versão 1.0.0</span>
              </div>

              <div className={styles.sobreItem}>
                <Settings size={18} />
                <span>Última atualização: Hoje</span>
              </div>

            </div>

          </section>

          {/* Atalhos */}

          <section className={styles.sideCard}>

            <div className={styles.cardHeader}>
              <h3>Atalhos</h3>
            </div>

            <button className={styles.atalho}>
              <p>Editar Perfil</p>
              <ChevronRight size={18} />
            </button>

            <button className={styles.atalho}>
              <p>Central de Ajuda</p>
              <ChevronRight size={18} />
            </button>

            <button className={styles.atalho}>
              <p>Política de Privacidade</p>
              <ChevronRight size={18} />
            </button>

            <button className={styles.atalho}>
              <p>Termos de Uso</p>
              <ChevronRight size={18} />
            </button>

          </section>

          <button className={styles.Btn}
          onClick={() => navigate("/") }>
  
          <div className={styles.sign}><LogOut aria-hidden="true" /></div>
          
          <div className={styles.text}>Sair</div>
        </button>

        </div>

      </div>

    </div>
  );
}

export default Configuracoes;