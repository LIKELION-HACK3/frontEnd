import styles from './KakaoMap.module.css';
import { Map } from 'react-kakao-maps-sdk';

export default function KakaoMap() {
    return (
        <div className={styles.main__wrapper}>
            <Map center={{ lat: 33.450701, lng: 126.570667 }} className={styles.kakaoMap} level={4} />
        </div>
    );
}