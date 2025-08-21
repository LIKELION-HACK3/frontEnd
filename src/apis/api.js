import axios from 'axios';
import { clearAuth, getRefreshToken, loadAuth } from './auth';

const api = axios.create({
    baseURL: 'https://app.uniroom.shop/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 모든 API 요청에 인증 토큰을 자동으로 추가합니다.
api.interceptors.request.use(
    (config) => {
        const auth = loadAuth();
        if (auth?.access) {
            config.headers['Authorization'] = `Bearer ${auth.access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 토큰 갱신 중 다른 API 요청이 동시에 발생했을 때를 대비한 변수와 함수들입니다.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 응답 인터셉터: API 응답을 받았을 때의 공통 로직을 처리합니다.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 오류가 발생했고, 이 요청이 재시도된 요청이 아닐 경우 토큰 갱신을 시도합니다.
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 이미 토큰 갱신이 진행 중이라면, 이 요청은 대기열에 추가합니다.
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest); // 갱신된 토큰으로 재요청
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true; // 재시도 요청임을 표시
            isRefreshing = true;

            try {
                // 새로운 액세스 토큰을 요청합니다.
                const newAccessToken = await getRefreshToken();
                if (newAccessToken) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // 대기열에 있던 모든 요청을 새로운 토큰으로 실행합니다.
                    processQueue(null, newAccessToken);

                    // 원래 실패했던 요청을 새로운 토큰으로 다시 실행합니다.
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // 리프레시 토큰마저 만료되어 갱신에 실패하면 로그아웃 처리합니다.
                processQueue(refreshError, null);
                clearAuth();
                // 필요하다면 로그인 페이지로 리디렉션할 수 있습니다.
                // window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
