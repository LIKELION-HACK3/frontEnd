import React from 'react';
import styles from './PropertyDetail.module.css';
import { Sun, Volume2, Bug, Shield, Train, MapPin, Layers, DollarSign, Ruler } from 'lucide-react';

const PropertyDetail = () => {
    const propertyData = {
        title: '1000/64',
        address: '이문동 어디어디가 어느곳',
        images: [
            { id: 1, title: 'Living Room' },
            { id: 2, title: 'Kitchen' },
            { id: 3, title: 'Kitchen' },
            { id: 4, title: 'Kitchen' },
            { id: 5, title: 'Bedroom' },
        ],
        rating: {
            채광: 2,
            방음: 3,
            벌레: 5,
            보안: 4,
            교통: 2,
        },
        reviews: [
            { author: 'Alice', content: 'Lovely neighborhood, very peaceful.' },
            { author: 'John', content: 'The amenities are fantastic!' },
            { author: 'Sarah', content: 'Great schools nearby.' },
        ],
    };

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
                <div className={styles.headerImage}></div>
            </div>

            {/* 내부 사진 섹션 */}
            <div className={styles.imageSection}>
                <h2 className={styles.sectionTitle}>내부 사진</h2>
                <p className={styles.imageDisclaimer}>
                    위 사진들은 <span className={styles.highlightDate}>2023년 08월 05일</span>에 찍힌 사진들입니다.
                </p>
                <div className={styles.imageGallery}>
                    {propertyData.images.map((image) => (
                        <div key={image.id} className={styles.imagePlaceholder}>
                            <p>{image.title}</p>
                        </div>
                    ))}
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
                            <p className={styles.cardValue}>원룸, 2층/4층</p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <MapPin size={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>주소</p>
                            <p className={styles.cardValue}>중랑구 묵동</p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <DollarSign size={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>계약 형태, 보증금/월세/관리비</p>
                            <p className={styles.cardValue}>월세, 1000/55/8</p>
                        </div>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.iconBox}>
                            <Ruler size={32} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.cardLabel}>상세 면적</p>
                            <p className={styles.cardValue}>
                                공급면적 · 18.55m²
                                <br />
                                전용면적 · 16.25m² &nbsp;&nbsp;|&nbsp;&nbsp; 평수 : 4.8평
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 평점 & 리뷰 섹션 */}
            <div className={styles.footerSection}>
                {/* 평점 */}
                <div className={styles.ratingSection}>
                    <h2 className={styles.sectionTitle}>전체 평점</h2>
                    <div className={styles.ratingList}>
                        {Object.keys(propertyData.rating).map((key) => (
                            <div key={key} className={styles.ratingItem}>
                                <div className={styles.ratingLabel}>
                                    <div className={styles.iconCircle}>{iconMap[key]}</div>
                                    <span className={styles.labelText}>{key}</span>
                                </div>
                                <div className={styles.stars}>{renderStars(propertyData.rating[key])}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 리뷰 */}
                <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                        <h2 className={styles.sectionTitle}>작성된 리뷰</h2>
                        <button className={styles.allReviewButton}>전체 보기</button>
                    </div>
                    <div className={styles.reviewList}>
                        {propertyData.reviews.map((review, index) => (
                            <div key={index} className={styles.reviewCard}>
                                <div className={styles.reviewAuthor}>
                                    <div className={styles.authorAvatar}></div>
                                    <p>{review.author}</p>
                                </div>
                                <p className={styles.reviewContent}>{review.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 리뷰 작성 버튼 */}
            <button className={styles.writeReviewButton}>리뷰 작성하기</button>
        </div>
    );
};

export default PropertyDetail;
