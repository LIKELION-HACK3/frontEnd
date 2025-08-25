// src/components/NotificationPopup/NotificationPopup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationPopup.module.css';
import bell from '../../assets/pic/notification_icon.svg';

const NotificationPopup = ({ notifications = [], onClose }) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);

    // 백엔드 응답 기반으로 이동 링크 생성
    const getLinkUrl = (n) => {
        if (!n) return null;
        if (n.link_url) return n.link_url; // 백엔드가 주면 그대로 사용
        if (typeof n.post === 'number') {
            const base = `/community/posts/${n.post}`;
            if (n.comment) return `${base}#comment-${n.comment}`;
            return base;
        }
        return null;
    };

    // 배경 스크롤 잠금
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev || 'auto';
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose?.(), 300); // CSS 애니메이션 시간과 맞춤
    };

    const handleItemActivate = (n) => {
        const url = getLinkUrl(n);
        if (url) navigate(url);
        handleClose();
    };

    if (!notifications.length) {
        return (
            <div className={styles.overlay} onClick={handleClose}>
                <div
                    className={`${styles.popupContainer} ${isClosing ? styles.closing : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.header}>
                        <img src={bell} alt="" className={styles.headerIcon} />
                        <h2 className={styles.title}>새로운 소식</h2>
                    </div>
                    <div className={styles.empty}>새 알림이 없습니다.</div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        확인
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div
                className={`${styles.popupContainer} ${isClosing ? styles.closing : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <img src={bell} alt="" className={styles.headerIcon} />
                    <h2 className={styles.title}>새로운 소식</h2>
                </div>

                <ul className={styles.notificationList}>
                    {notifications.map((noti) => (
                        <li
                            key={noti.id}
                            className={styles.notificationItem}
                            onClick={() => handleItemActivate(noti)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') handleItemActivate(noti);
                            }}
                            title="클릭해서 해당 게시글로 이동"
                        >
                            <p className={styles.message}>
                                {noti.message || `${noti?.actor?.username ?? '누군가'}가 댓글을 남겼어요`}
                            </p>
                            <span className={styles.linkArrow}>→</span>
                        </li>
                    ))}
                </ul>

                <button className={styles.closeButton} onClick={handleClose}>
                    확인
                </button>
            </div>
        </div>
    );
};

export default NotificationPopup;
