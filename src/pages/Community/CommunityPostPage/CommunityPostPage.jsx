import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommunityPostDetail, fetchComments, createComment, togglePostLike, toggleCommentLike, reportCommunityPost, updateCommunityPost, deleteComment } from '../../../apis/communityApi';
import { loadAuth } from '../../../apis/auth';
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        region: '',
        category: ''
    });
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                const postData = await fetchCommunityPostDetail(id);
                setPost(postData);
                const list = await fetchComments(id);
                setComments(list || []);
                
                // 현재 사용자 정보 로드
                const auth = loadAuth();
                const uid = auth?.user?.id ?? null;
                if (uid !== null) {
                    setCurrentUserId(uid);
                }
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

    const handleOpenEdit = () => {
        setEditForm({
            title: post.title,
            content: post.content,
            region: post.region,
            category: post.category
        });
        setIsEditOpen(true);
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

    const handleSubmitEdit = async () => {
        const { title, content, region, category } = editForm;
        if (!title.trim() || !content.trim() || !region.trim() || !category.trim()) {
            alert('모든 필드를 입력해 주세요.');
            return;
        }
        try {
            const updatedPost = await updateCommunityPost(id, editForm);
            setPost(updatedPost);
            setIsEditOpen(false);
            alert('게시글이 수정되었습니다.');
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

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('이 댓글을 삭제하시겠어요?')) return;
        try {
            await deleteComment(commentId);
            const list = await fetchComments(id);
            setComments(list || []);
            // 댓글 수 감소 (대댓글 삭제는 총합 반영 어려워 생략)
            setPost((prev) => (prev ? { ...prev, comment_count: Math.max(0, (prev.comment_count || 1) - 1) } : prev));
        } catch (e) {
            alert(e.message);
        }
    };

    if (loading) return <div className={styles.loading}>불러오는 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!post) return null;

    const isAnonymous = post?.is_anonymous === true || post?.anonymous === true || post?.author_hidden === true;
    let isFrontendAnonymous = false;
    try {
        const raw = localStorage.getItem('anonymous_posts');
        const list = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        if (list.includes(post.id)) isFrontendAnonymous = true;
    } catch {}
    if (!isFrontendAnonymous) {
        try {
            const raw2 = localStorage.getItem('anonymous_titles');
            const list2 = Array.isArray(JSON.parse(raw2)) ? JSON.parse(raw2) : [];
            const prefix = String(post.title || '').slice(0, 100);
            if (list2.some((e) => e && e.title === prefix)) {
                isFrontendAnonymous = true;
            }
        } catch {}
    }
    const authorName = (isAnonymous || isFrontendAnonymous) ? '익명' : (post.author?.username || '익명');

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
                        <span className={styles.authorName}>{authorName}</span>
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
                {post.author?.id === currentUserId && (
                    <button type="button" className={styles.editButton} onClick={handleOpenEdit}>수정</button>
                )}
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
                            {comment.author?.id === currentUserId && (
                                <button type="button" onClick={() => handleDeleteComment(comment.id)} className={styles.deleteButton}>삭제</button>
                            )}
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
                                            {reply.author?.id === currentUserId && (
                                                <button type="button" onClick={() => handleDeleteComment(reply.id)} className={styles.deleteButton}>삭제</button>
                                            )}
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

            {isEditOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsEditOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>게시글 수정</h3>
                        <div className={styles.editForm}>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                placeholder="제목"
                                className={styles.editInput}
                            />
                            <textarea
                                value={editForm.content}
                                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                                placeholder="내용"
                                className={styles.editTextarea}
                            />
                            <select
                                value={editForm.region}
                                onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                                className={styles.editSelect}
                            >
                                <option value="">지역 선택</option>
                                <option value="이문동">이문동</option>
                                <option value="휘경동">휘경동</option>
                                <option value="전농동">전농동</option>
                                <option value="답십리동">답십리동</option>
                                <option value="장안동">장안동</option>
                                <option value="청량리동">청량리동</option>
                                <option value="동대문동">동대문동</option>
                                <option value="신설동">신설동</option>
                                <option value="용두동">용두동</option>
                                <option value="제기동">제기동</option>
                                <option value="전동">전동</option>
                            </select>
                            <select
                                value={editForm.category}
                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                className={styles.editSelect}
                            >
                                <option value="">카테고리 선택</option>
                                <option value="구해요">구해요</option>
                                <option value="팝니다">팝니다</option>
                                <option value="정보공유">정보공유</option>
                                <option value="질문">질문</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <button type="button" className={styles.modalCancel} onClick={() => setIsEditOpen(false)}>취소</button>
                            <button type="button" className={styles.modalSubmit} onClick={handleSubmitEdit}>수정하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPostPage;
