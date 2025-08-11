import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footerNavList}>
                <li className={styles.footerNavItem}>
                    <a href="#" className={styles.footerNavLink}>
                        이용약관
                    </a>
                </li>
                <li className={styles.footerNavItem}>
                    <a href="#" className={styles.footerNavLink}>
                        개인정보처리방침
                    </a>
                </li>
                <li className={styles.footerNavItem}>
                    <a href="#" className={styles.footerNavLink}>
                        고객센터
                    </a>
                </li>
                <li className={styles.footerNavItem}>
                    <a href="#" className={styles.footerNavLink}>
                        회사정보
                    </a>
                </li>
            </ul>
        </footer>
    );
};

export default Footer;
