import React from 'react';
import styles from './CommunityListPage.module.css';

const TabSelector = ({ activeTab, setActiveTab }) => {
    return (
        <div className={styles.tabButtons}>
            <button
                className={`${styles.tabButton} ${activeTab === '뉴스, 팁' ? styles.active : ''}`}
                onClick={() => setActiveTab('뉴스, 팁')}
            >
                뉴스, 팁
            </button>
            <button
                className={`${styles.tabButton} ${activeTab === '함께해요' ? styles.active : ''}`}
                onClick={() => setActiveTab('함께해요')}
            >
                함께해요
            </button>
        </div>
    );
};

export default TabSelector;
