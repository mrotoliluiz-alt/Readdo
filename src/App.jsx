import { Routes, Route } from "react-router-dom";

import Layout from "./componentes/layout";
import Landing from "./pages/Landing";
import Home from "./pages/home";
import Login from "./pages/Login"
import Cadastro from "./pages/Cadastro";
import Salvos from "./pages/Salvos";
import Chat from "./pages/Chat";
import Configuracoes from "./pages/Configuracoes";
import Historico from "./pages/Historico";
import Oficina from "./pages/Oficina";
import Perfil from "./pages/Perfil";
import Pesquisa from "./pages/Pesquisa";
import Missoes from "./pages/Missões";
import Livro from "./pages/LivroAberto";
import Leitura from "./pages/Leitura";

function App() {
  return (
    <Routes>
        
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/livro/:id" element={<Livro />} />
        <Route path="/leitura" element={<Leitura />} />
        <Route element={<Layout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Salvos" element={<Salvos />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Config" element={<Configuracoes />} />
        <Route path="/Historico" element={<Historico />} />
        <Route path="/Oficina" element={<Oficina />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/Pesquisa" element={<Pesquisa />} />
        <Route path="/Missoes" element={<Missoes/>}/>
        </Route>
    </Routes>
    
  )
}

export default App