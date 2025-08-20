import React from 'react';
import styles from './CommunityListPage.module.css';

const PostCard = ({ post, meta, currentUser, onDelete }) => {
    const isAuthor = currentUser && post.author && currentUser.id === post.author.id;

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(post.id);
    };

    return (
        <li className={styles.postCard}>
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
