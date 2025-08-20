import axios from 'axios';
import { clearAuth, getRefreshToken, setAuth } from './auth';

const api = axios.create({
    baseURL: 'https://app.uniroom.shop/',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('uniroom_auth');
        const access = raw ? JSON.parse(raw)?.access : null;
        if (access) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${access}`;
        }
    } catch { }
    return config;
});

export default api;