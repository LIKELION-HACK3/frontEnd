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

    useEffect(() => {
        const auth = loadAuth();
        if (auth && auth.user) {
            setCurrentUser(auth.user);
        }
    }, []);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setHasMore(true);
            setError(null);

            const params = {};
            if (selectedSort === '인기') params.ordering = '-like_count,-views';

            const response = await fetchCommunityPosts(params);
            const allPostsData = response.results || response || [];
            setAllPosts(allPostsData);

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

            const firstPagePosts = filteredPosts.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            setHasMore(filteredPosts.length > 10);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSort]); // ⬅ activeTab 제거

    // 정렬 변경 시 첫 페이지부터 로드
    useEffect(() => {
        setPage(1);
        loadPosts();
    }, [selectedSort, loadPosts]);

    // 검색/필터 변경 시 즉시 반영
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
            const firstPagePosts = filteredPosts.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            setHasMore(filteredPosts.length > 10);
        }
    }, [allPosts, query, selectedRegion, selectedCategory]);

    // 탭 클릭: 뉴스, 팁으로만 이동 (동일한 동작)
    const handleTabClick = (tabName) => {
        if (tabName === '뉴스, 팁') {
            navigate('/community_news');
        }
    };

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

            const startIndex = page * 10;
            const endIndex = startIndex + 10;
            const nextPagePosts = currentFilteredPosts.slice(startIndex, endIndex);

            if (nextPagePosts.length > 0) {
                setPosts((prev) => [...prev, ...nextPagePosts]);
                setPage((prev) => prev + 1);
                setHasMore(currentFilteredPosts.length > endIndex);
            } else {
                setHasMore(false);
            }
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
                    />
                </div>
            </div>

            <CommunityWriteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={loadPosts} />
        </>
    );
};

export default CommunityListPage;
