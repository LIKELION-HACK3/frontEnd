import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityListPage.module.css';

const PostCard = ({ post, meta, currentUser, onDelete }) => {
    const navigate = useNavigate();
    const isAuthor = currentUser && post.author && currentUser.id === post.author.id;

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // 삭제 버튼 누를 때 상세로 안 튀게
        onDelete(post.id);
    };

    const goDetail = () => navigate(`/community/posts/${post.id}`);

    return (
        <li
            className={styles.postCard}
            onClick={goDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goDetail()}
        >
            <div className={styles.postInfo}>
                <h4 className={styles.postTitle}>{post.title}</h4>
                <p className={styles.postContent}>{post.content}</p>
                <p className={styles.postMeta}>{meta}</p>
            </div>
            {isAuthor && (
                <button onClick={handleDeleteClick} className={styles.deleteButton}>
                    삭제
                </button>
            )}
        </li>
    );
};

export default PostCard;
