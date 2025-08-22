import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AiReportPage.module.css';
import { listAiReports } from '../../apis/aiApi';

const AiHistoryItem = ({ item, onClick }) => {
    const isA = item.recommendation === 'room_a';
    const recRoom = isA ? item.room_a : item.room_b;
    return (
        <div className={styles.resultCard} onClick={onClick} role="button" tabIndex={0}
             onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>추천</h2>
                <div className={styles.recommendationResult}>
                    <div className={styles.recommendationIcon}>🤖</div>
                    <div className={styles.recommendationTag}>
                        {recRoom?.title || (isA ? '방 A' : '방 B')}
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>AI 요약</h2>
                <div className={styles.summaryText}>{item.analysis_summary}</div>
            </section>
        </div>
    );
};

const AiHistoryPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await listAiReports(page, 10);
                if (!mounted) return;
                setItems(data.results || []);
                setHasMore(Boolean(data.next));
            } catch (e) {
                if (!mounted) return;
                setError(e.message || 'AI 히스토리를 불러오지 못했습니다.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [page]);

    const openDetail = (id) => navigate(`/report/${id}`);

    return (
        <div className={styles.container}>
            <h1 className={styles.mainTitle}>AI 히스토리</h1>
            <p className={styles.subtitle}>최근 생성한 AI 리포트를 확인하세요.</p>
            {loading && <div>불러오는 중…</div>}
            {error && <div>{error}</div>}
            {!loading && !error && items.length === 0 && (
                <div>생성된 리포트가 없습니다.</div>
            )}
            {!loading && !error && items.map((it) => (
                <div key={it.id} style={{ marginBottom: 24 }}>
                    <AiHistoryItem item={it} onClick={() => openDetail(it.id)} />
                </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <button className={styles.shareButton} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
                <button className={styles.copyButton} onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>다음</button>
            </div>
        </div>
    );
};

export default AiHistoryPage;


