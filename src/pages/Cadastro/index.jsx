import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../firebase";
import styles from "./index.module.css";

import logo from "../../assets/Group 50.svg";
import Botao from "../../componentes/botao";

import {
  ArrowLeft,
  BookOpen,
  Mail,
  User,
  Lock,
} from "lucide-react";

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    // Verifica tamanho da senha
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);

      setSucesso("Conta criada com sucesso!");

      // Depois de criar a conta, vai para o Login
      setTimeout(() => {
        navigate("/Login");
      }, 1500);

    } catch (err) {
      console.error(err);

      setErro("Não foi possível criar a conta.");
      setSucesso("");
    }
  };

  return (
    <div className={styles.loginContainer}>

      {/* =========================================
          LADO ESQUERDO
      ========================================= */}

      <div className={styles.ladoEsquerdo}>

        <div className={styles.leftContent}>

          {/* Voltar */}
          <a href="/">
            <ArrowLeft size={20} />
            Voltar ao Início
          </a>

          {/* Logo */}
          <div className={styles.logoBox}>
            <h2 className={styles.titulo}>
              Read
            </h2>

            <h2>
              do
            </h2>
          </div>

          {/* Texto */}
          <div className={styles.texto}>

            <h2 className={styles.Hgrande}>
              <BookOpen size={40} />
              Comece sua jornada!
            </h2>

          </div>

          {/* Mascote */}
          <img
            src={logo}
            alt="Mascote do Readduo"
          />

        </div>

        {/* Rodapé */}
        <p>
          © 2026 Readduo
        </p>

      </div>


      {/* =========================================
          LADO DIREITO
      ========================================= */}

      <div className={styles.rightSide}>

        <form
          onSubmit={handleRegister}
          className={styles.formCard}
        >

          <h2>
            Criar sua conta
          </h2>

          <p>
            Preencha seus dados para começar
          </p>


          {/* NOME */}
          <div className={styles.inputs}>

            <User
              className={styles.iconInput}
              size={20}
            />

            <input
              type="text"
              placeholder="Nome do usuário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

          </div>


          {/* EMAIL */}
          <div className={styles.inputs}>

            <Mail
              className={styles.iconInput}
              size={20}
            />

            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>


          {/* SENHA */}
          <div className={styles.inputs}>

            <Lock
              className={styles.iconInput}
              size={20}
            />

            <input
              type="password"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

          </div>


          {/* CONFIRMAR SENHA */}
          <div className={styles.inputs}>

            <Lock
              className={styles.iconInput}
              size={20}
            />

            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) =>
                setConfirmarSenha(e.target.value)
              }
              required
            />

          </div>


          {/* BOTÃO */}

          <Botao
            texto="Cadastrar"
            variante="login"
          />


          {/* ERRO */}

          {erro && (
            <span className={styles.erro}>
              {erro}
            </span>
          )}


          {/* SUCESSO */}

          {sucesso && (
            <span className={styles.sucesso}>
              {sucesso}
            </span>
          )}


          {/* LOGIN */}

          <div className={styles.register}>

            Já tem uma conta?

            <a href="/Login">
              Entrar
            </a>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Cadastro;