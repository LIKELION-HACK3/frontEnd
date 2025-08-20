import React, { useEffect, useState } from 'react';
import styles from './DetailPage.module.css';
import { useParams } from 'react-router-dom';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { createReview, fetchReviewsForRoom, fetchReviewStats } from '../../apis/roomsApi';

import leftArrow from '../../assets/pic/left_arrow.svg';
import rightArrow from '../../assets/pic/right_arrow.svg';
import stairsIcon from '../../assets/pic/property_stairs.svg';
import locationIcon from '../../assets/pic/property_location.svg';
import moneyIcon from '../../assets/pic/property_money.svg';
import roomsIcon from '../../assets/pic/property_rooms.svg';
import sunIcon from '../../assets/pic/detail_sun.svg';
import muteIcon from '../../assets/pic/detail_mute.svg';
import bugIcon from '../../assets/pic/detail_bug.svg';
import shieldIcon from '../../assets/pic/detail_shield.svg';
import trainIcon from '../../assets/pic/detail_train.svg';

const toMan = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return Math.round(n / 10000).toLocaleString();
};

// 금액을 '억'과 '만원' 단위로 변환하는 함수
const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === '') return '-';
    if (num === 0) return '0';

    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        if (man > 0) {
            return `${eok}억 ${man.toLocaleString()}`;
        }
        return `${eok}억`;
    }

    if (num >= 10000) return `${(num / 10000).toLocaleString()}`;

    return `${num.toLocaleString()}원`;
};

const DetailPage = () => {
    const { id } = useParams();
    const [propertyData, setPropertyData] = useState(null);
    const [startIndex, setStartIndex] = useState(0);

    // 평점과 리뷰를 위한 state
    const [ratingStats, setRatingStats] = useState(null);
    const [reviews, setReviews] = useState([]);

    const [newReviewContent, setNewReviewContent] = useState('');
    const [ratings, setRatings] = useState({
        rating_safety: 0,
        rating_noise: 0,
        rating_light: 0,
        rating_traffic: 0,
        rating_bug: 0,
    });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const ratingCategories = {
        light: { label: '채광', icon: <img src={sunIcon} alt="채광" className={styles.icon} /> },
        noise: { label: '방음', icon: <img src={muteIcon} alt="방음" className={styles.icon} /> },
        bug: { label: '벌레', icon: <img src={bugIcon} alt="벌레" className={styles.icon} /> },
        safety: { label: '보안', icon: <img src={shieldIcon} alt="보안" className={styles.icon} /> },
        traffic: { label: '교통', icon: <img src={trainIcon} alt="교통" className={styles.icon} /> },
    };

    const newReviewRatingCategories = {
        rating_light:   { label: '채광', icon: <img src={sunIcon} alt="채광" className={styles.icon} /> },
        rating_noise:   { label: '방음', icon: <img src={muteIcon} alt="방음" className={styles.icon} /> },
        rating_bug:     { label: '벌레', icon: <img src={bugIcon} alt="벌레" className={styles.icon} /> },
        rating_safety:  { label: '보안', icon: <img src={shieldIcon} alt="보안" className={styles.icon} /> },
        rating_traffic: { label: '교통', icon: <img src={trainIcon} alt="교통" className={styles.icon} /> },
    };

    useEffect(() => {
        if (!id) return;

        const loadAllData = async () => {
            try {
                const propData = await fetch(`https://www.uniroom.shop/api/rooms/${id}/`).then((res) => res.json());
                setPropertyData(propData);
            } catch (e) {
                console.error('방 정보를 불러오는데 실패했습니다:', e);
            }

            try {
                const reviewData = await fetchReviewsForRoom(id);
                setReviews(reviewData || []);
            } catch (e) {
                console.error('리뷰 목록을 불러오는데 실패했습니다:', e);
            }

            try {
                const statsData = await fetchReviewStats(id);
                setRatingStats(statsData);
            } catch (e) {
                console.error('평점 통계를 불러오는데 실패했습니다:', e);
            }
        };

        loadAllData();
    }, [id]);

    const handleRatingChange = (key, value) => {
        setRatings((prev) => ({ ...prev, [key]: value }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReviewContent.trim()) {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }
        try {
            const reviewData = { ...ratings, content: newReviewContent, room: parseInt(id, 10) };
            await createReview(id, reviewData);
            alert('리뷰가 성공적으로 등록되었습니다.');
            setNewReviewContent('');
            setRatings({ rating_safety: 0, rating_noise: 0, rating_light: 0, rating_traffic: 0, rating_bug: 0 });
            // 리뷰와 평점만 새로고침
            fetchReviewsForRoom(id)
                .then((data) => setReviews(data || []))
                .catch(console.error);
            fetchReviewStats(id).then(setRatingStats).catch(console.error);
            handleClose();
        } catch (error) {
            alert(error.message || '리뷰 등록에 실패했습니다.');
            console.error(error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsReviewModalOpen(false);
            setIsClosing(false);
        }, 250);
    };

    if (!propertyData) return <div>Loading...</div>;

    const renderStars = (score) => {
        const stars = [];
        const roundedScore = Math.round(Number(score) * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            let starClass = styles.emptyStar;
            if (i <= roundedScore) starClass = styles.filledStar;
            stars.push(<span key={i} className={starClass}>★</span>);
        }
        return stars;
    };

    const renderNewReviewStars = (ratingKey) => {
        return (
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={star <= ratings[ratingKey] ? styles.filledStar : styles.emptyStar}
                        onClick={() => handleRatingChange(ratingKey, star)}
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleRatingChange(ratingKey, star);
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const IMAGES_PER_PAGE = 5;
    const imageCount = propertyData.images?.length || 0;
    const maxStart = Math.max(0, imageCount - IMAGES_PER_PAGE);
    const isPrevDisabled = startIndex === 0;
    const isNextDisabled = startIndex >= maxStart;

    const handlePrev = () => {
        if (!isPrevDisabled) setStartIndex((i) => i - 1);
    };

    const handleNext = () => {
        if (!isNextDisabled) setStartIndex((i) => i + 1);
    };

    const visibleImages = propertyData.images?.slice(startIndex, startIndex + IMAGES_PER_PAGE) || [];

    const hasValidCoord = 
        Number.isFinite(Number(propertyData.latitude)) &&
        Number.isFinite(Number(propertyData.longitude)) &&
        !(Number(propertyData.latitude) === 0 && Number(propertyData.longitude) === 0);

    const mapCenter = hasValidCoord
        ? { lat: Number(propertyData.latitude), lng: Number(propertyData.longitude) }
        : { lat: 37.5665, lng: 126.9780 };

    return (
        <div className={styles.detailPage}>
            {/* ... 헤더, 사진, 세부정보 섹션은 동일 ... */}
            <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <div className={styles.contentGroup}>
                        <div className={styles.external_id}>매물번호 {propertyData.external_id ?? id}</div>
                        <p className={styles.title}>월세 {toMan(propertyData.deposit)}/{toMan(propertyData.monthly_fee)}</p>
                        <p className={styles.address}>{propertyData.title}</p>
                        <div className={styles.headerButtons}>
                            <button className={`${styles.actionButton} ${styles.lightButton}`}>문의하기</button>
                            <button className={`${styles.actionButton} ${styles.darkButton}`}>MY 홈 담기</button>
                        </div>
                    </div>
                </div>
                <div className={styles.headerImage}>
                    <Map center={mapCenter} level={1} className={styles.headerImageMap} draggable={false} zoomable={false} onCreate={(map) => map.setDraggable(false)}>
                        {hasValidCoord && <MapMarker position={mapCenter} />}
                    </Map>
                </div>
            </div>

            <div className={styles.imageSection}>
                <h2 className={styles.sectionTitle}>내부 사진</h2>
                <p className={styles.imageDisclaimer}>
                    해당 사진들은 <span className={styles.highlightDate}>2023년 08월 05일</span>에 찍힌 사진들입니다.
                </p>
                <div className={styles.sliderWrapper}>
                    <img src={leftArrow} alt="이전" className={`${styles.slider} ${isPrevDisabled ? styles.sliderDisabled : ''}`} onClick={handlePrev} />
                    <div className={styles.imageGallery}>
                        {Array.from({ length: IMAGES_PER_PAGE }).map((_, index) => (
                            <div key={index} className={styles.imagePlaceholder}>
                                {visibleImages[index] ? (
                                    <img
                                        src={visibleImages[index].image_url}
                                        alt={`room-${startIndex + index}`}
                                        className={styles.galleryImage}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                    <img src={rightArrow} alt="다음" className={`${styles.slider} ${isNextDisabled ? styles.sliderDisabled : ''}`} onClick={handleNext} />
                </div>
            </div>

            <div className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>세부 정보</h2>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <img src={stairsIcon} alt="방/층 아이콘" width={32} height={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>방 종류, 층수</p>
                            <p className={styles.cardValue}>
                                {propertyData.room_type}, {propertyData.floor}
                            </p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <img src={locationIcon} alt="주소 아이콘" width={32} height={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>주소</p>
                            <p className={styles.cardValue}>{propertyData.address}</p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <img src={moneyIcon} alt="가격 아이콘" width={32} height={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>계약 형태, 보증금/월세/관리비</p>
                            <p className={styles.cardValue}>
                                {propertyData.contract_type}, {formatPrice(propertyData.deposit)}/
                                {formatPrice(propertyData.monthly_fee)}/{formatPrice(propertyData.maintenance_cost)}
                            </p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <img src={roomsIcon} alt="면적 아이콘" width={32} height={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>상세 면적</p>
                            <p className={styles.cardValue}>
                                공급면적 · {propertyData.supply_area} m²
                                <br />
                                전용면적 · {propertyData.real_area} m²
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 평점 & 리뷰 섹션 */}
            <div className={styles.footerSection}>
                <div className={styles.ratingSection}>
                    <span className={styles.sectionTitle}>전체 평점</span>
                    <div className={styles.ratingList}>
                        {ratingStats && ratingStats.averages ? (
                            Object.entries(ratingCategories).map(([key, { label, icon }]) => (
                                <div key={key} className={styles.ratingItem}>
                                    <div className={styles.ratingLabel}>
                                        <div className={styles.iconCircle}>{icon}</div>
                                        <span className={styles.labelText}>{label}</span>
                                    </div>
                                    <div className={styles.stars}>{renderStars(ratingStats.averages[key])}</div>
                                </div>
                            ))
                        ) : (
                            <p>평점 데이터를 불러오는 중...</p>
                        )}
                    </div>
                    <button className={styles.writeReviewButton} onClick={() => setIsReviewModalOpen(true)}>
                        리뷰 작성하기
                    </button>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                        <h2 className={styles.sectionTitle}>작성된 리뷰</h2>
                    </div>
                    <div className={styles.reviewList}>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className={styles.reviewCard}>
                                    <div className={styles.reviewAuthor}>
                                        <div className={styles.authorAvatar}></div>
                                        <p>{`사용자 ${review.user}` || '익명'}</p>
                                    </div>
                                    <p className={styles.reviewContent}>{review.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noReviewsBox}>
                                <p className={styles.noReviewsText}>리뷰가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {isReviewModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${isClosing ? styles.close : ''}`}>
                        <button className={styles.closeButton} onClick={handleClose}>
                            ✕
                        </button>
                        <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                            <h3 className={styles.sectionTitle}>리뷰 작성하기</h3>
                            <div className={styles.ratingList}>
                                {Object.entries(newReviewRatingCategories).map(([key, { label, icon }]) => (
                                    <div className={styles.ratingItem} key={key}>
                                        <div className={styles.ratingLabel}>
                                            <div className={styles.iconCircle}>{icon}</div>
                                            <span className={styles.labelText}>{label}</span>
                                        </div>
                                        {renderNewReviewStars(key)}
                                    </div>
                                ))}
                            </div>
                            <textarea
                                className={styles.reviewTextarea}
                                value={newReviewContent}
                                onChange={(e) => setNewReviewContent(e.target.value)}
                                placeholder="리뷰를 이곳에 작성해주세요. (최대 400자)"
                                maxLength={400}
                            />
                            <button type="submit" className={styles.writeReviewButton}>
                                리뷰 등록하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailPage;
