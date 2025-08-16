import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import TabSelector from './TabSelector';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';

const CommunityListPage = () => {
    const [activeTab, setActiveTab] = useState('함께해요'); // 초기 탭을 '함께해요'로 설정합니다.
    const navigate = useNavigate();

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (tabName === '뉴스, 팁') {
            navigate('/community_news');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>커뮤니티</h1>
            <TabSelector activeTab={activeTab} setActiveTab={handleTabClick} />

            <div className={styles.contentContainer}>
                <FilterSidebar />
                <PostList activeTab={activeTab} />
            </div>
        </div>
    );
};

export default CommunityListPage;
