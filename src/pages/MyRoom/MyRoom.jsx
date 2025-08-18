import React, { useEffect, useMemo, useState } from 'react';
import styles from './MyRoom.module.css';
import FavoriteHeart from './FavoriteHeart';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';

// '만원' 단위 변환 함수 (보증금, 월세용)
const formatPriceSimple = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num >= 10000) {
        return (num / 10000).toLocaleString();
    }
    return num;
};

// '만원' 단위 변환 함수 (관리비용)
const formatManwon = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num >= 10000) {
        return `${(num / 10000).toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
};

// 면적을 '평'으로 변환하는 함수
const toPyeong = (sqm) => {
    const n = Number(sqm);
    return Number.isFinite(n) ? `${Math.round(n / 3.305785)}평` : '-';
};

const MyPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [favoriteRoomIds, setFavoriteRoomIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(new Set());

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

    const rooms = useMemo(() => bookmarks.map((bm) => bm.room).filter(Boolean), [bookmarks]);

    const onToggle = async (roomId) => {
        if (toggling.has(roomId)) return;
        setToggling(new Set(toggling).add(roomId));

        try {
            const optimistic = new Set(favoriteRoomIds);
            if (optimistic.has(roomId)) optimistic.delete(roomId);
            else optimistic.add(roomId);
            setFavoriteRoomIds(optimistic);

            await toggleBookmark(roomId);
            await loadBookmarks();
        } catch (e) {
            console.error(e);
            alert(e.message || '찜 처리에 실패했습니다.');
            await loadBookmarks();
        } finally {
            const done = new Set(toggling);
            done.delete(roomId);
            setToggling(done);
        }
    };

    return (
        <div className={styles.myPage}>
            <div className={styles.topHeader}>
                <h1 className={styles.title}>MY 룸 목록</h1>
                <p className={styles.subtitle}>관심 있는 집들을 한번에 확인해보세요.</p>
            </div>

            <div className={styles.section}>
                {loading ? (
                    <p className={styles.subtitle}>불러오는 중…</p>
                ) : rooms.length === 0 ? (
                    <p className={styles.subtitle}>아직 찜한 집이 없어요.</p>
                ) : (
                    <div className={styles.propertyGrid}>
                        {rooms.map((room) => {
                            const priceMain =
                                room.contract_type === '전세'
                                    ? `전세 ${formatPriceSimple(room.deposit)}`
                                    : `월세 ${formatPriceSimple(room.deposit)}/${formatPriceSimple(room.monthly_fee)}`;

                            return (
                                <div key={room.id} className={styles.cardWrapper}>
                                    <div className={styles.propertyCard}>
                                        <img src={room.thumbnail_url} alt={room.title} className={styles.cardImage} />
                                        <div className={styles.cardBody}>
                                            <div className={styles.heartWrapper}>
                                                <FavoriteHeart
                                                    filled={favoriteRoomIds.has(room.id)}
                                                    onToggle={() => onToggle(room.id)}
                                                />
                                            </div>
                                            <p className={styles.priceMain}>{priceMain}</p>
                                            <p className={styles.maintenanceFee}>
                                                관리비 {formatManwon(room.maintenance_cost)}
                                            </p>
                                            <p className={styles.roomDetails}>
                                                {room.room_type} · {room.floor} · {toPyeong(room.real_area)}
                                            </p>
                                            <p className={styles.description}>{room.title}</p>
                                        </div>
                                    </div>
                                    <button className={styles.selectButton}>AI 리포트 선택</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 하단 섹션 */}
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
                                        <p className={styles.reportTitle}>{room.title}</p>
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
