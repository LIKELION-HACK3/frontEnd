import styles from './MapList.module.css';
import KakaoMap from '../../components/KakaoMap/KakaoMap';
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchRooms } from '../../apis/roomsApi';

const MapList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [visibleSet, setVisibleSet] = useState(null);
    const itemRefs = useRef(new Map());

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchRooms();
                setRooms(Array.isArray(data) ? data : []);
            } catch (error) {
                setError(error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fmtMoney = (v) => {
        if (v == null || v === '') return '-';
        const n = Number(v);
        if (!Number.isFinite(n)) return String(v);
        return n >= 10000 ? `${Math.round(n / 10000).toLocaleString()}` : `${n.toLocaleString()}`;
    };

    const toPyeong = (sqm) => {
        const n = Number(sqm);
        return Number.isFinite(n) ? `${Math.round(n / 3.305785)}평` : '-';
    };

    const handleMarkerClick = useCallback((id) => {
        setSelectedId(id);
        const el = itemRefs.current.get(id);
        if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleVisibleChange = useCallback((ids) => {
        setVisibleSet(new Set(ids));
    }, []);

    useEffect(() => {
        if (visibleSet && selectedId && !visibleSet.has(selectedId)) {
            setSelectedId(null);
        }
    }, [visibleSet, selectedId]);

    const roomsToShow = visibleSet ? rooms.filter(r => visibleSet.has(r.id)) : rooms;

    return (
        <div className={styles.main__wrapper}>
            <div className={styles.map__categorybox} />
            <div className={styles.map__canvas}>
                <KakaoMap rooms={rooms} selectedId={selectedId} onMarkerClick={handleMarkerClick} onVisibleChange={handleVisibleChange} />
                <div className={styles.map__showestate}>
                    <div className={styles.map__scrollarea}>
                        {loading && <div>불러오는 중...</div>}
                        {error && <div>목록을 불러오지 못했습니다.</div>}

                        {!loading && !error && roomsToShow.map((r) => {
                            const firstImage = r?.images?.[0]?.image_url;
                            const isActive = selectedId === r.id;
                            return (
                                <div key={r.id} ref={(el) => {
                                        if (el) itemRefs.current.set(r.id, el);
                                        else itemRefs.current.delete(r.id);
                                    }}
                                    className={`${styles.map__showestates} ${isActive ? styles.isActive : ''}`}
                                    onClick={() => setSelectedId(r.id)}
                                    aria-current={isActive ? 'true' : 'false'}>
                                    <div className={styles.map__pic} aria-label="room thumbnail">
                                        {firstImage && (
                                            <img src={firstImage} alt="" className={styles.map__img} />
                                        )}
                                    </div>
                                    <div className={styles.map__info}>
                                        <div className={styles.map__info1}>
                                            <span className={styles.map__text1}>월세 </span>
                                            <span className={styles.map__deposit}>{fmtMoney(r.deposit)}</span>
                                            <span className={styles.map__text2}>/</span>
                                            <span className={styles.map__monthly_fee}>{fmtMoney(r.monthly_fee)}</span>
                                        </div>
                                        <div className={styles.map__info2}>
                                            <span className={styles.map__text3}>관리비 </span>
                                            <span className={styles.map__maintenance_cost}>{fmtMoney(r.maintenance_cost)}</span>
                                        </div>
                                        <div className={styles.map__info3}>
                                            <span className={styles.map__room_type}>{r.room_type || '-'}</span>
                                            <span className={styles.map__dot}>ㆍ</span>
                                            <span className={styles.map__floor}>{r.floor || '-'}</span>
                                            <span className={styles.map__dot}>ㆍ</span>
                                            <span className={styles.map__real_area}>{toPyeong(r.real_area)}</span>
                                        </div>
                                        <div className={styles.map__info4}>
                                            <div className={styles.map__title}>{r.title || ''}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapList;