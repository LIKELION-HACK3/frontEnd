import React from 'react';
import styles from './MyPage.module.css';

const MyPage = () => {
    const favoriteProperties = [
        {
            id: 1,
            title: '월세 1000/55',
            type: '국민대 원룸',
            details: '원룸 · 2층 · 5평\n풀옵션 · 깔끔하고 조용한 환경',
            imageUrl: '/images/room1.jpg',
        },
        {
            id: 2,
            title: '월세 700/60',
            type: '건대역 투룸',
            details: '투룸 · 4층 · 7평\n역세권 · 엘리베이터 있음',
            imageUrl: '/images/room2.jpg',
        },
        {
            id: 3,
            title: '월세 500/70',
            type: '고려대역 투룸',
            details: '투룸 · 5층 · 8평\n직장인 선호지역 · 깔끔한 내부',
            imageUrl: '/images/room3.jpg',
        },
        {
            id: 4,
            title: '월세 650/50',
            type: '한양대 오피스텔',
            details: '오피스텔 · 3층 · 6평\n신축급 인테리어 · 채광 좋음',
            imageUrl: '/images/room4.jpg',
        },
        {
            id: 5,
            title: '월세 600/65',
            type: '상도역 풀옵션',
            details: '원룸 · 1층 · 5평\n편의점 근접 · 여성 전용',
            imageUrl: '/images/room5.jpg',
        },
        {
            id: 6,
            title: '월세 800/70',
            type: '숭실대 투룸',
            details: '투룸 · 6층 · 9평\n보안 철저 · CCTV 설치',
            imageUrl: '/images/room6.jpg',
        },
    ];

    const aiReports = [
        {
            id: 1,
            title: '월세 1000/55',
            details: '중화역3분 근처당x 초저가 지상층 풀옵션 원룸',
            imageUrl: '/images/room1.jpg',
        },
        {
            id: 2,
            title: '월세 500/70',
            details: '초초역세권! 오피스텔 리모델링 완료',
            imageUrl: '/images/room3.jpg',
        },
    ];

    return (
        <div className={styles.myPage}>
            {/* 상단 제목 영역 (회색 배경) */}
            <div className={styles.topHeader}>
                <h1 className={styles.title}>MY 룸 목록</h1>
                <p className={styles.subtitle}>관심 있는 집들을 한번에 확인해보세요.</p>
            </div>

            {/* 카드 리스트 (흰색 배경) */}
            <div className={styles.section}>
                <div className={styles.propertyGrid}>
                    {favoriteProperties.map((item) => (
                        <div key={item.id} className={styles.cardWrapper}>
                            <div className={styles.propertyCard}>
                                <img src={item.imageUrl} alt={item.type} className={styles.cardImage} />
                                <span className={styles.heart}>♡</span>
                                <div className={styles.cardBody}>
                                    <p className={styles.cardTitle}>{item.title}</p>
                                    <p className={styles.cardType}>{item.type}</p>
                                    <pre className={styles.cardDetails}>{item.details}</pre>
                                </div>
                            </div>
                            <button className={styles.selectButton}>AI 리포트 선택</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI 리포트 섹션 (회색 배경) */}
            <div className={`${styles.section} ${styles.aiSectionWrapper}`}>
                <div className={styles.aiSection}>
                    <div className={styles.aiLeft}>
                        <h1 className={styles.title}>AI 리포트 받아보기</h1>
                        <p className={styles.subtitle}>2개의 집을 골라 AI에게 분석을 맡겨보세요.</p>
                        <button className={styles.button}>AI 리포트 생성하기</button>
                    </div>

                    <div className={styles.aiRight}>
                        {aiReports.map((report, index) => (
                            <div key={report.id} className={styles.reportCard}>
                                <img src={report.imageUrl} alt={report.title} className={styles.reportImage} />
                                <div className={styles.reportText}>
                                    <p className={styles.reportLabel}>선택{index + 1}</p>
                                    <p className={styles.reportTitle}>{report.title}</p>
                                    <p className={styles.reportDetail}>{report.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
