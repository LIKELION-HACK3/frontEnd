import React from 'react';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logoPlaceholder}></div>

                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <a href="#" className={styles.navLink}>
                                지도
                            </a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#" className={styles.navLink}>
                                커뮤니티
                            </a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#" className={styles.navLink}>
                                MY 찜
                            </a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#" className={styles.navLink}>
                                AI 리포트
                            </a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#" className={styles.navLink}>
                                {/* SVG 아이콘 */}
                                <svg className={styles.userIconSmall} viewBox="0 0 24 24" role="img" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="9" r="3" fill="currentColor" />
                                    <path
                                        d="M5.5 18c1.8-3 4.3-4.5 6.5-4.5S16.7 15 18.5 18"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                로그인
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
