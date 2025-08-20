import api from './api';
import axios from 'axios';

const STORAGE_KEY = 'uniroom_auth';

// setAuth 함수는 이제 토큰만 받아서 저장합니다.
export function setAuth(tokens, user) {
    const authData = {
        access: tokens?.access || null,
        refresh: tokens?.refresh || null,
        user: user || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    // axios 기본 헤더 설정은 인터셉터가 담당하므로 여기서 제거합니다.
}

export function loadAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
}

function normalizeError(error) {
    if (error?.response) {
        const { data, status } = error.response;
        const msgs = [];
        if (typeof data === 'string') msgs.push(data);
        if (data?.message) msgs.push(data.message);
        ['username', 'email', 'password', 'password_confirm', 'detail', 'non_field_errors'].forEach((k) => {
            const v = data?.[k];
            if (v) msgs.push(Array.isArray(v) ? v.join(' ') : String(v));
        });
        throw new Error(msgs.join(' ') || `요청 실패 (${status})`);
    }
    throw new Error('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
}

// --- 추가된 토큰 재발급 함수 ---
/**
 * Refresh 토큰으로 새로운 Access 토큰을 발급받습니다.
 */
export async function getRefreshToken() {
    try {
        const authData = loadAuth();
        const refresh = authData?.refresh;

        if (!refresh) {
            throw new Error('No refresh token available');
        }

        // 이 요청은 인터셉터를 타지 않도록 별도의 axios 인스턴스를 사용할 수 있지만,
        // 여기서는 baseURL만 사용하여 간단하게 처리합니다.
        const response = await axios.post('https://app.uniroom.shop/api/users/token/refresh/', {
            refresh: refresh,
        });

        const { access } = response.data;
        const newAuthData = { ...authData, access };

        // 새로운 정보로 로컬 스토리지 업데이트
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthData));

        return access;
    } catch (error) {
        // 리프레시 실패 시 기존 인증 정보 삭제
        clearAuth();
        throw error;
    }
}

export async function signUp({ username, email, password, password_confirm }) {
    try {
        const { data } = await api.post('/api/users/signup/', { username, email, password, password_confirm });
        setAuth(data.tokens, data.user);
        return data;
    } catch (error) {
        normalizeError(error);
    }
}

export async function login({ username, password }) {
    try {
        const { data } = await api.post('/api/users/login/', { username, password });
        // 로그인 시 tokens와 user 정보를 setAuth에 전달
        setAuth(data.tokens, data.user);
        return data;
    } catch (error) {
        normalizeError(error);
    }
}

export async function getMyInfo() {
    try {
        const { data } = await api.get('/api/users/me/');
        return data;
    } catch (error) {
        normalizeError(error);
    }
}

export async function getUserPublic(userId) {
    try {
        const { data } = await api.get(`/api/users/${userId}/`);
        return data;
    } catch (error) {
        return null;
    }
}

export default {
    signUp,
    login,
    loadAuth,
    clearAuth,
    getMyInfo,
    getUserPublic,
    getRefreshToken,
};
