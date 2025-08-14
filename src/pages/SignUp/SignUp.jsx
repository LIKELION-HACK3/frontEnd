import styles from './SignUp.module.css';

const SignUp = () => {
    return (
        <div className={styles.main__wrapper}>
            <div className={styles.signup__box}>
                <div className={styles.signup__text1}>JOIN</div>
                <form className={styles.signup__form}>
                    <input type="text" className={styles.signup__id} />
                    <input type="text" className={styles.signup__email} />
                    <input type="password" className={styles.signup__pw} />
                    <input type="password" className={styles.signup__cpw} />
                    <button className={styles.signup__button}>회원가입</button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;