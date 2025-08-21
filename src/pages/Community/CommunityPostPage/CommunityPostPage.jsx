import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommunityPostDetail } from '../../../apis/communityApi';
import styles from './CommunityPostPage.module.css';

const CommunityPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                const postData = await fetchCommunityPostDetail(id);
                setPost(postData);
            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [id]);

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    };

    if (loading) return <div className={styles.loading}>불러오는 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!post) return null;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                &lt; 목록으로
            </button>
            <div className={styles.postHeader}>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <div className={styles.authorInfo}>
                    <div className={styles.avatar} />
                    <div className={styles.authorMeta}>
                        <span className={styles.authorName}>{post.author?.username || '익명'}</span>
                        <span className={styles.postTimestamp}>{formatDateTime(post.created_at)}</span>
                    </div>
                </div>
            </div>

            <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />

            <div className={styles.postActions}>
                <span>조회 {post.views}</span>
                <span>공감 {post.like_count}</span>
                <span>댓글 {post.comment_count}</span>
            </div>

            <div className={styles.commentSection}>
                {post.comments &&
                    post.comments.map((comment) => (
                        <div key={comment.id} className={styles.comment}>
                            <div className={styles.authorInfo}>
                                <div className={styles.avatar} />
                                <div className={styles.authorMeta}>
                                    <span className={styles.authorName}>{comment.author?.username || '익명'}</span>
                                    <span className={styles.postTimestamp}>{formatDateTime(comment.created_at)}</span>
                                </div>
                            </div>
                            <p className={styles.commentContent}>{comment.content}</p>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default CommunityPostPage;
