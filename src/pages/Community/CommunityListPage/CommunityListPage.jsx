// src/pages/Community/CommunityListPage/CommunityListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';
import CommunityWriteModal from './CommunityWriteModal';
import { fetchCommunityPosts, deleteCommunityPost } from '../../../apis/communityApi';
import { loadAuth } from '../../../apis/auth';
import searchIcon from '../../../assets/pic/search-glass.svg';

const CommunityListPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedSort, setSelectedSort] = useState('최근');
    const [query, setQuery] = useState('');

    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    const [topLiked, setTopLiked] = useState(null);

    useEffect(() => {
        const auth = loadAuth();
        if (auth?.user) setCurrentUser(auth.user);
    }, []);

    const sortPosts = useCallback(
        (list) => {
            if (selectedSort !== '인기') return list;
            const toNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
            return [...list].sort((a, b) => {
                const v = toNum(b?.views) - toNum(a?.views);
                if (v !== 0) return v;
                const l = toNum(b?.like_count) - toNum(a?.like_count);
                if (l !== 0) return l;
                return new Date(b?.created_at || b?.updated_at || 0) - new Date(a?.created_at || a?.updated_at || 0);
            });
        },
        [selectedSort]
    );

    const computeTopLiked = useCallback((list) => {
        if (!Array.isArray(list) || list.length === 0) return null;
        const sorted = [...list].sort((a, b) => (b?.like_count || 0) - (a?.like_count || 0));
        const top = sorted[0];
        return (top?.like_count || 0) >= 3 ? top : null;
    }, []);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setHasMore(true);

            const params = {};
            if (selectedSort === '인기') params.ordering = '-views,-like_count';

            const res = await fetchCommunityPosts(params);
            const list = res.results || res || [];
            setAllPosts(list);
            setTopLiked(computeTopLiked(list));

            const q = query.trim().toLowerCase();
            const filtered = list.filter((post) => {
                const qOk = !q || post.title?.toLowerCase?.().includes(q) || post.content?.toLowerCase?.().includes(q);
                const rOk = selectedRegion === '전체' || post.region === selectedRegion;
                const cOk = selectedCategory === '전체' || post.category === selectedCategory;
                return qOk && rOk && cOk;
            });

            const sorted = sortPosts(filtered);
            setPosts(sorted.slice(0, 10));
            setPage(1);
            setHasMore(sorted.length > 10);
        } catch (e) {
            console.error(e);
            setError('게시글을 불러오지 못했습니다.');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSort, selectedRegion, selectedCategory, query, sortPosts, computeTopLiked]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        if (allPosts.length === 0) return;
        const q = query.trim().toLowerCase();
        const filtered = allPosts.filter((post) => {
            const qOk = !q || post.title?.toLowerCase?.().includes(q) || post.content?.toLowerCase?.().includes(q);
            const rOk = selectedRegion === '전체' || post.region === selectedRegion;
            const cOk = selectedCategory === '전체' || post.category === selectedCategory;
            return qOk && rOk && cOk;
        });
        const sorted = sortPosts(filtered);
        setPosts(sorted.slice(0, 10));
        setPage(1);
        setHasMore(sorted.length > 10);
        setTopLiked(computeTopLiked(allPosts));
    }, [allPosts, query, selectedRegion, selectedCategory, sortPosts, computeTopLiked]);

    useEffect(() => {
        let rafId = null;
        const refreshTop = async () => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            try {
                const res = await fetchCommunityPosts({ ordering: '-like_count,-views' });
                const list = res.results || res || [];
                const nextTop = computeTopLiked(list);
                if (
                    !topLiked ||
                    (nextTop && (nextTop.like_count || 0) > (topLiked.like_count || 0)) ||
                    (nextTop && topLiked && nextTop.id !== topLiked.id && (nextTop.like_count || 0) >= 5)
                ) {
                    setTopLiked(nextTop);
                }
            } catch {}
        };
        const onLikesChanged = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(refreshTop);
        };
        window.addEventListener('community:likesChanged', onLikesChanged);
        document.addEventListener('visibilitychange', onLikesChanged);
        onLikesChanged();
        return () => {
            window.removeEventListener('community:likesChanged', onLikesChanged);
            document.removeEventListener('visibilitychange', onLikesChanged);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [topLiked, computeTopLiked]);

    const handleDelete = async (postId) => {
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
        try {
            await deleteCommunityPost(postId);
            loadPosts();
        } catch (err) {
            alert(err.message || '게시글 삭제에 실패했습니다.');
            console.error(err);
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleTabClick = (tabName) => {
        if (tabName === '뉴스, 팁') navigate('/community_news');
    };
    const openTopLiked = (postId) => postId && navigate(`/community/posts/${postId}`);
    const handleSearch = () => {
        setPage(1);
        loadPosts();
    };

    const handleLoadMore = () => {
        if (loadingMore || !hasMore || allPosts.length === 0) return;
        const q = query.trim().toLowerCase();
        const filtered = allPosts.filter((post) => {
            const qOk = !q || post.title?.toLowerCase?.().includes(q) || post.content?.toLowerCase?.().includes(q);
            const rOk = selectedRegion === '전체' || post.region === selectedRegion;
            const cOk = selectedCategory === '전체' || post.category === selectedCategory;
            return qOk && rOk && cOk;
        });
        const sorted = sortPosts(filtered);
        const start = page * 10;
        const next = sorted.slice(start, start + 10);
        if (next.length > 0) {
            setPosts((prev) => [...prev, ...next]);
            setPage((p) => p + 1);
            setHasMore(sorted.length > start + 10);
        } else {
            setHasMore(false);
        }
    };

    return (
        <>
            <div className={styles.communityPage}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.pageTitle}>커뮤니티</h1>
                </div>

                <div className={styles.tabButtons}>
                    <button className={styles.tabButton2} onClick={() => handleTabClick('뉴스, 팁')}>
                        뉴스, 팁
                    </button>
                    <button className={`${styles.tabButton} ${styles.active}`} onClick={() => {}}>
                        함께해요
                    </button>
                </div>

                <div className={styles.body_wrapper}>
                    {/* 검색/작성 */}
                    <div className={styles.actionBar}>
                        <button className={styles.writeButton} onClick={handleOpenModal}>
                            + 작성하기
                        </button>
                        <div className={styles.searchContainer}>
                            <input
                                className={styles.searchInput}
                                placeholder="검색"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className={styles.searchButton} onClick={handleSearch}>
                                {/* 흰색 SVG를 마스크로 사용 → 정확히 #1b818C 색상으로 렌더 */}
                                <span
                                    className={styles.searchIcon}
                                    aria-hidden="true"
                                    style={{ WebkitMaskImage: `url(${searchIcon})`, maskImage: `url(${searchIcon})` }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 상단 핫게시물 바 */}
                    {topLiked && (
                        <div
                            className={styles.topLikedBar}
                            onClick={() => openTopLiked(topLiked.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && openTopLiked(topLiked.id)}
                            title="핫게시물로 이동"
                        >
                            <span className={styles.topLikedLabel}>핫게시물</span>
                            <span className={styles.topLikedTitle}>{topLiked.title}</span>
                            <span className={styles.topLikedMeta}>
                                ♥ {topLiked.like_count || 0} · 조회 {topLiked.views || 0}
                            </span>
                        </div>
                    )}

                    <div className={styles.contentContainer}>
                        <FilterSidebar
                            selectedRegion={selectedRegion}
                            setSelectedRegion={setSelectedRegion}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            selectedSort={selectedSort}
                            setSelectedSort={setSelectedSort}
                        />
                        <PostList
                            posts={posts}
                            loading={loading}
                            error={error}
                            onWritePostClick={handleOpenModal}
                            onDelete={handleDelete}
                            currentUser={currentUser}
                            query={query}
                            setQuery={setQuery}
                            hasMore={hasMore}
                            loadingMore={loadingMore}
                            onLoadMore={handleLoadMore}
                        />
                    </div>
                </div>

                <CommunityWriteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={loadPosts} />
            </div>
        </>
    );
};

export default CommunityListPage;
