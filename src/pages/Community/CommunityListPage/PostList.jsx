import React from 'react';
import styles from './CommunityListPage.module.css';
import PostCard from './PostCard';

const PostList = ({ posts, loading, error, onWritePostClick }) => {
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;

        return postDate.toLocaleDateString('ko-KR');
    };

    return (
        <section className={styles.postListSection}>
            <div className={styles.actionBar}>
                <button className={styles.writeButton} onClick={onWritePostClick}>
                    + 작성하기
                </button>
                <input className={styles.searchInput} placeholder="검색" />
            </div>

            {loading && <p>게시글을 불러오는 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    <ul className={styles.postList}>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    title={post.title}
                                    author={`${post.author.username} · ${formatTimeAgo(post.created_at)} · ${
                                        post.region_display
                                    }`}
                                    thumbnail={'https://via.placeholder.com/64x64.png?text=Post'}
                                />
                            ))
                        ) : (
                            <p>표시할 게시글이 없습니다.</p>
                        )}
                    </ul>
                    {posts.length > 0 && <button className={styles.loadMore}>더보기</button>}
                </>
            )}
        </section>
    );
};

export default PostList;
