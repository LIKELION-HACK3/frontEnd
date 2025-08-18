import api from './api';

const STORAGE_KEY = 'uniroom_auth';

/* 토큰, 유저 저장 */
function setAuth(data) {
    const tokens = data?.tokens || {};

    if (tokens.access) {
        api.defaults.headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            access: tokens.access || null,
            refresh: tokens.refresh || null,
            user: data?.user || null,
        })
    );
}

/* 저장된 토큰 로드 */
export function loadAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const saved = JSON.parse(raw);
        if (saved?.access) {
            api.defaults.headers['Authorization'] = `Bearer ${saved.access}`;
        }
        return saved;
    } catch {
        return null;
    }
}

/* 로그아웃 */
export function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers['Authorization'];
}

/* 에러 메시지 정리 */
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

        throw new Error(msgs.join(' ') || `Request failed (${status})`);
    }

    throw new Error('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
}

/* 회원가입 */
export async function signUp({ username, email, password, password_confirm }) {
    try {
        const { data } = await api.post('/api/users/signup/', {
            username,
            email,
            password,
            password_confirm,
        });

        setAuth(data);
        console.log('[auth.signUp] SUCCESS:', data?.user || data);
        return data;
    } catch (error) {
        console.error('[auth.signUp] FAIL:', error?.response?.data || error);
        normalizeError(error);
    }
}

/* 로그인 */
export async function login({ username, password }) {
    try {
        const { data } = await api.post('/api/users/login/', {
            username,
            password,
        });

        setAuth(data);
        console.log('[auth.login] SUCCESS:', data?.user || data);
        return data;
    } catch (error) {
        console.error('[auth.login] FAIL:', error?.response?.data || error);
        normalizeError(error);
    }
}

export default {
    signUp,
    login,
    loadAuth,
    clearAuth,
};
