import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityPage.module.css';
import { fetchNews } from '../../../apis/communityApi'; // API 함수 임포트

// 카드 컴포넌트 (재사용)
const Card = ({ tag, title, date, author, image, url, isGray }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.card} ${isGray ? styles.grayCard : ''}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
    >
        <div className={styles.cardHeader}>
            <span className={styles.cardTag}>{tag}</span>
            <span className={styles.cardMenu}>⋮</span>
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardInfo}>
            {new Date(date).toLocaleDateString()} · {author}
        </p>
        <img className={styles.cardImage} src={image || 'https://via.placeholder.com/300x150?text=News'} alt={title} />
    </a>
);

// 실제 페이지 컴포넌트
const CommunityPage = () => {
    const navigate = useNavigate();
    const [latestPosts, setLatestPosts] = useState([]);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                setLoading(true);
                setError(null);
                // Ordering 파라미터를 사용하여 최신순과 다른 기준(예: 생성순)으로 데이터를 가져옵니다.
                const latestResponse = await fetchNews({ ordering: '-published_at' });
                const recommendedResponse = await fetchNews({ ordering: 'created_at' }); // 예시: 추천은 생성순

                setLatestPosts((latestResponse.results || latestResponse).slice(0, 3));
                setRecommendedPosts((recommendedResponse.results || recommendedResponse).slice(0, 3));
            } catch (err) {
                setError('게시글을 불러오지 못했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadNews();
    }, []);

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
            {loading && <p style={{ textAlign: 'center' }}>뉴스를 불러오는 중...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <>
                    <section className={styles.section}>
                        <div className={styles.sectionInner}>
                            <h2 className={styles.sectionTitle}>최신 게시글</h2>
                            <div className={styles.cardGrid}>
                                {latestPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        tag={post.category || '뉴스'}
                                        title={post.title}
                                        date={post.published_at}
                                        author={post.source?.name || '익명'}
                                        image={post.thumbnail}
                                        url={post.url}
                                        isGray={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className={styles.recoWrap}>
                        <div className={styles.sectionInner}>
                            <h2 className={styles.sectionTitle}>추천 게시글</h2>
                            <div className={styles.cardGrid}>
                                {recommendedPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        tag={post.category || '팁'}
                                        title={post.title}
                                        date={post.published_at}
                                        author={post.source?.name || '정보'}
                                        image={post.thumbnail}
                                        url={post.url}
                                        isGray={false}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default CommunityPage;
