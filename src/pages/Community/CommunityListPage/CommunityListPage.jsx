import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';
import CommunityWriteModal from './CommunityWriteModal';
import { fetchCommunityPosts, deleteCommunityPost } from '../../../apis/communityApi';
import { loadAuth } from '../../../apis/auth';

const CommunityListPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // pagination
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [allPosts, setAllPosts] = useState([]); // 클라이언트 사이드 페이지네이션용

    // filters
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedSort, setSelectedSort] = useState('최근');
    const [query, setQuery] = useState('');

    // highlight bar state
    const [topLiked, setTopLiked] = useState(null);

    useEffect(() => {
        const auth = loadAuth();
        if (auth && auth.user) {
            setCurrentUser(auth.user);
        }
    }, []);

    const sortPosts = useCallback((list) => {
        if (selectedSort === '인기') {
            // 조회수 우선(desc), 그 다음 공감수(desc), 최신순(desc)
            const toNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
            return [...list].sort((a, b) => {
                const av = toNum(a?.views);
                const bv = toNum(b?.views);
                if (bv !== av) return bv - av;
                const al = toNum(a?.like_count);
                const bl = toNum(b?.like_count);
                if (bl !== al) return bl - al;
                const at = new Date(a?.created_at || a?.updated_at || 0).getTime();
                const bt = new Date(b?.created_at || b?.updated_at || 0).getTime();
                return bt - at;
            });
        }
        return list;
    }, [selectedSort]);

    const computeTopLiked = useCallback((list) => {
        if (!Array.isArray(list) || list.length === 0) return null;
        const sorted = [...list].sort((a, b) => (b?.like_count || 0) - (a?.like_count || 0));
        const top = sorted[0];
        // 최소 표기 임계값: 3 하트 이상일 때만 노출
        if ((top?.like_count || 0) >= 3) return top;
        return null;
    }, []);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setHasMore(true);
            setError(null);

            const params = {};
            if (selectedSort === '인기') params.ordering = '-views,-like_count';

            const response = await fetchCommunityPosts(params);
            const allPostsData = response.results || response || [];
            setAllPosts(allPostsData);
            setTopLiked(computeTopLiked(allPostsData));

            const filteredPosts = allPostsData.filter((post) => {
                // 검색어
                if (
                    query &&
                    !post.title.toLowerCase().includes(query.toLowerCase()) &&
                    !post.content?.toLowerCase().includes(query.toLowerCase())
                )
                    return false;
                // 지역
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) return false;
                // 카테고리
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) return false;
                return true;
            });

            const sorted = sortPosts(filteredPosts);
            const firstPagePosts = sorted.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            setHasMore(sorted.length > 10);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSort, selectedRegion, selectedCategory, query, sortPosts, computeTopLiked]);

    // 정렬/필터 변경 시 첫 페이지부터 로드
    useEffect(() => {
        setPage(1);
        loadPosts();
    }, [selectedSort, selectedRegion, selectedCategory, query, loadPosts]);

    // 검색/필터 변경 시 즉시 반영 (allPosts가 있을 때)
    useEffect(() => {
        if (allPosts.length > 0) {
            const filteredPosts = allPosts.filter((post) => {
                if (
                    query &&
                    !post.title.toLowerCase().includes(query.toLowerCase()) &&
                    !post.content?.toLowerCase().includes(query.toLowerCase())
                )
                    return false;
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) return false;
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) return false;
                return true;
            });
            const sorted = sortPosts(filteredPosts);
            const firstPagePosts = sorted.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            setHasMore(sorted.length > 10);
            setTopLiked(computeTopLiked(allPosts));
        }
    }, [allPosts, query, selectedRegion, selectedCategory, sortPosts, computeTopLiked]);

    // 이벤트 기반 상단 하이라이트 갱신 (서버 부하 최소화)
    useEffect(() => {
        let rafId = null;
        const refreshTop = async () => {
            // 탭이 보이지 않을 때는 네트워크 요청을 하지 않음
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
            } catch (e) {
                // 무시
            }
        };

        const onLikesChanged = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(refreshTop);
        };

        window.addEventListener('community:likesChanged', onLikesChanged);
        document.addEventListener('visibilitychange', onLikesChanged);
        // 초기 한 번
        onLikesChanged();

        return () => {
            window.removeEventListener('community:likesChanged', onLikesChanged);
            document.removeEventListener('visibilitychange', onLikesChanged);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [topLiked, computeTopLiked]);

    const handleDelete = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await deleteCommunityPost(postId);
                loadPosts();
            } catch (err) {
                alert(err.message || '게시글 삭제에 실패했습니다.');
                console.error(err);
            }
        }
    };

    const handleOpenModal = () => {
        setSelectedRegion('전체');
        setSelectedCategory('전체');
        setSelectedSort('최근');
        setQuery('');
        setIsModalOpen(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && allPosts.length > 0) {
            const currentFilteredPosts = allPosts.filter((post) => {
                if (
                    query &&
                    !post.title.toLowerCase().includes(query.toLowerCase()) &&
                    !post.content?.toLowerCase().includes(query.toLowerCase())
                )
                    return false;
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) return false;
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) return false;
                return true;
            });

            const sorted = sortPosts(currentFilteredPosts);
            const startIndex = page * 10;
            const endIndex = startIndex + 10;
            const nextPagePosts = sorted.slice(startIndex, endIndex);

            if (nextPagePosts.length > 0) {
                setPosts((prev) => [...prev, ...nextPagePosts]);
                setPage((prev) => prev + 1);
                setHasMore(sorted.length > endIndex);
            } else {
                setHasMore(false);
            }
        }
    };

    const openTopLiked = (postId) => {
        if (!postId) return;
        navigate(`/community/posts/${postId}`);
    };

    const handleTabClick = (tabName) => {
        if (tabName === '뉴스, 팁') {
            navigate('/community_news');
        }
    };

    return (
        <>
            {/* 상단(제목+탭) — CommunityPage와 동일한 구조/클래스 */}
            <div className={styles.communityPage}>
                <h1 className={styles.pageTitle}>커뮤니티</h1>

                <div className={styles.tabButtons}>
                    <button className={styles.tabButton} onClick={() => handleTabClick('뉴스, 팁')}>
                        뉴스, 팁
                    </button>
                    <button className={`${styles.tabButton} ${styles.active}`} onClick={() => {}}>
                        함께해요
                    </button>
                </div>

                {/* 본문은 기존 레이아웃 유지 */}
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
                        topLiked={topLiked}
                        onTopLikedClick={openTopLiked}
                    />
                </div>
            </div>

            <CommunityWriteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={loadPosts} />
        </>
    );
};

export default CommunityListPage;
