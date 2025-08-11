import styles from './Header.module.css';

const Header = () => {
    return (
        <div className={styles.main__wrapper}>
            <div className={styles.header__logo} />
            <div className={styles.header__buttons}>
                <button className={styles.header__button1}>
                    지도
                </button>
                <button className={styles.header__button1}>
                    커뮤니티
                </button>
                <button className={styles.header__button1}>
                    MY 룸ㆍAI 리포트
                </button>
                <div className={styles.header__loginbox}>
                    <div className={styles.header__loginlogo} />
                    <button className={styles.header__button2}>
                        로그인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
