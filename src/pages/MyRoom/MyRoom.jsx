import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyRoom.module.css';
import FavoriteHeart from './FavoriteHeart';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';
import { createAiReport } from '../../apis/aiApi';
import { Star } from 'lucide-react';

// Helper functions (formatPriceSimple, formatManwon, toPyeong) remain the same
const formatPriceSimple = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num >= 10000) {
        return (num / 10000).toLocaleString();
    }
    return num;
};

const formatManwon = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num >= 10000) {
        return `${(num / 10000).toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
};

const toPyeong = (sqm) => {
    const n = Number(sqm);
    return Number.isFinite(n) ? `${Math.round(n / 3.305785)}평` : '-';
};

const MyRoom = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [favoriteRoomIds, setFavoriteRoomIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(new Set());

    const [selectedForReport, setSelectedForReport] = useState([null, null]);
    const [additionalCriteria, setAdditionalCriteria] = useState('지도');
    const [weights, setWeights] = useState({
        price: 3,
        location: 3,
        area: 3,
    });
    const [userPreference, setUserPreference] = useState('가격이 중요하고, 교통편이 좋았으면 좋겠어요');
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleSelectForReport = (room) => {
        setSelectedForReport((prev) => {
            if (prev.some((r) => r?.id === room.id)) {
                return prev.map((r) => (r?.id === room.id ? null : r));
            }
            const emptyIndex = prev.indexOf(null);
            if (emptyIndex !== -1) {
                const newSelection = [...prev];
                newSelection[emptyIndex] = room;
                return newSelection;
            }
            alert('최대 2개의 집만 선택할 수 있습니다.');
            return prev;
        });
    };

    const handleWeightChange = (key, value) => {
        setWeights((prev) => ({ ...prev, [key]: value }));
    };

    const renderStars = (ratingKey) => (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={star <= weights[ratingKey] ? styles.filledStar : styles.emptyStar}
                    onClick={() => handleWeightChange(ratingKey, star)}
                />
            ))}
        </div>
    );

    const handleGenerateReport = async () => {
        if (selectedForReport.includes(null)) {
            alert('비교할 집 2개를 모두 선택해주세요.');
            return;
        }

        const totalWeight = weights.price + weights.location + weights.area;
        if (totalWeight === 0) {
            alert('가중치를 하나 이상 설정해주세요.');
            return;
        }

        setIsGenerating(true);

        // ✅ API 명세에 맞게 가중치 계산 로직을 수정했습니다.
        // 각 별점을 전체 별점의 합으로 나누어 0과 1 사이의 값으로 정규화합니다.
        const apiData = {
            room_a_id: selectedForReport[0].id,
            room_b_id: selectedForReport[1].id,
            comparison_criteria: {
                price_weight: weights.price / totalWeight,
                location_weight: weights.location / totalWeight,
                area_weight: weights.area / totalWeight,
            },
            user_preferences: userPreference,
        };

        try {
            const reportResult = await createAiReport(apiData);
            const reportId = reportResult.id;
            if (reportId) {
                navigate(`/report/${reportId}`);
            } else {
                console.error("Received data doesn't contain a report ID:", reportResult);
                alert('리포트 ID를 받지 못했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsGenerating(false);
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
                            const isSelected = selectedForReport.some((r) => r?.id === room.id);
                            return (
                                <div key={room.id} className={styles.cardWrapper}>
                                    <div className={styles.propertyCard}>
                                        <img
                                            src={room.thumbnail_url || 'https://via.placeholder.com/160'}
                                            alt={room.title}
                                            className={styles.cardImage}
                                        />
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
                                    <button
                                        className={`${styles.selectButton} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handleSelectForReport(room)}
                                    >
                                        {isSelected ? '✓ 선택됨' : 'AI 리포트 선택'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className={`${styles.section} ${styles.aiSectionWrapper}`}>
                <div className={styles.aiSection}>
                    <div className={styles.aiLeft}>
                        <h1 className={styles.title}>AI 리포트 받아보기</h1>
                        <p className={styles.subtitle}>2개의 집을 골라 AI에게 분석을 맡겨보세요.</p>
                        <div className={styles.reportSelectionGrid}>
                            {[0, 1].map((index) => (
                                <div key={index} className={styles.reportSelectionCard}>
                                    <p className={styles.selectionTitle}>선택{index + 1}</p>
                                    {selectedForReport[index] ? (
                                        <div className={styles.selectedRoomInfo}>
                                            <img
                                                src={
                                                    selectedForReport[index].thumbnail_url ||
                                                    'https://via.placeholder.com/80'
                                                }
                                                alt={selectedForReport[index].title}
                                                className={styles.selectedRoomImage}
                                            />
                                            <div className={styles.selectedRoomText}>
                                                <p className={styles.selectedRoomPrice}>
                                                    {selectedForReport[index].contract_type === '전세'
                                                        ? `전세 ${formatPriceSimple(selectedForReport[index].deposit)}`
                                                        : `월세 ${formatPriceSimple(
                                                              selectedForReport[index].deposit
                                                          )}/${formatPriceSimple(
                                                              selectedForReport[index].monthly_fee
                                                          )}`}
                                                </p>
                                                <p className={styles.selectedRoomTitle}>
                                                    {selectedForReport[index].address}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.emptySelection}>
                                            <p>선택된 집이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.aiRight}>
                        <div className={styles.criteriaGroup}>
                            <h4 className={styles.groupTitle}>추가 기준</h4>
                            <div className={styles.radioGroup}>
                                {['지도', '편의시설', '보안', '층수'].map((item) => (
                                    <label key={item} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="criteria"
                                            value={item}
                                            checked={additionalCriteria === item}
                                            onChange={(e) => setAdditionalCriteria(e.target.value)}
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={styles.criteriaGroup}>
                            <h4 className={styles.groupTitle}>가중치 설정</h4>
                            <div className={styles.weightGroup}>
                                <div className={styles.weightItem}>
                                    <span>가격</span>
                                    {renderStars('price')}
                                </div>
                                <div className={styles.weightItem}>
                                    <span>위치</span>
                                    {renderStars('location')}
                                </div>
                                <div className={styles.weightItem}>
                                    <span>면적</span>
                                    {renderStars('area')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.preferenceSection}>
                    <h4 className={styles.groupTitle}>사용자 선호 입력</h4>
                    <textarea
                        className={styles.preferenceTextarea}
                        value={userPreference}
                        onChange={(e) => setUserPreference(e.target.value)}
                        placeholder="중요하게 생각하는 점이나 특별한 요청사항을 자유롭게 작성해주세요."
                    />
                </div>
                <button className={styles.generateButton} onClick={handleGenerateReport} disabled={isGenerating}>
                    {isGenerating ? '리포트 생성 중...' : 'AI 리포트 생성하기'}
                </button>
            </div>
        </div>
    );
};

export default MyRoom;
