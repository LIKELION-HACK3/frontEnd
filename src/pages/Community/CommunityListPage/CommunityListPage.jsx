import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import TabSelector from './TabSelector';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';
import CommunityWriteModal from './CommunityWriteModal'; // 모달 컴포넌트 import
import { fetchCommunityPosts } from '../../../apis/communityApi'; // API 함수 import

const CommunityListPage = () => {
    const [activeTab, setActiveTab] = useState('함께해요');
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 게시글 데이터를 불러오는 함수
    const loadPosts = useCallback(async () => {
        if (activeTab !== '함께해요') {
            setPosts([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await fetchCommunityPosts();
            setPosts(response.results || response || []);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // 컴포넌트가 로드되거나 탭이 바뀔 때 게시글 로드
    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (tabName === '뉴스, 팁') {
            navigate('/community_news');
        }
    };

    return (
        <>
            <div className={styles.pageContainer}>
                <h1 className={styles.title}>커뮤니티</h1>
                <TabSelector activeTab={activeTab} setActiveTab={handleTabClick} />

                <div className={styles.contentContainer}>
                    <FilterSidebar />
                    {/* PostList에 데이터와 모달 열기 함수를 props로 전달 */}
                    <PostList
                        posts={posts}
                        loading={loading}
                        error={error}
                        onWritePostClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>
            {/* 페이지 하단에 모달 렌더링 */}
            <CommunityWriteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={loadPosts} // 새 글 작성 후 목록을 다시 불러옴
            />
        </>
    );
};

export default CommunityListPage;
