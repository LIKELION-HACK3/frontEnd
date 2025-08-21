import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './AiReportPage.module.css';
import { fetchAiReport } from '../../apis/aiApi';

const AiReportPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetchAiReport(id);
                if (mounted) setData(res);
            } catch (e) {
                if (mounted) setError(e.message || '불러오기에 실패했습니다.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    const handleShare = async () => {
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title: 'AI 비교 결과', url });
            } else {
                await navigator.clipboard.writeText(url);
                alert('링크가 복사되었습니다.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopySummary = async () => {
        const lines = [];
        lines.push('[AI 요약]');
        lines.push(data.analysis_summary);
        lines.push('');
        lines.push('[상세 비교]');
        if (data.detailed_comparison?.price_analysis) lines.push(`- ${data.detailed_comparison.price_analysis}`);
        if (data.detailed_comparison?.location_analysis) lines.push(`- ${data.detailed_comparison.location_analysis}`);
        if (data.detailed_comparison?.area_analysis) lines.push(`- ${data.detailed_comparison.area_analysis}`);
        lines.push('');
        lines.push(`[추천] ${data.recommendation === 'room_a' ? '방 A' : '방 B'}`);
        lines.push(data.reasoning);
        try {
            await navigator.clipboard.writeText(lines.join('\n'));
            alert('요약이 복사되었습니다.');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className={styles.container}>불러오는 중…</div>;
    if (error) return <div className={styles.container}>{error}</div>;
    if (!data) return <div className={styles.container}>데이터가 없습니다.</div>;

    const { room_a: roomA, room_b: roomB, analysis_summary, detailed_comparison, recommendation, reasoning } = data;

    return (
        <div className={styles.container}>
            <h1 className={styles.mainTitle}>AI 비교 결과</h1>
            <p className={styles.subtitle}>유니룸의 AI 추천은 다음과 같아요.</p>

            <div className={styles.resultCard}>
                {/* 추천 결과 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>추천 결과</h2>
                    <div className={styles.recommendationResult}>
                        <div className={styles.recommendationIcon}>🏠</div>
                        <div className={styles.recommendationTag}>
                            {recommendation === 'room_a' ? (
                                `월세 ${roomA.monthly_fee ? (roomA.monthly_fee / 10000).toFixed(0) : 0}/70 관리비 8만원 원룸 2층 4.8평`
                            ) : (
                                `월세 ${roomB.monthly_fee ? (roomB.monthly_fee / 10000).toFixed(0) : 0}/70 관리비 8만원 원룸 2층 4.8평`
                            )}
                        </div>
                    </div>
                </section>

                {/* AI 요약 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>AI 요약</h2>
                    <div className={styles.summaryText}>
                        {analysis_summary}
                    </div>
                </section>

                {/* 상세 비교 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>상세 비교</h2>
                    <div className={styles.comparisonNote}>
                        제시해주신 데이터 예시에서 표가 생성된것도 보이던데 이 부분은 지피티에서 자체 생성을 해주는거겠죠..? 아래는 표 대신 임의로 넣어둔 것입니다.
                    </div>
                    <div className={styles.comparisonTable}>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>방A</div>
                            <div className={styles.tableCell}>10평</div>
                            <div className={styles.tableCell}>500만원</div>
                            <div className={styles.tableCell}>10평</div>
                            <div className={styles.tableCell}>500만원</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>방B</div>
                            <div className={styles.tableCell}>8평</div>
                            <div className={styles.tableCell}>480만원</div>
                            <div className={styles.tableCell}>8평</div>
                            <div className={styles.tableCell}>480만원</div>
                        </div>
                    </div>
                    <div className={styles.comparisonSummary}>
                        방 A가 방 B보다 더 많은 자연광을 제공합니다. 방 A가 방 B보다 더 많은 자연광을 제공합니다.
                    </div>
                </section>

                {/* 추천 이유 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>추천 이유</h2>
                    <div className={styles.reasoningText}>
                        {reasoning}
                    </div>
                </section>

                {/* 액션 버튼 */}
                <div className={styles.actionsRow}>
                    <button className={styles.shareButton} onClick={handleShare}>
                        공유하기
                    </button>
                    <button className={styles.copyButton} onClick={handleCopySummary}>
                        요약 복사하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiReportPage;
