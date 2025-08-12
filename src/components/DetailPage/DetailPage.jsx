import React from 'react';
import styles from './MyPage.module.css';

const MyPage = () => {
    const favoriteProperties = [
        { id: 1, title: '월세 1000/55', type: '원룸', details: '6층, 20m², 관리비 7만', info: '국민대 원룸' },
        { id: 2, title: '월세 500/60', type: '원룸', details: '2층, 22m², 관리비 8만', info: '추천 여성전용 원룸' },
        { id: 3, title: '월세 1000/55', type: '원룸', details: '6층, 20m², 관리비 7만', info: '국민대 원룸' },
        { id: 4, title: '월세 500/60', type: '원룸', details: '2층, 22m², 관리비 8만', info: '추천 여성전용 원룸' },
        { id: 5, title: '월세 1000/55', type: '원룸', details: '6층, 20m², 관리비 7만', info: '국민대 원룸' },
        { id: 6, title: '월세 500/60', type: '원룸', details: '2층, 22m², 관리비 8만', info: '추천 여성전용 원룸' },
        { id: 7, title: '월세 1000/55', type: '원룸', details: '6층, 20m², 관리비 7만', info: '국민대 원룸' },
        { id: 8, title: '월세 500/60', type: '원룸', details: '2층, 22m², 관리비 8만', info: '추천 여성전용 원룸' },
    ];

    const aiReports = [
        { id: 1, title: '선택 1', content: '서울 강남구의 최신 아파트, 교통 편리!', tag: 'AI 추천 시스템' },
        { id: 2, title: '선택 2', content: '부산 해운대의 바다 전망 아파트, 인기 많은 매물!', tag: 'AI 추천 시스템' },
    ];

    return (
        <div className={styles.myPage}>
            <div className={styles.section}>
                <div className={styles.favHeader}>
                    <div>
                        <h1 className={styles.title}>MY 찜 목록</h1>
                        <p className={styles.subtitle}>관심 있는 매물들을 확인해보세요.</p>
                    </div>
                    <button className={styles.button}>페이지 전환</button>
                </div>

                <div className={styles.propertyGrid}>
                    {favoriteProperties.map((item) => (
                        <div key={item.id} className={styles.propertyCard}>
                            <div className={styles.imagePlaceholder} />

                            <div className={styles.cardContent}>
                                 <p className={styles.cardTitle}>{item.title}</p>
                                <p className={styles.cardDetails}>{item.type}</p>
                                <ul className={styles.cardInfo}>
                                    <li>{item.details}</li>
                                    <li>{item.info}</li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.section}>
                <div className={styles.aiSection}>
                    <div className={styles.aiIntro}>
                        <h1 className={styles.title}>AI 리포트 받아보기</h1>
                        <p className={styles.subtitle}>AI가 작성한 리포트를 확인하세요.</p>
                        <button className={`${styles.button} ${styles.darkButton}`}>리포트 생성하기</button>
                    </div>
                    <div className={styles.aiList}>
                        <div className={styles.reportGrid}>
                            {aiReports.map((report) => (
                                <div key={report.id} className={styles.reportCard}>
                                    <div className={styles.reportContent}>
                                        <p className={styles.reportTitle}>{report.title}</p>
                                        <p className={styles.reportText}>{report.content}</p>
                                        <p className={styles.reportTag}>{report.tag}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
