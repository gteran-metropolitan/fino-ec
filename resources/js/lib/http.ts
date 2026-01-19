import axios from 'axios';

// Crear instancia de axios con configuración base
const http = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Importante: enviar cookies automáticamente
    withXSRFToken: true,   // Axios enviará automáticamente el token XSRF
});

export default http;

