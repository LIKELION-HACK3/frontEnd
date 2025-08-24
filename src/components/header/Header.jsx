// 배포 환경(리눅스)은 대소문자를 구분합니다. 이 파일 경로는 'components/header/Header.jsx' 입니다.
// 상단 import 경로도 항상 소문자 'header'를 사용해야 합니다.
import styles from './Header.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadAuth, clearAuth } from '../../apis/auth';
import Logo from '../../assets/pic/uniroom_logo.svg';

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

    const isMap = location.pathname.startsWith('/map');
    const isMyRoom = location.pathname.startsWith('/myroom');
    const isCommunity = location.pathname.startsWith('/community_news');
    const isLoginPage = location.pathname.startsWith('/login');

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
                style={{ backgroundImage: `url(${Logo})` }}
                aria-label="Uniroom 로고"
            />
            <div className={styles.header__buttons}>
                <button className={`${styles.header__button1} ${isMap ? styles.isActive : ''}`} type="button" onClick={() => navigate('/map')}>
                    지도
                </button>
                <button className={`${styles.header__button1} ${isMyRoom ? styles.isActive : ''}`} type="button" onClick={() => navigate('/myroom')}>
                    MY 룸ㆍAI 리포트
                </button>
                <button className={`${styles.header__button1} ${isCommunity ? styles.isActive : ''}`} type="button" onClick={() => navigate('/community_news')}>
                    커뮤니티
                </button>
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
                    <button className={`${styles.header__button2} ${isLoginPage ? styles.isLoginUnderline : ''}`} type="button">{authed ? '로그아웃' : '로그인'}</button>
                </div>
            </div>
        </div>
    );
};

export default Header;
