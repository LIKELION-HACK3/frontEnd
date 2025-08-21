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
            setError(null);
            const params = {};
            if (query) params.q = query;
            if (selectedRegion && selectedRegion !== '전체') params.region = selectedRegion;
            if (selectedCategory && selectedCategory !== '전체') params.category = selectedCategory;
            if (selectedSort === '인기') params.ordering = '-like_count,-views';
            const response = await fetchCommunityPosts(params);
            setPosts(response.results || response || []);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

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
                        onWritePostClick={() => setIsModalOpen(true)}
                        onDelete={handleDelete}
                        currentUser={currentUser}
                        query={query}
                        setQuery={setQuery}
                    />
                </div>
            </div>
            <CommunityWriteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={loadPosts} />
        </>
    );
};

export default CommunityListPage;
