import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommunityPostDetail, fetchComments, createComment, togglePostLike, toggleCommentLike, reportCommunityPost } from '../../../apis/communityApi';
import styles from './CommunityPostPage.module.css';

const CommunityPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTargetId, setReplyTargetId] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                const postData = await fetchCommunityPostDetail(id);
                setPost(postData);
                const list = await fetchComments(id);
                setComments(list || []);
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

    const handleLikePost = async () => {
        try {
            const res = await togglePostLike(id);
            setPost((prev) => (prev ? { ...prev, like_count: res.like_count } : prev));
        } catch (e) {
            alert(e.message);
        }
    };

    const handleOpenReport = () => {
        setReportReason('');
        setIsReportOpen(true);
    };

    const handleSubmitReport = async () => {
        const reason = reportReason.trim();
        if (!reason) {
            alert('신고 사유를 입력해 주세요.');
            return;
        }
        try {
            await reportCommunityPost(id, reason);
            alert('신고가 접수되었습니다. 감사합니다.');
            setIsReportOpen(false);
            setReportReason('');
        } catch (e) {
            alert(e.message);
        }
    };

    const handleSubmitComment = async (parentId = null) => {
        const content = newComment.trim();
        if (!content) return;
        try {
            await createComment(id, content, parentId);
            // 새로고침 없이 목록 갱신
            const list = await fetchComments(id);
            setComments(list || []);
            setNewComment('');
            setReplyTargetId(null);
            // 카운트 반영
            setPost((prev) => (prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev));
        } catch (e) {
            alert(e.message);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const res = await toggleCommentLike(commentId);
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? { ...c, like_count: res.count } : {
                    ...c,
                    replies: c.replies?.map((r) => (r.id === commentId ? { ...r, like_count: res.count } : r)) || c.replies,
                }))
            );
        } catch (e) {
            alert(e.message);
        }
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
                    <div className={styles.avatar} aria-hidden="true">🥺</div>
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
                <button
                    type="button"
                    onClick={handleLikePost}
                    className={`${styles.likeButton} ${post.liked ? styles.likeButtonActive : ''}`}
                >
                    ❤️ 공감 {post.like_count}
                </button>
                <span>댓글 {post.comment_count}</span>
                <button type="button" className={styles.reportButton} onClick={handleOpenReport}>신고</button>
            </div>

            <div className={styles.commentSection}>
                <div className={styles.commentForm}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTargetId ? '대댓글을 입력하세요' : '댓글을 입력하세요'}
                        className={styles.commentTextarea}
                    />
                    <button
                        type="button"
                        onClick={() => handleSubmitComment(replyTargetId)}
                        className={styles.commentSubmit}
                    >
                        {replyTargetId ? '대댓글 작성' : '댓글 작성'}
                    </button>
                </div>

                {comments.map((comment) => (
                    <div key={comment.id} className={styles.comment}>
                        <div className={styles.authorInfo}>
                            <div className={styles.avatar} aria-hidden="true">🥺</div>
                            <div className={styles.authorMeta}>
                                <span className={styles.authorName}>{comment.author?.username || '익명'}</span>
                                <span className={styles.postTimestamp}>{formatDateTime(comment.created_at)}</span>
                            </div>
                        </div>
                        <p className={styles.commentContent}>{comment.content}</p>
                        <div className={styles.commentActions}>
                            <button type="button" onClick={() => handleLikeComment(comment.id)}>
                                ❤️ {comment.like_count || 0}
                            </button>
                            <button type="button" onClick={() => setReplyTargetId(comment.id)}>답글</button>
                        </div>
                        {comment.replies && comment.replies.length > 0 && (
                            <div className={styles.replyList}>
                                {comment.replies.map((reply) => (
                                    <div key={reply.id} className={styles.reply}>
                                        <div className={styles.authorInfo}>
                                            <div className={styles.avatar} aria-hidden="true">🥺</div>
                                            <div className={styles.authorMeta}>
                                                <span className={styles.authorName}>{reply.author?.username || '익명'}</span>
                                                <span className={styles.postTimestamp}>{formatDateTime(reply.created_at)}</span>
                                            </div>
                                        </div>
                                        <p className={styles.commentContent}>{reply.content}</p>
                                        <div className={styles.commentActions}>
                                            <button type="button" onClick={() => handleLikeComment(reply.id)}>
                                                ❤️ {reply.like_count || 0}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isReportOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsReportOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>게시글 신고</h3>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="신고 사유를 입력해 주세요"
                            className={styles.modalTextarea}
                        />
                        <div className={styles.modalActions}>
                            <button type="button" className={styles.modalCancel} onClick={() => setIsReportOpen(false)}>취소</button>
                            <button type="button" className={styles.modalSubmit} onClick={handleSubmitReport}>신고하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPostPage;
