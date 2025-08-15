import React from 'react';
import styles from './CommunityListPage.module.css';
import PostCard from './PostCard';

const samplePosts = [
    {
        id: 1,
        title: 'OO오피스텔 7월 28일 바로 입주하실 분 구해요',
        author: '고려대학교 · 24분 전 · 청년자취',
        thumbnail: 'https://via.placeholder.com/64x64.png?text=썸네일',
    },
    {
        id: 2,
        title: '여성 쉐어하우스 4인실 - 룸메 1명 구해요',
        author: '서울4호선 · 15분 전 · 청년자취',
        thumbnail: 'https://via.placeholder.com/64x64.png?text=룸메',
    },
    {
        id: 3,
        title: '혼자 하는 살림살이 - 음식 편 (1)',
        author: '서울3호선 · 24분 전 · 청년자취',
        thumbnail: 'https://via.placeholder.com/64x64.png?text=음식',
    },
];

const PostList = ({ activeTab }) => {
    return (
        <section className={styles.postListSection}>
            <div className={styles.actionBar}>
                <button className={styles.writeButton}>+ 작성하기</button>
                <input className={styles.searchInput} placeholder="검색" />
            </div>

            <ul className={styles.postList}>
                {samplePosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                ))}
            </ul>

            <button className={styles.loadMore}>더보기</button>
        </section>
    );
};

export default PostList;
