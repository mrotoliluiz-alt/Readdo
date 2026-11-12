import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./index.module.css";
import api from '../../services/api'

import logo from "../../assets/Group 50.svg";
import Botao from "../../componentes/botao";

import {
  ArrowLeft,
  BookOpen,
  Mail,
  User,
  Lock,
  ImagePlus
} from "lucide-react";

function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    US_nome:'',
    Us_email:'',
    Us_senha:'',
    img: null
  })

  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        setLoading(true);
        setErro('');

        if (formData.Us_senha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        const data = new FormData();

        data.append('US_nome', formData.US_nome);
        data.append('Us_email', formData.Us_email);
        data.append('Us_senha', formData.Us_senha);

        if (formData.img) {
            data.append('img', formData.img);
        }

        await api.post('/usuarios', data);

        navigate('/login');

    } catch (error) {
        console.error('Erro ao realizar o cadastro:', error);
        console.log("Resposta:", error.response?.data);
        console.log("Status:", error.response?.status);

        setErro(
            error.response?.data?.mensagem ||
            'Não foi possível realizar o cadastro.'
        );

    } finally {
        setLoading(false);
    }
};

    const selecionarImagem = (event) => {
    const arquivo = event.target.files[0];

    if (arquivo) {
        setFormData({
            ...formData,
            img: arquivo
        });

        setPreview(URL.createObjectURL(arquivo));
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
          onSubmit={handleSubmit}
          className={styles.formCard}
        >

          <h2>
            Criar sua conta
          </h2>

          <p>
            Preencha seus dados para começar
          </p>

          {/* FOTO DE PERFIL */}
          <div className={styles.imagemPerfil}>

            <div className={styles.previewImagem}>
              {preview ? (
                <img src={preview} alt="Prévia da foto de perfil" />
              ) : (
                <User size={32} />
              )}
            </div>

            <div className={styles.imagemInfo}>
              <span>Foto de perfil</span>

              <label htmlFor="imagemPerfil" className={styles.botaoImagem}>
                <ImagePlus size={18} />
                Adicionar imagem
              </label>

              <input
                id="imagemPerfil"
                type="file"
                accept="image/*"
                onChange={selecionarImagem}
                hidden
              />

              <small>
                {formData.img ? formData.img.name : "Escolha uma imagem para seu perfil"}
              </small>
            </div>

          </div>


          {/* NOME */}
          <div className={styles.inputs}>

            <User
              className={styles.iconInput}
              size={20}
            />

            <input
              type="text"
              placeholder="Nome do usuário"
              value={formData.US_nome}
              onChange={(event) => setFormData({...formData, US_nome: event.target.value})}
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
              value={formData.Us_email}
              onChange={(event) => setFormData({...formData, Us_email: event.target.value})}
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
              value={formData.Us_senha}
              onChange={(event) => setFormData({...formData, Us_senha: event.target.value})}
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
              onChange={(event) => setConfirmarSenha(event.target.value)}
              required
            />

          </div>


          {/* BOTÃO */}

          <Botao
            texto="Cadastrar"
            variante="login"
            type="submit"
            disabled={loading}
          />


          {/* ERRO */}

          {erro && (
            <span className={styles.erro}>
              {erro}
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