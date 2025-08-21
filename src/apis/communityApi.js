import api from './api';
import { loadAuth } from './auth';

// ... normalizeError 함수는 그대로 둡니다 ...
function normalizeError(error) {
    if (error?.response) {
        const { data, status } = error.response;
        const msgs = [];
        if (typeof data === 'string') msgs.push(data);
        if (data?.message) msgs.push(data.message);
        if (data?.detail) msgs.push(data.detail);
        if (data?.non_field_errors) msgs.push(data.non_field_errors.join(' '));
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
export const fetchNews = async (params) => {
    try {
        const response = await api.get('/api/community/news/', { params });
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

// --- 게시글 (CommunityPost) API ---
export const fetchCommunityPosts = async (params) => {
    try {
        const response = await api.get('/api/community/posts/', { params });
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

export const fetchCommunityPostDetail = async (postId) => {
    try {
        const response = await api.get(`/api/community/posts/${postId}/`);
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

export const createCommunityPost = async (postData) => {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('게시글을 작성하려면 로그인이 필요합니다.');
    }
    try {
        // 인터셉터가 헤더를 자동으로 추가하므로 여기서 헤더를 넘길 필요가 없습니다.
        const response = await api.post('/api/community/posts/', postData);
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

export const deleteCommunityPost = async (postId) => {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('게시글을 삭제하려면 로그인이 필요합니다.');
    }
    try {
        // 인터셉터가 헤더를 자동으로 추가하므로 여기서 헤더를 넘길 필요가 없습니다.
        const response = await api.delete(`/api/community/posts/${postId}/`);
        if (response.status === 204) {
            return { success: true, message: '게시글이 삭제되었습니다.' };
        }
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

// --- 좋아요 (Like) API ---
export const togglePostLike = async (postId) => {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('좋아요는 로그인이 필요합니다.');
    }
    try {
        const response = await api.post(`/api/community/posts/${postId}/like/`);
        return response.data; // { liked: boolean, like_count: number }
    } catch (error) {
        normalizeError(error);
    }
};

export const toggleCommentLike = async (commentId) => {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('좋아요는 로그인이 필요합니다.');
    }
    try {
        const response = await api.post(`/api/community/comments/${commentId}/like/`);
        return response.data; // { liked: boolean, count: number }
    } catch (error) {
        normalizeError(error);
    }
};

// --- 댓글 (Comment) API ---
export const fetchComments = async (postId) => {
    try {
        const response = await api.get(`/api/community/posts/${postId}/comments/`);
        return response.data; // array with replies
    } catch (error) {
        normalizeError(error);
    }
};

export const createComment = async (postId, content, parent = null) => {
    const auth = loadAuth();
    if (!auth?.access) {
        throw new Error('댓글 작성은 로그인이 필요합니다.');
    }
    try {
        const payload = parent ? { parent, content } : { content };
        const response = await api.post(`/api/community/posts/${postId}/comments/`, payload);
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};