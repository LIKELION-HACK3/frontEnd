import api from './api';
import { loadAuth } from './auth';

/* 방 목록 조회 */
export async function fetchRooms(params = {}) {
    const res = await api.get('/api/rooms/', { params });
    return res.data;
}

/**
 * 특정 방의 모든 리뷰를 가져옵니다.
 */
export async function fetchReviewsForRoom(roomId) {
    const res = await api.get(`/api/rooms/${roomId}/reviews/`);
    return res.data;
}

/**
 * [수정] 특정 방의 리뷰 통계(평균 별점 등)를 가져옵니다.
 */
export async function fetchReviewStats(roomId) {
    const res = await api.get(`/api/rooms/${roomId}/reviews/stats/`);
    return res.data;
}

/**
 * 특정 방에 새 리뷰를 작성합니다.
 */
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
