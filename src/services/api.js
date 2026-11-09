import axios from 'axios';

const api = axios.create({
    //o vite expõe variaveis de ambiente via import.meta.env
    baseURL: import.meta.env.VITE_API_URL || `http://localhost:3333`,
});

export default api;