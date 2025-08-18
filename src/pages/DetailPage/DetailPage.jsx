import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './DetailPage.module.css';
import { Sun, Volume2, Bug, Shield, Train, MapPin, Layers, DollarSign, Ruler } from 'lucide-react';

const PropertyDetail = () => {
    const { id } = useParams();
    const [propertyData, setPropertyData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0); // ✅ 현재 이미지 인덱스 상태 추가

    useEffect(() => {
        const fetchPropertyData = async () => {
            try {
                const response = await fetch(`https://www.uniroom.shop/api/rooms/${id}/`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setPropertyData(data);
            } catch (error) {
                console.error('API error:', error);
            }
        };

        if (id) fetchPropertyData();
    }, [id]);

    if (!propertyData) return <div>Loading...</div>;

    const iconMap = {
        채광: <Sun className={styles.icon} />,
        방음: <Volume2 className={styles.icon} />,
        벌레: <Bug className={styles.icon} />,
        보안: <Shield className={styles.icon} />,
        교통: <Train className={styles.icon} />,
    };

    const renderStars = (score) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={i < score ? styles.filledStar : styles.emptyStar}>
                    ★
                </span>
            );
        }
        return stars;
    };

    // ✅ 좌우 버튼 클릭 함수
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? propertyData.images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === propertyData.images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className={styles.detailPage}>
            {/* 헤더 섹션 */}
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

            {/* 내부 사진 섹션 */}
            <div className={styles.imageSection}>
                <h2 className={styles.sectionTitle}>내부 사진</h2>
                <p className={styles.imageDisclaimer}>
                    위 사진들은 <span className={styles.highlightDate}>2023년 08월 05일</span>에 찍힌 사진들입니다.
                </p>

                <div className={styles.sliderWrapper}>
                    {/* ✅ 현재 선택된 이미지 하나만 보여줌 */}
                    {propertyData.images?.length > 0 && (
                        <div className={styles.imagePlaceholder}>
                            <img
                                src={propertyData.images[currentIndex].image_url}
                                alt="room"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        </div>
                    )}

                    {/* ✅ 좌우 화살표 버튼 */}
                    <button className={styles.prevButton} onClick={handlePrev}>
                        &lt;
                    </button>
                    <button className={styles.nextButton} onClick={handleNext}>
                        &gt;
                    </button>
                </div>
            </div>

            {/* 세부 정보 섹션 */}
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
                                {propertyData.contract_type}, {propertyData.deposit}/{propertyData.monthly_fee}/
                                {propertyData.maintenance_cost}
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
                        {propertyData.rating ? (
                            Object.keys(propertyData.rating).map((key) => (
                                <div key={key} className={styles.ratingItem}>
                                    <div className={styles.ratingLabel}>
                                        <div className={styles.iconCircle}>{iconMap[key]}</div>
                                        <span className={styles.labelText}>{key}</span>
                                    </div>
                                    <div className={styles.stars}>{renderStars(propertyData.rating[key])}</div>
                                </div>
                            ))
                        ) : (
                            <p>평점 데이터 없음</p>
                        )}
                    </div>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                        <h2 className={styles.sectionTitle}>작성된 리뷰</h2>
                        <button className={styles.allReviewButton}>전체 보기</button>
                    </div>
                    <div className={styles.reviewList}>
                        {propertyData.reviews ? (
                            propertyData.reviews.map((review, index) => (
                                <div key={index} className={styles.reviewCard}>
                                    <div className={styles.reviewAuthor}>
                                        <div className={styles.authorAvatar}></div>
                                        <p>{review.author}</p>
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

            <button className={styles.writeReviewButton}>리뷰 작성하기</button>
        </div>
    );
};

export default PropertyDetail;
