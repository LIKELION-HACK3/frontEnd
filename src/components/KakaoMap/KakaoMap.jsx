import styles from './KakaoMap.module.css';
import { useEffect, useState, useMemo } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

export default function KakaoMap({ rooms = [] }) {
    const FALLBACK_CENTER = { lat: 37.597607, lng: 127.058836 };
    const [center, setCenter] = useState(FALLBACK_CENTER);
    const [selectedId, setSelectedId] = useState(null);

    /* geolocation API, 현재 위치 불러오는 거임 */
    useEffect(() => {
        if (!('geolocation' in navigator)) return;

        let cancelled = false;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (cancelled) return;
                setCenter({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximum: 0,
            }
        );

        return () => {
            cancelled = true;
        };
    }, []);

    /* 부동산 매물 마커 */
    const markers = useMemo(() => {
    return rooms
        .map((r) => ({
            id: r.id,
            title: r.title,
            deposit: r.deposit,
            monthly_fee: r.monthly_fee,
            position: { lat: Number(r.latitude), lng: Number(r.longitude) },
        }))
        .filter((m) =>
            Number.isFinite(m.position.lat) &&
            Number.isFinite(m.position.lng) &&
            !(m.position.lat === 0 && m.position.lng === 0)
        );
    }, [rooms]);

    /* 카카오 맵 출력 */
    return (
        <div className={styles.map__wrapper}>
            <Map center={center} isPanto className={styles.kakaoMap} level={4}>
                {markers.map((m) => (
                    <MapMarker key={m.id} position={m.position} onClick={() => setSelectedId((prev) => (prev === m.id ? null : m.id))}>
                        {selectedId === m.id && (
                            <div style={{ padding: '4px 8px', fontSize: 12, lineHeight: 1.4 }}>
                                <b>{m.title || '매물'}</b>
                                <div>
                                    보증금 {m.deposit?.toLocaleString?.() ?? '-'} / 월세{' '}
                                    {m.monthly_fee?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                        )}
                    </MapMarker>
                ))}
            </Map>
        </div>
    );
}