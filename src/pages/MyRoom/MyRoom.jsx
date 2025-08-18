import React, { useEffect, useMemo, useState } from 'react';
import styles from './MyRoom.module.css';
import FavoriteHeart from './FavoriteHeart';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';

// ✅ 금액을 '억'과 '만원' 단위로 변환하는 함수 추가
const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num === 0) return '0원';

    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        if (man > 0) {
            return `${eok}억 ${man.toLocaleString()}만원`;
        }
        return `${eok}억`;
    }

    if (num >= 10000) {
        return `${(num / 10000).toLocaleString()}만원`;
    }

    return `${num.toLocaleString()}원`;
};

const MyPage = () => {
    const [bookmarks, setBookmarks] = useState([]); // [{id, room:{...}, created_at}]
    const [favoriteRoomIds, setFavoriteRoomIds] = useState(new Set()); // room.id 집합
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(new Set()); // 토글 중 표시용(중복 클릭 방지)

    // 서버에서 북마크 로드
    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const list = await fetchAllBookmarks();
            setBookmarks(list);
            setFavoriteRoomIds(new Set(list.map((bm) => bm?.room?.id).filter((id) => id !== null && id !== undefined)));
        } catch (e) {
            console.error(e);
            alert(e.message || '북마크를 불러오지 못했습니다.');
            setBookmarks([]);
            setFavoriteRoomIds(new Set());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookmarks();
    }, []);

    // 화면에 사용할 room 배열
    const rooms = useMemo(() => bookmarks.map((bm) => bm.room).filter(Boolean), [bookmarks]);

    // 하트 토글: 서버 호출 → 재조회
    const onToggle = async (roomId) => {
        if (toggling.has(roomId)) return; // 중복 클릭 방지
        const next = new Set(toggling);
        next.add(roomId);
        setToggling(next);

        try {
            // 낙관적 UI(살짝) – 먼저 토글 표시
            const optimistic = new Set(favoriteRoomIds);
            if (optimistic.has(roomId)) optimistic.delete(roomId);
            else optimistic.add(roomId);
            setFavoriteRoomIds(optimistic);

            // 서버 토글
            await toggleBookmark(roomId);

            // 서버 상태로 재동기화
            await loadBookmarks();
        } catch (e) {
            console.error(e);
            alert(e.message || '찜 처리에 실패했습니다.');
            // 실패 시 전면 재동기화
            await loadBookmarks();
        } finally {
            const done = new Set(toggling);
            done.delete(roomId);
            setToggling(done);
        }
    };

    return (
        <div className={styles.myPage}>
            {/* 상단 제목 영역 */}
            <div className={styles.topHeader}>
                <h1 className={styles.title}>MY 룸 목록</h1>
                <p className={styles.subtitle}>관심 있는 집들을 한번에 확인해보세요.</p>
            </div>

            {/* 카드 리스트: 서버 북마크 기반 */}
            <div className={styles.section}>
                {loading ? (
                    <p className={styles.subtitle}>불러오는 중…</p>
                ) : rooms.length === 0 ? (
                    <p className={styles.subtitle}>아직 찜한 집이 없어요.</p>
                ) : (
                    <div className={styles.propertyGrid}>
                        {rooms.map((room) => (
                            <div key={room.id} className={styles.cardWrapper}>
                                <div className={styles.propertyCard}>
                                    <img src={room.thumbnail_url} alt={room.title} className={styles.cardImage} />

                                    {/* 하트: 서버 토글 */}
                                    <FavoriteHeart
                                        filled={favoriteRoomIds.has(room.id)}
                                        onToggle={() => onToggle(room.id)}
                                    />

                                    <div className={styles.cardBody}>
                                        <p className={styles.cardTitle}>{room.price_label ?? room.title}</p>
                                        <p className={styles.cardType}>{room.address}</p>
                                        {/* ✅ 금액 표시 부분을 formatPrice 함수로 감싸줍니다. */}
                                        <pre className={styles.cardDetails}>
                                            보증금 {formatPrice(room.deposit)} / 월세 {formatPrice(room.monthly_fee)}
                                            {'\n'}관리비 {formatPrice(room.maintenance_cost)}
                                        </pre>
                                    </div>
                                </div>

                                <button className={styles.selectButton}>AI 리포트 선택</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 하단: MY 찜 목록(같은 데이터의 요약 카드) */}
            <div className={`${styles.section} ${styles.aiSectionWrapper}`}>
                <div className={styles.aiSection}>
                    <div className={styles.aiLeft}>
                        <h1 className={styles.title}>MY 찜 목록</h1>
                        <p className={styles.subtitle}>하트를 누르면 추가/해제되고, 여기에서 바로 확인됩니다.</p>
                    </div>

                    <div className={styles.aiRight}>
                        {rooms.length === 0 ? (
                            <p className={styles.subtitle}>선택된 찜이 없습니다.</p>
                        ) : (
                            rooms.map((room) => (
                                <div key={room.id} className={styles.reportCard}>
                                    <img src={room.thumbnail_url} alt={room.title} className={styles.reportImage} />
                                    <div className={styles.reportText}>
                                        <p className={styles.reportLabel}>찜</p>
                                        <p className={styles.reportTitle}>{room.price_label ?? room.title}</p>
                                        <p className={styles.reportDetail}>{room.address}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
