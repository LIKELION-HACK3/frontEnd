import api from './api';
import { loadAuth } from './auth';

// 인증 헤더를 가져오는 헬퍼 함수
function getAuthHeaders() {
    const auth = loadAuth();
    if (auth && auth.access) {
        return { Authorization: `Bearer ${auth.access}` };
    }
    throw new Error('AI 리포트 기능은 로그인이 필요합니다.');
}

/**
 * AI 방 비교 분석을 요청합니다. (POST /api/ai/compare/)
 * @param {object} analysisData - 리포트 생성에 필요한 데이터
 * @returns {Promise<object>} 생성된 리포트 데이터
 */
export async function createAiReport(analysisData) {
    try {
        const response = await api.post('/api/ai/compare/', analysisData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('AI 리포트 생성 실패:', error.response || error);
        throw new Error(error.response?.data?.detail || 'AI 리포트 생성에 실패했습니다.');
    }
}

/**
 * 특정 AI 리포트 상세 정보를 가져옵니다. (GET /api/ai/reports/{report_id}/)
 * @param {string} reportId - 리포트 ID
 * @returns {Promise<object>} 리포트 상세 데이터
 */
export async function fetchAiReport(reportId) {
    try {
        const response = await api.get(`/api/ai/reports/${reportId}/`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('AI 리포트 조회 실패:', error.response || error);
        throw new Error(error.response?.data?.detail || 'AI 리포트 조회에 실패했습니다.');
    }
}

/**
 * AI 리포트 목록을 페이징으로 가져옵니다. (GET /api/ai/reports/)
 * @param {number} page - 페이지 번호 (1부터)
 * @param {number} pageSize - 페이지 크기
 * @returns {Promise<{results: object[], count: number, next?: string, previous?: string}>}
 */
export async function listAiReports(page = 1, pageSize = 10) {
    const normalize = (data) => {
        // 1) { results: [...] } 형태
        if (Array.isArray(data?.results)) {
            return { results: data.results, count: data.count ?? data.results.length, next: data.next, previous: data.previous };
        }
        // 2) [...] 배열 형태
        if (Array.isArray(data)) {
            const arr = Array.isArray(data[0]) && data.length === 1 ? data[0] : data;
            return { results: arr, count: arr.length, next: undefined, previous: undefined };
        }
        // 3) 알 수 없는 형태 → 빈 목록
        return { results: [], count: 0, next: undefined, previous: undefined };
    };

    try {
        // 명세: GET /api/ai/history → [[ {...}, {...} ]]
        const response = await api.get(`/api/ai/history`, {
            headers: getAuthHeaders(),
        });
        return normalize(response.data);
    } catch (error) {
        // 호환: 구(또는 대체) 엔드포인트로 재시도
        try {
            const response2 = await api.get(`/api/ai/reports/`, {
                headers: getAuthHeaders(),
            });
            return normalize(response2.data);
        } catch (e2) {
            console.error('AI 리포트 목록 조회 실패:', (error.response || error), ' / 재시도 실패:', (e2.response || e2));
            throw new Error(e2.response?.data?.detail || error.response?.data?.detail || 'AI 리포트 목록 조회에 실패했습니다.');
        }
    }
}