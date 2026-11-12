import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import logo from "../../assets/Group 50.svg";
import Botao from '../../componentes/botao';
import api from "../../services/api";
import {
  BookOpen,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";

function Login() {
  let navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);


  function handleSubmit(event){
    event.preventDefault();
    logar();
  }

  async function logar () {
    try{
      setLoading(true);
      setErro("");

      const resposta = await api.get('/login', {
            params: {
                email: email,
                senha: senha,
          }
      });

      // Recebe os dados do usuário do back
      const usuarioEncontrado = resposta.data.dados;
       // Salva os dados no navegador
      localStorage.setItem(
        "usuario",
        JSON.stringify(usuarioEncontrado)
      );
      
      navigate ("/Home");
    } catch (error) {
      console.error("Erro ao realizar Login", error);

      if (error.response?.status === 403){
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("não foi possivel realizar o login.");
      }
      
    } finally {
      setLoading(false);
    }
  }
  

  return (
  <div className={styles.loginContainer}>

    <div className={styles.ladoEsquerdo}>

      

      <div className={styles.leftContent}>

        <a href="/">
             <ArrowLeft></ArrowLeft> Voltar ao Inicio 
          </a>

        {/* Logo e nome do site */}
        <div className={styles.logoBox}>
          
          
          <h2 className={styles.titulo}>Read</h2>
          <h2 >do</h2>
        </div>

        

        <div className={styles.texto}>
        
        <h2 className={styles.Hgrande}>
          <BookOpen size={40}></BookOpen> Bem-vindo de volta!
        </h2>
        </div>

      
        
          
            <img src= {logo} alt="logo" />


      </div>

      <p>
        © 2026 Readduo
      </p>

    </div>

    {/* Lado direito */}
    <div className={styles.rightSide}>

      <form onSubmit={handleSubmit} className={styles.formCard}>

        <h2>Entrar na conta</h2>

        <p>
          Digite suas credenciais para acessar
        </p>

        <div className={styles.inputs}>
            
            <Mail className={styles.iconInput} size={20}/>

          <input
          type="email"
          value={email}
          placeholder= "Seu e-mail"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        </div>


        <div className={styles.inputs}>

          <Lock className={styles.iconInput} size={20}/>

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
        />

        </div>
        
        {/*Erro ao entrar */}
        {erro && <p>{erro}</p>}

        <Botao
        texto='Entrar'
        variante= 'login'
        type="submit"
        disabled={loading}
        />


        <div className={styles.register}>
          Não tem conta?
          <a href="/Cadastro">
            Criar conta grátis
          </a>
        </div>

      </form>

    </div>

  </div>
);

}

export default Login;
