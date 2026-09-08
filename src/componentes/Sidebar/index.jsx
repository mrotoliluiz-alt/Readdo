import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from "./index.module.css";
import logo from "../../assets/Group 50.svg";
import {
  House,
  BookOpen,
  Search,
  History,
  PenTool,
  User,
  ArrowRight,
  ArrowLeft,
  MessageSquareText,
  Bolt,
  ClipboardList
} from "lucide-react";



function Sidebar({ fechada, setFechada }) {

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`${styles.sidebar} ${
        fechada ? styles.sidebarFechada : ""
    }`}>

    <button
    className={styles.toggle}
    onClick={() => setFechada(!fechada)}>
    {fechada ? (<ArrowRight size={16} strokeWidth={2.5}  />) : (<  ArrowLeft size={20} />)}
    </button>

      <div className={styles.logo}>
        <div className={styles.logoIcon}>
            <img src={logo} alt="logo" />
        </div>

        {!fechada && <h2 className={styles.Read}>Read</h2>}
        {!fechada && <h2>duo</h2>}
      </div>

      <nav className={styles.nav}>

    <button
        className={
            location.pathname === "/home"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/home")}
    >
        <House></House>
        {!fechada && <span>Início</span>}
    </button>

    <button
        className={
            location.pathname === "/oficina"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/oficina")}
    >
        <PenTool />
        {!fechada && <span>Oficina</span>}
    </button>

    <button
        className={
            location.pathname === "/Pesquisa"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Pesquisa")}
    >
        <Search></Search>
        {!fechada && <span>Pesquisa</span>}
    </button>

    <button
        className={
            location.pathname === "/Historico"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Historico")}
    >
        <History />
        {!fechada && <span>Histórico</span>}
    </button>

     <button
        className={
            location.pathname === "/Salvos"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Salvos")}
    >
        < BookOpen />
       {!fechada && <span>Salvos</span>}
    </button>

    <button
        className={
            location.pathname === "/Perfil"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Perfil")}
    >
        < User />
        {!fechada && <span>Perfil</span>}
    </button>

    <button
        className={
            location.pathname === "/Chat"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Chat")}
    >
        < MessageSquareText />
        {!fechada && <span>Chat</span>}
    </button>

    <button
        className={
            location.pathname === "/Missoes"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Missoes")}
    >
        < ClipboardList />
        {!fechada && <span>Missões</span>}
    </button>

    <button
        className={
            location.pathname === "/Config"
                ? styles.menuAtivo
                : styles.menu
        }
        onClick={() => navigate("/Config")}
    >
        < Bolt />
        {!fechada && <span>Configurações</span>}
    </button>

    

</nav>

    </aside>
  );
}

export default Sidebar;

