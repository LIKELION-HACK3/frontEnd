import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import TabSelector from './TabSelector';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';
import CommunityWriteModal from './CommunityWriteModal';
import { fetchCommunityPosts, deleteCommunityPost } from '../../../apis/communityApi';
import { loadAuth } from '../../../apis/auth';

const CommunityListPage = () => {
    const [activeTab, setActiveTab] = useState('함께해요');
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
        if (activeTab !== '함께해요') {
            setPosts([]);
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setHasMore(true);
            setError(null);
            
            // 모든 게시글을 한 번만 가져오기 (검색어나 필터 변경 시에는 클라이언트에서 필터링)
            const params = {};
            if (selectedSort === '인기') params.ordering = '-like_count,-views';
            
            console.log('Loading all posts with params:', params);
            
            const response = await fetchCommunityPosts(params);
            const allPostsData = response.results || response || [];
            
            console.log('Loaded all posts:', allPostsData.length);
            
            setAllPosts(allPostsData);
            
            // 클라이언트 사이드에서 검색 및 필터링 적용
            const filteredPosts = allPostsData.filter(post => {
                // 검색어 필터링
                if (query && !post.title.toLowerCase().includes(query.toLowerCase()) && 
                    !post.content?.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
                
                // 지역 필터링
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) {
                    return false;
                }
                
                // 카테고리 필터링
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) {
                    return false;
                }
                
                return true;
            });
            
            console.log('Filtered posts:', filteredPosts.length, 'query:', query, 'region:', selectedRegion, 'category:', selectedCategory);
            
            // 첫 로드: 필터링된 게시글 중 첫 10개만 표시
            const firstPagePosts = filteredPosts.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            
            // 10개보다 많으면 더보기 버튼 표시
            setHasMore(filteredPosts.length > 10);
            
            console.log('First page posts:', firstPagePosts.length, 'hasMore:', filteredPosts.length > 10);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedSort]); // 의존성 최소화

    // 필터나 검색 조건이 변경될 때마다 첫 페이지부터 로드
    useEffect(() => {
        setPage(1);
        loadPosts();
    }, [activeTab, selectedSort]); // query, selectedRegion, selectedCategory 제거
    
    // 검색어나 필터 변경 시 즉시 필터링 적용
    useEffect(() => {
        if (allPosts.length > 0) {
            // 클라이언트 사이드에서 검색 및 필터링 적용
            const filteredPosts = allPosts.filter(post => {
                // 검색어 필터링
                if (query && !post.title.toLowerCase().includes(query.toLowerCase()) && 
                    !post.content?.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
                
                // 지역 필터링
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) {
                    return false;
                }
                
                // 카테고리 필터링
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) {
                    return false;
                }
                
                return true;
            });
            
            console.log('Filtering posts:', { 
                allPosts: allPosts.length, 
                filtered: filteredPosts.length, 
                query, 
                region: selectedRegion, 
                category: selectedCategory 
            });
            
            // 첫 10개만 표시
            const firstPagePosts = filteredPosts.slice(0, 10);
            setPosts(firstPagePosts);
            setPage(1);
            
            // 10개보다 많으면 더보기 버튼 표시
            setHasMore(filteredPosts.length > 10);
        }
    }, [allPosts, query, selectedRegion, selectedCategory]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
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
        // 모달 열 때 필터 상태 초기화하여 충돌 방지
        setSelectedRegion('전체');
        setSelectedCategory('전체');
        setSelectedSort('최근');
        setQuery('');
        setIsModalOpen(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && allPosts.length > 0) {
            console.log('=== HANDLE LOAD MORE ===');
            console.log('Current page:', page);
            console.log('Current allPosts length:', allPosts.length);
            console.log('Current posts length:', posts.length);
            
            // 클라이언트 사이드에서 검색 및 필터링 적용
            const currentFilteredPosts = allPosts.filter(post => {
                // 검색어 필터링
                if (query && !post.title.toLowerCase().includes(query.toLowerCase()) && 
                    !post.content?.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
                
                // 지역 필터링
                if (selectedRegion && selectedRegion !== '전체' && post.region !== selectedRegion) {
                    return false;
                }
                
                // 카테고리 필터링
                if (selectedCategory && selectedCategory !== '전체' && post.category !== selectedCategory) {
                    return false;
                }
                
                return true;
            });
            
            console.log('Filtered posts for load more:', currentFilteredPosts.length);
            
            const startIndex = page * 10;
            const endIndex = startIndex + 10;
            const nextPagePosts = currentFilteredPosts.slice(startIndex, endIndex);
            
            console.log('Next page posts:', { startIndex, endIndex, nextPagePosts: nextPagePosts.length });
            
            if (nextPagePosts.length > 0) {
                setPosts(prev => {
                    const newPosts = [...prev, ...nextPagePosts];
                    console.log('Updated posts:', newPosts.length);
                    return newPosts;
                });
                setPage(prev => prev + 1);
                
                // 더 불러올 게시글이 있는지 확인
                const newHasMore = currentFilteredPosts.length > endIndex;
                console.log('New hasMore:', newHasMore, 'currentFilteredPosts.length:', currentFilteredPosts.length, 'endIndex:', endIndex);
                setHasMore(newHasMore);
            } else {
                console.log('No more posts to load');
                setHasMore(false);
            }
        }
    };

    return (
        <>
            <div className={styles.pageContainer}>
                <h1 className={styles.title}>커뮤니티</h1>
                <TabSelector activeTab={activeTab} setActiveTab={handleTabClick} />

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
            <CommunityWriteModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onPostCreated={loadPosts} 
            />
        </>
    );
};

export default CommunityListPage;
