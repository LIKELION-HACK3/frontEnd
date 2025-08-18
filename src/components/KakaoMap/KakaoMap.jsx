import styles from './KakaoMap.module.css';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

export default function KakaoMap({ rooms = [], selectedId = null, onMarkerClick, onVisibleChange }) {
    const FALLBACK_CENTER = { lat: 37.597607, lng: 127.058836 };
    const [center, setCenter] = useState(FALLBACK_CENTER);

    const [map, setMap] = useState(null);

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

    const updateVisible = useCallback(() => {
        if (!map || !onVisibleChange) return;
        const bounds = map.getBounds();
        if (!bounds) return;
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const inViewIds = markers
            .filter((m) => (
                m.position.lat >= sw.getLat() &&
                m.position.lat <= ne.getLat() &&
                m.position.lng >= sw.getLng() &&
                m.position.lng <= ne.getLng()
            ))
            .map((m) => m.id);

            onVisibleChange(inViewIds);
    }, [map, markers, onVisibleChange]);

    useEffect(() => {
        updateVisible();
    }, [updateVisible]);

    /* 카카오 맵 출력 */
    return (
        <div className={styles.map__wrapper}>
            <Map center={center} isPanto className={styles.kakaoMap} level={4} onCreate={setMap} onCenterChanged={updateVisible} onZoomChanged={updateVisible}>
                {markers.map((m) => (
                    <MapMarker
                        key={m.id}
                        position={m.position}
                        onClick={() => {
                            setCenter(m.position);
                            onMarkerClick && onMarkerClick(m.id);
                        }}
                    />
                ))}
            </Map>
        </div>
    );
}