import axios from 'axios';

const api = axios.create({
    baseURL: 'https://app.uniroom.shop/',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;