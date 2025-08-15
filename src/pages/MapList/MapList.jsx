import styles from './MapList.module.css';
import KakaoMap from '../../components/KakaoMap/KakaoMap';

const MapList = () => {
    return (
        <div className={styles.main__wrapper}>
            <div className={styles.map__categorybox}>
                
            </div>
            <KakaoMap />
        </div>
    );
};

export default MapList;