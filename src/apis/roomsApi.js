import api from './api';

/* 방 목록 조회 */
export async function fetchRooms(params = {}) {
    const res = await api.get('/api/rooms/', { params });
    return res.data;
}