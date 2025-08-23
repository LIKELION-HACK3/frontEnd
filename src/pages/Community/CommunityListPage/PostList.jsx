import React from 'react';
import styles from './CommunityListPage.module.css';
import PostCard from './PostCard';

const PostList = ({ posts, loading, error, onWritePostClick, onDelete, currentUser, query, setQuery, hasMore, loadingMore, onLoadMore, topLiked, onTopLikedClick }) => {
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
                <div className={styles.searchContainer}>
                    <input
                        className={styles.searchInput}
                        placeholder="제목이나 내용으로 검색..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && setQuery(e.target.value)}
                    />
                    <button 
                        className={styles.searchButton}
                        onClick={() => setQuery(query)}
                    >
                        🔍
                    </button>
                </div>
            </div>

            {topLiked && (
                <button className={styles.topLikedBar} onClick={() => onTopLikedClick?.(topLiked.id)}>
                    <div className={styles.topLikedLabel}>지금 뜨는 글</div>
                    <div className={styles.topLikedTitle}>{topLiked.title}</div>
                    <div className={styles.topLikedMeta}>❤️ {topLiked.like_count || 0} · 조회 {topLiked.views || 0}</div>
                </button>
            )}

            {loading && <p>게시글을 불러오는 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    <ul className={styles.postList}>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    meta={`조회 ${post.views || 0} · ❤️ ${post.like_count || 0} · 댓글 ${
                                        post.comment_count || 0
                                    }`}
                                    currentUser={currentUser}
                                    onDelete={onDelete}
                                />
                            ))
                        ) : (
                            <p>표시할 게시글이 없습니다.</p>
                        )}
                    </ul>
                    {posts.length > 0 && (
                        <button 
                            className={styles.loadMore} 
                            onClick={onLoadMore}
                            disabled={loadingMore || !hasMore}
                        >
                            {loadingMore ? '로딩 중...' : hasMore ? '더보기' : '모든 게시글을 불러왔습니다'}
                        </button>
                    )}
                    {/* 디버깅용 정보 */}
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
                        게시글: {posts.length}개 | hasMore: {hasMore ? 'true' : 'false'} | loading: {loadingMore ? 'true' : 'false'}
                    </div>
                </>
            )}
        </section>
    );
};

export default PostList;
