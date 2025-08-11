import React from 'react';
import styles from './PropertyDetail.module.css';

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
        details: {
            price: '20',
            options: '세탁기, 냉장고, 침대, 옷장, 에어컨',
            traffic: '버스정류장: 10m\n지하철역: 25m',
            facilities: '주변 편의시설\n편의점: 10m\n마트: 20m',
            security: '카드 보안기, CCTV',
        },
        rating: {
            채광: 0,
            방음: 0,
            벌레: 0,
            보안: 0,
            교통: 0,
        },
        reviews: [
            { author: 'Alice', content: 'Lovely neighborhood, very peaceful.' },
            { author: 'John', content: 'The amenities are fantastic!' },
            { author: 'Sarah', content: 'Great schools nearby.' },
        ],
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
            <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <div className={styles.contentGroup}>
                        <p className={styles.title}>{propertyData.title}</p>
                        <p className={styles.address}>{propertyData.address}</p>
                        <div className={styles.headerButtons}>
                            <button className={`${styles.actionButton} ${styles.lightButton}`}>MY 찜 담기</button>
                            <button className={`${styles.actionButton} ${styles.darkButton}`}>문의하기</button>
                        </div>
                    </div>
                </div>
                <div className={styles.headerImage}></div>
            </div>

            <div className={styles.imageSection}>
                <h2 className={styles.sectionTitle}>내부 사진</h2>
                <p className={styles.imageDisclaimer}>
                    위 사진들은 <span className={styles.highlightDate}>2023년 08월 05일</span>에 찍힌 사진들입니다.
                </p>
                <div className={styles.imageGallery}>
                    {propertyData.images.map((image, index) => (
                        <div key={index} className={styles.imagePlaceholder}>
                            <p>{image.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 세부 정보 섹션 */}
            <div className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>세부 정보</h2>
                <p className={styles.detailsSubtitle}>Find detailed information about the house.</p>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <p className={styles.detailLabel}>평수 / 총</p>
                        <p className={styles.detailValue}>{propertyData.details.price}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <p className={styles.detailLabel}>옵션</p>
                        <p className={styles.detailValue}>{propertyData.details.options}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <p className={styles.detailLabel}>주변 교통</p>
                        <p className={styles.detailValue}>{propertyData.details.traffic}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <p className={styles.detailLabel}>주변 편의시설</p>
                        <p className={styles.detailValue}>{propertyData.details.facilities}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <p className={styles.detailLabel}>보안시설 등</p>
                        <p className={styles.detailValue}>{propertyData.details.security}</p>
                    </div>
                </div>
            </div>

            <div className={styles.footerSection}>
                <div className={styles.ratingSection}>
                    <h2 className={styles.sectionTitle}>전체 평점</h2>
                    <p className={styles.ratingLoginText}>로그인 후 이용하실 수 있습니다.</p>
                    <div className={styles.ratingList}>
                        {Object.keys(propertyData.rating).map((key) => (
                            <div key={key} className={styles.ratingItem}>
                                <p>{key}</p>
                                <div className={styles.stars}>{renderStars(propertyData.rating[key])}</div>
                            </div>
                        ))}
                    </div>
                    <button className={styles.writeReviewButton}>리뷰 작성하기</button>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                        <h2 className={styles.sectionTitle}>작성된 리뷰</h2>
                        <button className={styles.allReviewButton}>전체 보기</button>
                    </div>
                    <div className={styles.reviewList}>
                        {propertyData.reviews.map((review, index) => (
                            <div key={index} className={styles.reviewCard}>
                                <div className={styles.reviewAuthor}>
                                    <div className={styles.authorAvatar} />
                                    <p>{review.author}</p>
                                </div>
                                <p className={styles.reviewContent}>{review.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
