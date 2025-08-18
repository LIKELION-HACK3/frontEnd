import api from './api';
import { loadAuth } from './auth';

// 인증 헤더를 가져오는 헬퍼 함수
function getAuthHeaders() {
    const auth = loadAuth();
    if (auth && auth.access) {
        return { Authorization: `Bearer ${auth.access}` };
    }
    return {};
}

// GET /api/bookmarks/
export async function fetchBookmarks({ page = 1, page_size = 50 } = {}) {
    try {
        const response = await api.get('/api/bookmarks/', {
            params: { page: String(page), page_size: String(page_size) },
            headers: getAuthHeaders(), // 요청 시점에 헤더를 직접 설정
        });
        return response.data;
    } catch (error) {
        console.error('fetchBookmarks failed:', error.response || error);
        throw new Error('북마크 목록을 불러오지 못했습니다.');
    }
}

// 모든 북마크를 가져오는 함수
export async function fetchAllBookmarks() {
    let page = 1;
    const all = [];
    while (true) {
        const data = await fetchBookmarks({ page, page_size: 50 });
        all.push(...(data.results || []));
        if (!data.next) break;
        page += 1;
    }
    return all;
}

// POST /api/bookmarks/{room_id}/toggle/
export async function toggleBookmark(roomId) {
    try {
        // POST 요청 시 빈 객체 {}를 두 번째 인자로 전달해야 headers를 세 번째 인자로 설정할 수 있습니다.
        const response = await api.post(
            `/api/bookmarks/${roomId}/toggle/`,
            {},
            {
                headers: getAuthHeaders(), // 요청 시점에 헤더를 직접 설정
            }
        );

        if (response.status === 201) return { action: 'added' };
        if (response.status === 200) return { action: 'removed' };
        return { action: 'unknown' };
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('방을 찾을 수 없습니다.');
        }
        console.error('toggleBookmark failed:', error.response || error);
        throw new Error('북마크 토글에 실패했습니다.');
    }
}
