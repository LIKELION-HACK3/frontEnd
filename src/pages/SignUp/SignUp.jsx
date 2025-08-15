import styles from './SignUp.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../apis/auth';

const SignUp = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validate = () => {
        if (!form.username.trim()) return '아이디를 입력해주세요.';
        if (!form.email.trim()) return '이메일 주소를 입력해주세요.';
        if (!/.+@.+\..+/.test(form.email)) return '이메일 형식이 올바르지 않습니다.';
        if (!form.password) return '비밀번호를 입력해주세요.';
        if (form.password !== form.password_confirm) return '비밀번호 확인이 일치하지 않습니다.';
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
            await signUp({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                password_confirm: form.password_confirm,
            });
            navigate('/', { replace: true });
        } catch (error) {
            setError(error.message || '회원가입에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={styles.main__wrapper}>
            <div className={styles.signup__box}>
                <div className={styles.signup__text1}>JOIN</div>

                {error ? <p className={styles.signup__error}>{error}</p> : null}

                <form id="signupForm" className={styles.signup__form} onSubmit={onSubmit}>
                    <input type="text" name="username" placeholder="아이디" className={styles.signup__id} value={form.username} onChange={onChange} autoComplete="username" />
                    <input type="text" name="email" placeholder="이메일 주소" className={styles.signup__email} value={form.email} onChange={onChange} autoComplete="email" />
                    <input type="password" name="password" placeholder="비밀번호" className={styles.signup__pw} value={form.password} onChange={onChange} autoComplete="new-password" />
                    <input type="password" name="password_confirm" placeholder="비밀번호 확인" className={styles.signup__cpw} value={form.password_confirm} onChange={onChange} autoComplete="new-password" />
                </form>
                <button className={styles.signup__button} type="submit" form="signupForm" disabled={pending}>{pending ? '처리 중...' : '회원가입'}</button>
            </div>
        </div>
    );
}

export default SignUp;