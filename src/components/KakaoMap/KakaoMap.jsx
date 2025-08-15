import styles from './KakaoMap.module.css';
import { useEffect, useState } from 'react';

const { kakao } = window;

const KakaoMap = () => {
    const [map, setMap] = useState(null);

    useEffect(() => {
        const container = document.getElementById('map');
        const options = { center: new kakao.maps.LatLng(33.450701, 126.570667) };
        const kakaoMap = new kakao.maps.Map(container, options);
        setMap(kakaoMap);
    }, [])

    return (
        <div className={styles.main__wrapper}>
            <div id="map" className={styles.kakaoMap}>
            </div>
        </div>
    );
};

export default KakaoMap;