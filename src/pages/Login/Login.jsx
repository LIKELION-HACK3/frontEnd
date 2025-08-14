import styles from './Login.module.css';

const Login = () => {
    return (
        <div className={styles.main__wrapper}>
            <div className={styles.login__box}>
                <div className={styles.login__text1}>LOGIN</div>
                <form className={styles.login__form}>
                    <input type="text" className={styles.login__id} />
                    <input type="password" className={styles.login__pw} />
                    <button className={styles.login__button}>로그인</button>
                </form>
                <span className={styles.login__findpw}>비밀번호 찾기</span>
                <span className={styles.login__text2}>|</span>
                <span className={styles.login__signup}>회원가입</span>
            </div>
        </div>
    );
}

export default Login;