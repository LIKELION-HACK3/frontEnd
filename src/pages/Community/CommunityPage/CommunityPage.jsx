import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityPage.module.css';
import { fetchNews } from '../../../apis/communityApi';
import { loadAuth } from '../../../apis/auth';
import communityIcon from '../../../assets/pic/community_icon.svg';

// 재사용 카드 컴포넌트
const Card = ({ tag, title, date, author, image, url, isGray }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.card} ${isGray ? styles.grayCard : ''}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
    >
        <div className={styles.cardHeader}>
            <div className={styles.tagWrap}>
                <img src={communityIcon} alt="카테고리 아이콘" className={styles.cardIcon} />
                <span className={styles.cardTag}>{tag}</span>
            </div>
            <span className={styles.cardMenu}>⋮</span>
        </div>

        <h3 className={styles.cardTitle}>{title}</h3>

        <p className={styles.cardInfo}>
            {date ? new Date(date).toLocaleDateString() : ''} · {author || '익명'}
        </p>

        <img
            className={styles.cardImage}
            src={image || 'https://via.placeholder.com/600x300?text=No+Image'}
            alt={title}
        />
    </a>
);

const CommunityPage = () => {
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState('멋쟁이사자');
    const [latestPosts, setLatestPosts] = useState([]);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 로그인 사용자명 로드
    useEffect(() => {
        const auth = loadAuth();
        const name = auth?.user?.username || auth?.user?.name || auth?.user?.nickname || '멋쟁이사자';
        setDisplayName(name);
    }, []);

    // 뉴스 데이터 로드
    useEffect(() => {
        const loadNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const latestResponse = await fetchNews({ ordering: '-published_at' });
                const recommendedResponse = await fetchNews({ ordering: 'created_at' });

                setLatestPosts((latestResponse.results || latestResponse).slice(0, 3));
                setRecommendedPosts((recommendedResponse.results || recommendedResponse).slice(0, 3));
            } catch (err) {
                console.error(err);
                setError('게시글을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    const handleTabClick = (tabName) => {
        if (tabName === '함께해요') navigate('/community_list');
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

            {/* 인트로: 아이콘=제목 왼쪽, 부제목=아이콘 아래 */}
            <div className={styles.sectionInner}>
                <div className={styles.introBox}>
                    <img
                        src={communityIcon}
                        alt="커뮤니티 아이콘"
                        className={`${styles.cardIcon} ${styles.introIcon}`}
                    />
                    <p className={styles.introTitle}>
                        <span className={styles.nameBold}>{displayName}</span>님을 위한 모음.zip
                    </p>
                    <p className={styles.introSub}>
                        부동산, 자취, 정부 지원 정책 등 집 구할 때 꿀팁을 한눈에 확인해보세요
                    </p>
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
                                        author={post.source?.name || '00뉴스'}
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
