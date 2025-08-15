// CommunityListPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';
import TabSelector from './TabSelector';
import FilterSidebar from './FilterSidebar';
import PostList from './PostList';

const CommunityListPage = () => {
    const [activeTab, setActiveTab] = useState('뉴스, 팁');

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>커뮤니티</h1>
            <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className={styles.contentContainer}>
                <FilterSidebar />
                <PostList activeTab={activeTab} />
            </div>
        </div>
    );
};

export default CommunityListPage;
