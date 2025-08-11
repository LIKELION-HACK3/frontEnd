import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.main__wrapper}>
            <div className={styles.home__container1}>
                <p className={styles.home__text1}>
                    <span className={styles.home__text1__shadow}>어떤 집을 찾고 계세요?</span>
                </p>
                <form className={styles.home__searchbox}>
                    <div className={styles.home__inputbox}>
                        <input type="text" placeholder="원하시는 지역명, 지하철역, 단지명(아파트명)을 입력해주세요" className={styles.home__input} />
                        <button className={styles.home__inputbutton}/>
                    </div>
                    <div className={styles.home__buttons1}>
                        <button className={styles.home__category}>
                            원룸
                        </button>
                        <button className={styles.home__category}>
                            투룸
                        </button>
                        <button className={styles.home__category}>
                            아파트
                        </button>
                        <button className={styles.home__category}>
                            빌라
                        </button>
                        <button className={styles.home__category}>
                            오피스텔
                        </button>
                    </div>
                </form>
            </div>
            <div className={styles.home__container2}>
                <p className={styles.home__text2}>
                    <span className={styles.home__text2__highlight}>멋쟁이사자</span>님께, AI가 추천드려요.
                </p>
            </div>
        </div>
    );
}

export default Home;