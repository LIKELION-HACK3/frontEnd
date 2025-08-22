import React from 'react';
import styles from './AiReportPage.module.css';

const AiReportResult = ({ data, hideHeader = false }) => {
    if (!data) return null;

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
        try {
            const lines = [];
            lines.push('[AI 요약]');
            if (data.analysis_summary) lines.push(data.analysis_summary);
            lines.push('');
            lines.push('[상세 비교]');
            if (data.detailed_comparison?.price_analysis) lines.push(`- ${data.detailed_comparison.price_analysis}`);
            if (data.detailed_comparison?.location_analysis) lines.push(`- ${data.detailed_comparison.location_analysis}`);
            if (data.detailed_comparison?.area_analysis) lines.push(`- ${data.detailed_comparison.area_analysis}`);
            lines.push('');
            lines.push(`[추천] ${data.recommendation === 'room_a' ? '방 A' : '방 B'}`);
            if (data.reasoning) lines.push(data.reasoning);
            await navigator.clipboard.writeText(lines.join('\n'));
            alert('요약이 복사되었습니다.');
        } catch (e) {
            console.error(e);
        }
    };

    const roomA = data.room_a || {};
    const roomB = data.room_b || {};

    return (
        <div className={styles.resultSection}>
            {!hideHeader && (
                <>
                    <h2 className={styles.resultTitle}>AI 비교 결과</h2>
                    <p className={styles.resultSubtitle}>유니룸의 AI 추천은 다음과 같아요.</p>
                </>
            )}

            <div className={styles.resultCard}>
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>추천 결과</h3>
                    <div className={styles.recommendationResult}>
                        <div className={styles.recommendationIcon}>🏠</div>
                        <div className={styles.recommendationTag}>
                            {data.recommendation === 'room_a' ? (
                                `월세 ${roomA.monthly_fee ? Math.round(roomA.monthly_fee / 10000) : 0}/${roomA.deposit ? Math.round(roomA.deposit / 10000) : 0} 관리비 ${roomA.maintenance_cost ?? '-'}만원 ${roomA.room_type ?? ''} ${roomA.floor ?? '-'}층 ${roomA.real_area ? Math.floor(roomA.real_area / 3.305785) : '-'}평`
                            ) : (
                                `월세 ${roomB.monthly_fee ? Math.round(roomB.monthly_fee / 10000) : 0}/${roomB.deposit ? Math.round(roomB.deposit / 10000) : 0} 관리비 ${roomB.maintenance_cost ?? '-'}만원 ${roomB.room_type ?? ''} ${roomB.floor ?? '-'}층 ${roomB.real_area ? Math.floor(roomB.real_area / 3.305785) : '-'}평`
                            )}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>AI 요약</h3>
                    <div className={styles.summaryText}>
                        {data.analysis_summary}
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>상세 비교</h3>
                    <div className={styles.comparisonNote}>
                        아래 표는 예시 형식입니다. 실제 결과는 입력과 모델 응답에 따라 달라질 수 있어요.
                    </div>
                    <div className={styles.comparisonTable}>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>방A</div>
                            <div className={styles.tableCell}>{roomA.real_area ? Math.floor(roomA.real_area / 3.305785) : '-'}평</div>
                            <div className={styles.tableCell}>{roomA.deposit ? `${Math.round(roomA.deposit / 10000)}만` : '-'}</div>
                            <div className={styles.tableCell}>{roomA.monthly_fee ? `${Math.round(roomA.monthly_fee / 10000)}만` : '-'}</div>
                            <div className={styles.tableCell}>{roomA.floor ?? '-'}</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>방B</div>
                            <div className={styles.tableCell}>{roomB.real_area ? Math.floor(roomB.real_area / 3.305785) : '-'}평</div>
                            <div className={styles.tableCell}>{roomB.deposit ? `${Math.round(roomB.deposit / 10000)}만` : '-'}</div>
                            <div className={styles.tableCell}>{roomB.monthly_fee ? `${Math.round(roomB.monthly_fee / 10000)}만` : '-'}</div>
                            <div className={styles.tableCell}>{roomB.floor ?? '-'}</div>
                        </div>
                    </div>
                    <div className={styles.comparisonSummary}>
                        {data.detailed_comparison?.summary || '요약 정보가 제공됩니다.'}
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>추천 이유</h3>
                    <div className={styles.reasoningText}>
                        {data.reasoning}
                    </div>
                </section>

                <div className={styles.actionsRow}>
                    <button className={styles.shareButton} onClick={handleShare}>공유하기</button>
                    <button className={styles.copyButton} onClick={handleCopySummary}>요약 복사하기</button>
                </div>
            </div>
        </div>
    );
};

export default AiReportResult;
