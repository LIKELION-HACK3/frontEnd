import api from './api';
import { loadAuth } from './auth';

/**
 * 인증 헤더가 필요한 경우 가져오는 헬퍼 함수
 */
function getAuthHeaders() {
    const auth = loadAuth();
    if (auth && auth.access) {
        return { Authorization: `Bearer ${auth.access}` };
    }
    // 로그인이 필요없는 공개 API를 위해 undefined를 반환할 수 있도록 처리
    return undefined;
}

/**
 * API 에러 메시지를 일관된 형식으로 변환하는 함수
 * @param {Error} error - axios 에러 객체
 */
function normalizeError(error) {
    if (error?.response) {
        const { data, status } = error.response;
        const msgs = [];

        if (typeof data === 'string') msgs.push(data);
        if (data?.message) msgs.push(data.message);
        if (data?.detail) msgs.push(data.detail);
        if (data?.non_field_errors) msgs.push(data.non_field_errors.join(' '));

        // 필드별 에러도 추가 (예: {"username": ["이미 사용중인 아이디입니다."]})
        Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key]) && !['detail', 'non_field_errors'].includes(key)) {
                msgs.push(`${key}: ${data[key].join(' ')}`);
            }
        });

        throw new Error(msgs.join('\n') || `요청에 실패했습니다. (상태 코드: ${status})`);
    }

    throw new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
}

// --- 뉴스 (News) API ---

/**
 * 뉴스 목록을 조회합니다. (GET /api/community/news/)
 * @param {object} params - 쿼리 파라미터 (q, source_id, category, etc.)
 */
export const fetchNews = async (params) => {
    try {
        const response = await api.get('/api/community/news/', { params });
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

// --- 게시글 (CommunityPost) API ---

/**
 * 게시글 목록을 조회합니다. (GET /api/community/posts/)
 * @param {object} params - 쿼리 파라미터 (q, region, category, etc.)
 */
export const fetchCommunityPosts = async (params) => {
    try {
        const response = await api.get('/api/community/posts/', { params });
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

/**
 * 새 게시글을 작성합니다. (POST /api/community/posts/)
 * @param {object} postData - { title, content, region, category }
 */
export const createCommunityPost = async (postData) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error('게시글을 작성하려면 로그인이 필요합니다.');

        const response = await api.post('/api/community/posts/', postData, { headers });
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

/**
 * 특정 게시글을 삭제합니다. (DELETE /api/community/posts/{post_id}/)
 * @param {string | number} postId - 삭제할 게시글의 ID
 */
export const deleteCommunityPost = async (postId) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error('게시글을 삭제하려면 로그인이 필요합니다.');

        const response = await api.delete(`/api/community/posts/${postId}/`, { headers });

        if (response.status === 204) {
            return { success: true, message: '게시글이 삭제되었습니다.' };
        }
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};
