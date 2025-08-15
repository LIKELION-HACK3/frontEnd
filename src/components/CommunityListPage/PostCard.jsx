import React from 'react';
import styles from './CommunityListPage.module.css';

const PostCard = ({ title, author, thumbnail }) => {
    return (
        <li className={styles.postCard}>
            {/* ✅ 썸네일 먼저 위치 */}
            <img className={styles.postThumbnail} src={thumbnail} alt="thumbnail" />

            {/* 그 다음 텍스트 */}
            <div className={styles.postInfo}>
                <h4 className={styles.postTitle}>{title}</h4>
                <p className={styles.postMeta}>{author}</p>
            </div>
        </li>
    );
};

export default PostCard;
