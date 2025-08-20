import axios from 'axios';
import { clearAuth, getRefreshToken, setAuth } from './auth';

const api = axios.create({
    baseURL: 'https://app.uniroom.shop/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. 요청 인터셉터: 모든 요청에 Access Token을 자동으로 추가합니다.
api.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('uniroom_auth');
        if (authData) {
            const { access } = JSON.parse(authData);
            if (access) {
                config.headers['Authorization'] = `Bearer ${access}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. 응답 인터셉터: API 요청이 실패했을 때 (주로 토큰 만료) 자동으로 처리합니다.
api.interceptors.response.use(
    // 성공적인 응답은 그대로 반환
    (response) => {
        return response;
    },
    // 에러 응답 처리
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고, 재시도한 요청이 아닐 경우에만 토큰 갱신 시도
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 설정

            try {
                const newAccessToken = await getRefreshToken();
                // 새 토큰으로 원래 요청의 헤더를 교체
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // 원래 요청을 다시 시도
                return api(originalRequest);
            } catch (refreshError) {
                // 리프레쉬 토큰마저 만료된 경우
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                clearAuth(); // 저장된 인증 정보 삭제
                window.location.href = '/login'; // 로그인 페이지로 이동
                return Promise.reject(refreshError);
            }
        }

        // 401 에러가 아니거나, 재시도 요청인 경우 에러를 그대로 반환
        return Promise.reject(error);
    }
);

export default api;
