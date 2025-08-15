import styles from './Login.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../apis/auth';

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.username.trim()) return '아이디를 입력해 주세요.';
        if (!form.password) return '비밀번호를 입력해 주세요.';
        return '';
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (pending) return;
        setError('');

        const msg = validate();
        if (msg) return setError(msg);

        setPending(true);
        try {
            await login({
                username: form.username.trim(),
                password: form.password,
            });
            navigate('/', { replace: true });
        } catch (error) {
            setError(error?.message || '로그인에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={styles.main__wrapper}>
            <div className={styles.login__box}>
                <div className={styles.login__text1}>LOGIN</div>

                {error ? <p className={styles.login__error}>{error}</p> : null}

                <form className={styles.login__form} onSubmit={onSubmit} aria-busy={pending}>
                    <input type="text" name="username" placeholder="아이디" className={styles.login__id} value={form.username} onChange={onChange} autoComplete="username" readOnly={pending} />
                    <input type="password" name="password" placeholder="비밀번호" className={styles.login__pw} value={form.password} onChange={onChange} autoComplete="current-password" readOnly={pending} />
                    <button className={styles.login__button} type="submit" disabled={pending}>{pending ? '처리 중...' : '로그인'}</button>
                </form>
                <div className={styles.text__box}>
                    <span className={styles.login__findpw}>비밀번호 찾기</span>
                    <span className={styles.login__text2}>|</span>
                    <span className={styles.login__signup} role="button" tabIndex={0} onClick={() => navigate('/join')} onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') navigate('/join');}}>회원가입</span>
                </div>
            </div>
        </div>
    );
}

export default Login;