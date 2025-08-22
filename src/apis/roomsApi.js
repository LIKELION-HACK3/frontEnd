import api from './api';
import { loadAuth } from './auth';

/* 방 목록 조회 */
export async function fetchRooms(params = {}) {
    const res = await api.get('/api/rooms/', { params });
    return res.data;
}

export async function searchRooms({ page = 1, page_size = 20, address = '', room_type = '' } = {}) {
    const params = { page, page_size };
    if (address) params.q = address;
    if (room_type) params.room_type = room_type;
    const res = await api.get('/api/rooms/search/', { params });
    return res.data;
}

export async function fetchReviewsForRoom(roomId) {
    const res = await api.get(`/api/rooms/${roomId}/reviews/`);
    return res.data;
}

export async function fetchReviewStats(roomId) {
    const res = await api.get(`/api/rooms/${roomId}/reviews/stats/`);
    return res.data;
}

export async function createReview(roomId, reviewData) {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('리뷰를 작성하려면 로그인이 필요합니다.');
    }

    const res = await api.post(`/api/rooms/${roomId}/reviews/`, reviewData, {
        headers: {
            Authorization: `Bearer ${auth.access}`,
        },
    });
    return res.data;
}
