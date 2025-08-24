import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './AiReportPage.module.css';
import { fetchAiReport } from '../../apis/aiApi';
import { fetchRooms } from '../../apis/roomsApi';

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
                if (!mounted) return;

                // 리포트 생성 시점과 실제 방 정보가 달라질 수 있으므로, 최신 방 데이터로 보정
                try {
                    const [aId, bId] = [res?.room_a?.id, res?.room_b?.id].filter(Boolean);
                    if (aId || bId) {
                        const roomsRes = await fetchRooms({ id__in: [aId, bId].filter(Boolean).join(',') });
                        const list = Array.isArray(roomsRes?.results) ? roomsRes.results : Array.isArray(roomsRes) ? roomsRes : [];
                        const byId = Object.fromEntries(list.map((r) => [r.id, r]));
                        const merged = {
                            ...res,
                            room_a: byId[res?.room_a?.id] ? { ...res.room_a, ...byId[res.room_a.id] } : res.room_a,
                            room_b: byId[res?.room_b?.id] ? { ...res.room_b, ...byId[res.room_b.id] } : res.room_b,
                        };
                        setData(merged);
                    } else {
                        setData(res);
                    }
                } catch (mergeErr) {
                    // 최신 방 조회 실패 시 원본 데이터라도 표시
                    console.warn('최신 방 데이터 병합 실패:', mergeErr);
                    setData(res);
                }
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

    const formatManWon = (value) => {
        if (value == null) return '-';
        const n = Number(value);
        if (!Number.isFinite(n)) return String(value);
        const man = Math.round(n / 10000);
        return `${man.toLocaleString()}만원`;
    };

    const makeRecLabel = (room) => {
        if (!room) return '';
        const feeText = formatManWon(room?.monthly_fee);
        const deposit = room?.deposit;
        const hasDeposit = deposit != null && Number.isFinite(Number(deposit));
        const priceText = hasDeposit ? `${formatManWon(deposit)}/${feeText}` : `월세 ${feeText}`;
        const typeText = room?.room_type ? room.room_type : '';
        const addrText = room?.address ? room.address : '';
        return [priceText, typeText, addrText].filter(Boolean).join(' · ');
    };

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
                            {recommendation === 'room_a' ? makeRecLabel(roomA) : makeRecLabel(roomB)}
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

                {/* 상세 비교 (백엔드 데이터 사용) */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>상세 비교</h2>
                    <div className={styles.comparisonTable}>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}><strong>항목</strong></div>
                            <div className={styles.tableCell}><strong>방 A</strong></div>
                            <div className={styles.tableCell}><strong>방 B</strong></div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>제목</div>
                            <div className={styles.tableCell}>{roomA?.title ?? '-'}</div>
                            <div className={styles.tableCell}>{roomB?.title ?? '-'}</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>유형</div>
                            <div className={styles.tableCell}>{roomA?.room_type ?? '-'}</div>
                            <div className={styles.tableCell}>{roomB?.room_type ?? '-'}</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>월세</div>
                            <div className={styles.tableCell}>{formatManWon(roomA?.monthly_fee)}</div>
                            <div className={styles.tableCell}>{formatManWon(roomB?.monthly_fee)}</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>주소</div>
                            <div className={styles.tableCell}>{roomA?.address ?? '-'}</div>
                            <div className={styles.tableCell}>{roomB?.address ?? '-'}</div>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>추천</div>
                            <div className={styles.tableCell}>{recommendation === 'room_a' ? '✅ 추천' : '-'}</div>
                            <div className={styles.tableCell}>{recommendation === 'room_b' ? '✅ 추천' : '-'}</div>
                        </div>
                    </div>
                    {(detailed_comparison && (
                        detailed_comparison.price_analysis ||
                        detailed_comparison.location_analysis ||
                        detailed_comparison.area_analysis
                    )) && (
                        <div className={styles.comparisonSummary}>
                            {detailed_comparison.price_analysis && (
                                <p><strong>가격 분석:</strong> {detailed_comparison.price_analysis}</p>
                            )}
                            {detailed_comparison.location_analysis && (
                                <p><strong>위치 분석:</strong> {detailed_comparison.location_analysis}</p>
                            )}
                            {detailed_comparison.area_analysis && (
                                <p><strong>면적 분석:</strong> {detailed_comparison.area_analysis}</p>
                            )}
                        </div>
                    )}
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
