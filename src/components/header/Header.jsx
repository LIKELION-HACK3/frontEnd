import styles from './Header.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadAuth, clearAuth } from '../../apis/auth';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [authed, setAuthed] = useState(() => Boolean(loadAuth()?.access));

    useEffect(() => {
        setAuthed(Boolean(loadAuth()?.access));
    }, [location]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'uniroom_auth') setAuthed(Boolean(loadAuth()?.access));
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleAuthClick = () => {
        if (authed) {
            clearAuth();
            setAuthed(false);
            alert('로그아웃 되었습니다.');
            navigate('/', { replace: true });
        } else {
            navigate('/login');
        }
    };

    return (
        <div className={styles.main__wrapper}>
            <div
                className={styles.header__logo}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate('/');
                }}
            />
            <div className={styles.header__buttons}>
                <button className={styles.header__button1} type="button" onClick={() => navigate('/map')}>
                    지도
                </button>
                <button className={styles.header__button1} type="button" onClick={() => navigate('/community_news')}>
                    커뮤니티
                </button>
                {/* --- 이 부분만 수정되었습니다 --- */}
                <button className={styles.header__button1} onClick={() => navigate('/myroom')}>
                    MY 룸ㆍAI 리포트
                </button>
                {/* --------------------------- */}
                <div
                    className={styles.header__loginbox}
                    role="button"
                    tabIndex={0}
                    onClick={handleAuthClick}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleAuthClick();
                    }}
                    aria-pressed={authed}
                    title={authed ? '로그아웃' : '로그인'}
                >
                    <div className={styles.header__loginlogo} />
                    <button className={styles.header__button2}>{authed ? '로그아웃' : '로그인'}</button>
                </div>
            </div>
        </div>
    );
};

export default Header;
