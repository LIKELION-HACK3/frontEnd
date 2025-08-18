import api from './api';

const STORAGE_KEY = 'uniroom_auth';

/**
 * 서버 응답 데이터에서 토큰을 올바르게 추출하여 저장하고,
 * axios의 기본 헤더에 인증 토큰을 설정합니다.
 */
function setAuth(data) {
    // 서버 응답에 'tokens' 객체가 있거나, 토큰이 최상위에 있는 경우 모두 처리
    const accessToken = data?.tokens?.access || data?.access;
    const refreshToken = data?.tokens?.refresh || data?.refresh;

    if (accessToken) {
        // axios 기본 헤더에 인증 토큰 설정
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    // 로컬 스토리지에 인증 정보 저장
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            access: accessToken || null,
            refresh: refreshToken || null,
            user: data?.user || null,
        })
    );
}

/**
 * 저장된 인증 정보를 로드하고, axios 기본 헤더를 설정합니다.
 * 페이지가 새로고침될 때마다 호출됩니다.
 */
export function loadAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const saved = JSON.parse(raw);
        if (saved?.access) {
            api.defaults.headers.common['Authorization'] = `Bearer ${saved.access}`;
        }
        return saved;
    } catch {
        return null;
    }
}

/* 로그아웃 시 인증 정보 제거 */
export function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
}

/* API 에러 메시지 정규화 */
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
        return data;
    } catch (error) {
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
        return data;
    } catch (error) {
        normalizeError(error);
    }
}

export default {
    signUp,
    login,
    loadAuth,
    clearAuth,
};
