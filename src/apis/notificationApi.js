// src/apis/notificationApi.js
import api from './api';
import { loadAuth } from './auth';

function normalizeError(error) {
    if (error?.response) {
        const { data, status } = error.response;
        const msgs = [];
        if (typeof data === 'string') msgs.push(data);
        if (data?.message) msgs.push(data.message);
        if (data?.detail) msgs.push(data.detail);
        if (data?.non_field_errors) msgs.push(data.non_field_errors.join(' '));
        if (data && typeof data === 'object') {
            Object.keys(data).forEach((k) => {
                if (Array.isArray(data[k]) && !['detail', 'non_field_errors', 'message'].includes(k)) {
                    msgs.push(`${k}: ${data[k].join(' ')}`);
                }
            });
        }
        throw new Error(msgs.join('\n') || `요청에 실패했습니다. (상태 코드: ${status})`);
    }
    throw new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
}

/** 읽지 않은 알림 목록 */
export async function fetchPopupNotifications() {
    const auth = loadAuth();
    if (!auth?.access) return []; // 비로그인 → 빈 배열
    try {
        const res = await api.get('/api/community/notifications/unread/');
        const data = res?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
    } catch (e) {
        normalizeError(e);
    }
}

/** 읽음 처리: { ids: number[] } */
export async function markNotificationsAsChecked(ids = []) {
    const auth = loadAuth();
    if (!auth?.access) return;
    try {
        await api.post('/api/community/notifications/read/', { ids });
    } catch (e) {
        normalizeError(e);
    }
}
