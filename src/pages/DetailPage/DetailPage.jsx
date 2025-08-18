import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './DetailPage.module.css';
import { Sun, Volume2, Bug, Shield, Train, MapPin, Layers, DollarSign, Ruler } from 'lucide-react';
import { createReview, fetchReviewsForRoom, fetchReviewStats } from '../../apis/roomsApi';

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

    if (num >= 10000) {
        return `${(num / 10000).toLocaleString()}`;
    }

    return `${num.toLocaleString()}원`;
};

const DetailPage = () => {
    const { id } = useParams();
    const [propertyData, setPropertyData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    // 평점과 리뷰를 위한 state
    const [ratingStats, setRatingStats] = useState(null);
    const [reviews, setReviews] = useState([]);

    const [newReviewContent, setNewReviewContent] = useState('');
    const [ratings, setRatings] = useState({
        rating_safety: 0,
        rating_noise: 0,
        rating_light: 0,
        rating_traffic: 0,
        rating_clean: 0,
    });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // ✅ [수정] 새 API의 key에 맞게 매핑 객체를 수정합니다.
    const ratingCategories = {
        safety: { label: '보안', icon: <Shield className={styles.icon} /> },
        noise: { label: '방음', icon: <Volume2 className={styles.icon} /> },
        light: { label: '채광', icon: <Sun className={styles.icon} /> },
        traffic: { label: '교통', icon: <Train className={styles.icon} /> },
        bug: { label: '벌레', icon: <Bug className={styles.icon} /> },
    };

    const newReviewRatingCategories = {
        rating_safety: { label: '안전' },
        rating_noise: { label: '소음' },
        rating_light: { label: '채광' },
        rating_traffic: { label: '교통' },
        rating_clean: { label: '청결' },
    };

    // ✅ [수정] 데이터를 각각 안전하게 불러오도록 로직을 변경합니다.
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
            setRatings({ rating_safety: 0, rating_noise: 0, rating_light: 0, rating_traffic: 0, rating_clean: 0 });
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
            if (i <= roundedScore) {
                starClass = styles.filledStar;
            }
            stars.push(
                <span key={i} className={starClass}>
                    ★
                </span>
            );
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
    const totalPages = Math.ceil(imageCount / IMAGES_PER_PAGE);

    const handlePrev = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    };

    const visibleImages =
        propertyData.images?.slice(currentPage * IMAGES_PER_PAGE, (currentPage + 1) * IMAGES_PER_PAGE) || [];

    return (
        <div className={styles.detailPage}>
            {/* ... 헤더, 사진, 세부정보 섹션은 동일 ... */}
            <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <div className={styles.contentGroup}>
                        <p className={styles.title}>{propertyData.title}</p>
                        <p className={styles.address}>{propertyData.address}</p>
                        <div className={styles.headerButtons}>
                            <button className={`${styles.actionButton} ${styles.lightButton}`}>문의하기</button>
                            <button className={`${styles.actionButton} ${styles.darkButton}`}>MY 홈 담기</button>
                        </div>
                    </div>
                </div>
                <div
                    className={styles.headerImage}
                    style={{
                        backgroundImage:
                            propertyData.images?.length > 0 ? `url(${propertyData.images[0].image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
            </div>

            <div className={styles.imageSection}>
                <h2 className={styles.sectionTitle}>내부 사진</h2>
                <p className={styles.imageDisclaimer}>
                    위 사진들은 <span className={styles.highlightDate}>2023년 08월 05일</span>에 찍힌 사진들입니다.
                </p>

                <div className={styles.sliderWrapper}>
                    <div className={styles.imageGallery}>
                        {Array.from({ length: IMAGES_PER_PAGE }).map((_, index) => (
                            <div key={index} className={styles.imagePlaceholder}>
                                {visibleImages[index] ? (
                                    <img
                                        src={visibleImages[index].image_url}
                                        alt={`room-${currentPage * IMAGES_PER_PAGE + index}`}
                                        className={styles.galleryImage}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <>
                            <button className={styles.prevButton} onClick={handlePrev} disabled={currentPage === 0}>
                                &lt;
                            </button>
                            <button
                                className={styles.nextButton}
                                onClick={handleNext}
                                disabled={currentPage >= totalPages - 1}
                            >
                                &gt;
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>세부 정보</h2>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <Layers size={32} />
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
                            <MapPin size={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>주소</p>
                            <p className={styles.cardValue}>{propertyData.address}</p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <DollarSign size={32} />
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
                            <Ruler size={32} />
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
                    <h2 className={styles.sectionTitle}>전체 평점</h2>
                    <div className={styles.ratingList}>
                        {/* ✅ 6. ratingStats state와 averages 객체를 사용하여 평점을 렌더링합니다. */}
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
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                        <h2 className={styles.sectionTitle}>작성된 리뷰</h2>
                        <button className={styles.allReviewButton}>전체 보기</button>
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
                            <p>리뷰가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 리뷰 작성 버튼 */}
            <button className={styles.writeReviewButton} onClick={() => setIsReviewModalOpen(true)}>
                리뷰 작성하기
            </button>

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
                                {Object.entries(newReviewRatingCategories).map(([key, { label }]) => (
                                    <div className={styles.ratingItem} key={key}>
                                        <span className={styles.labelText}>{label}</span>
                                        {renderNewReviewStars(key)}
                                    </div>
                                ))}
                            </div>
                            <textarea
                                className={styles.reviewTextarea}
                                value={newReviewContent}
                                onChange={(e) => setNewReviewContent(e.target.value)}
                                placeholder="이 집에 대한 리뷰를 남겨주세요."
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
