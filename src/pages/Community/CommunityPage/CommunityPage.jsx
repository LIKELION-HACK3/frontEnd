import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityPage.module.css';

// 게시글 카드 컴포넌트
const Card = ({ tag, title, date, author, image, isGray }) => (
    <div className={`${styles.card} ${isGray ? styles.grayCard : ''}`}>
        <div className={styles.cardHeader}>
            <span className={styles.cardTag}>{tag}</span>
            <span className={styles.cardMenu}>⋮</span>
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardInfo}>
            {date} · {author}
        </p>
        <img className={styles.cardImage} src={image} alt={title} />
    </div>
);

// 최신 게시글 데이터
const latestPosts = [
    {
        id: 1,
        tag: '부동산 시세',
        title: '최근 1년간 집값 5% 상승',
        date: '2025.08.12',
        author: 'OO뉴스',
        image: 'https://via.placeholder.com/300x150?text=최근+1년간+집값+5%+상승',
    },
    {
        id: 2,
        tag: '정부 지원',
        title: '정부, 7월부터 청년 자취 지원 정책',
        date: '2025.06.15',
        author: '미디어000',
        image: 'https://via.placeholder.com/300x150?text=청년+자취+지원',
    },
    {
        id: 3,
        tag: '계약',
        title: '계약 시 꼭 확인해야 할 요소',
        date: '2025.08.01',
        author: '한누구',
        image: 'https://via.placeholder.com/300x150?text=계약+체크리스트',
    },
];

// 추천 게시글 데이터
const recommendedPosts = [
    {
        id: 4,
        tag: '원룸메이트',
        title: '자취 1년차의 생활정리 꿀팁',
        date: '2025.06.27',
        author: '000에디터',
        image: 'https://via.placeholder.com/300x150?text=생활정리+꿀팁',
    },
    {
        id: 5,
        tag: '원룸메이트',
        title: '어떤 집이 나에게 어울릴까?',
        date: '2025.06.27',
        author: '000뉴스',
        image: 'https://via.placeholder.com/300x150?text=집+선택+팁',
    },
    {
        id: 6,
        tag: '원룸메이트',
        title: '복층 살림은 이렇게 해보세요',
        date: '2025.06.27',
        author: '야구',
        image: 'https://via.placeholder.com/300x150?text=복층+살림+팁',
    },
];

// 실제 페이지 컴포넌트
const CommunityPage = () => {
    const navigate = useNavigate();

    const handleTabClick = (tabName) => {
        if (tabName === '뉴스, 팁') {
            // 현재 페이지이므로 아무것도 하지 않음
        } else if (tabName === '함께해요') {
            navigate('/community_list');
        }
    };

    return (
        <div className={styles.communityPage}>
            <h1 className={styles.pageTitle}>커뮤니티</h1>

            <div className={styles.tabButtons}>
                <button className={`${styles.tabButton} ${styles.active}`} onClick={() => handleTabClick('뉴스, 팁')}>
                    뉴스, 팁
                </button>
                <button className={styles.tabButton} onClick={() => handleTabClick('함께해요')}>
                    함께해요
                </button>
            </div>

            <div className={styles.introBox}>
                <span className={styles.introIcon}>📘</span>
                <div className={styles.introTextGroup}>
                    <p className={styles.introTitle}>멋쟁이사자님을 위한 모음.zip</p>
                    <p className={styles.introSub}>부동산, 지역, 정부 시책 등 구직에 꿀팁되는 한눈에 확인하세요</p>
                </div>
            </div>

            <section className={styles.section}>
                <div className={styles.sectionInner}>
                    <h2 className={styles.sectionTitle}>최신 게시글</h2>
                    <div className={styles.cardGrid}>
                        {latestPosts.map((post) => (
                            <Card key={post.id} {...post} isGray={true} />
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.recoWrap}>
                <div className={styles.sectionInner}>
                    <h2 className={styles.sectionTitle}>추천 게시글</h2>
                    <div className={styles.cardGrid}>
                        {recommendedPosts.map((post) => (
                            <Card key={post.id} {...post} isGray={false} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CommunityPage;
