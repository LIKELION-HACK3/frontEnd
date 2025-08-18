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
