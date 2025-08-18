import styles from './MapList.module.css';
import KakaoMap from '../../components/KakaoMap/KakaoMap';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../../apis/roomsApi';
import downArrow from '../../assets/pic/down_arrow.svg';

const MapList = () => {
    const navigate = useNavigate();
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

    const [openDrop, setOpenDrop] = useState({
        type: false,
        lease: false,
        price: false,
        size: false,
        floor: false,
    });

    const [sel, setSel] = useState({
        type: '',
        lease: '',
        price: '',
        size: '',
        floorLabel: '',
        floorNum: '',
    });

    const toggle = (key) => {
        setOpenDrop((prev) => {
            const nextOpen =! prev[key];
            return {
                type: false,
                lease: false,
                price: false,
                size: false,
                floor: false,
                [key]: nextOpen,
            };
        });
    };

    const pick = (key, value) => {
        setSel((p) => ({ ...p, [key]: value }));
        setOpenDrop((p) => ({ ...p, [key]: false }));
    };

    const resetAll = () => {
        setSel({ type:'', lease:'', price:'', size:'', floorLabel:'', floorNum:'' });
        setOpenDrop({ type:false, lease:false, price:false, size:false, floor:false });
    };

    const handleCardClick = (id) => {
        setSelectedId(id);
        navigate(`/property/${id}`);
    };

    return (
        <div className={styles.main__wrapper}>
            <div className={styles.map__categorybox}>
                <div className={styles.dropdown}>
                    <button type="button" className={styles.trigger} onClick={() => toggle('type')}>
                        <span className={`${styles.text} ${sel.type ? styles.active : ''}`}>
                            {sel.type || '방 종류'}
                        </span>
                        <img src={downArrow} alt="" className={styles.caretIcon} />
                    </button>
                    {openDrop.type && (
                        <div className={styles.menu}>
                            <div className={`${styles.option} ${sel.type === '원룸' ? styles.active : ''}`} onClick={() => pick('type', '원룸')}>
                                원룸
                            </div>
                            <div className={`${styles.option} ${sel.type === '투룸' ? styles.active : ''}`} onClick={() => pick('type', '투룸')}>
                                투룸
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.dropdown}>
                    <button type="button" className={styles.trigger} onClick={() => toggle('lease')}>
                        <span className={`${styles.text} ${sel.lease ? styles.active : ''}`}>
                            {sel.lease || '월세/전세'}
                        </span>
                        <img src={downArrow} alt="" className={styles.caretIcon} />
                    </button>
                    {openDrop.lease && (
                        <div className={styles.menu}>
                            <div className={`${styles.option} ${sel.lease === '월세' ? styles.active : ''}`} onClick={() => pick('lease', '월세')}>
                                월세
                            </div>
                            <div className={`${styles.option} ${sel.lease === '전세' ? styles.active : ''}`} onClick={() => pick('lease', '전세')}>
                                전세
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.dropdown}>
                    <button type="button" className={styles.trigger} onClick={() => toggle('price')}>
                        <span className={`${styles.text} ${sel.price ? styles.active : ''}`}>
                            {sel.price ? `${sel.price}만원 이하` : '가격'}
                        </span>
                        <img src={downArrow} alt="" className={styles.caretIcon} />
                    </button>
                    {openDrop.price && (
                        <div className={styles.menu}>
                            <div className={styles.inputRow}>
                                <input className={styles.input} type="number" min="0" placeholder="금액" value={sel.price} onChange={(e) => setSel((p) => ({ ...p, price: e.target.value }))} />
                                <span className={styles.suffix}>만원 이하</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.dropdown}>
                    <button type="button" className={styles.trigger} onClick={() => toggle('size')}>
                        <span className={`${styles.text} ${sel.size ? styles.active : ''}`}>
                            {sel.size ? `${sel.size}평대` : '방 크기'}
                        </span>
                        <img src={downArrow} alt="" className={styles.caretIcon} />
                    </button>
                    {openDrop.size && (
                        <div className={styles.menu}>
                            <div className={styles.inputRow}>
                                <input className={styles.input} type="number" min="0" placeholder="면적" value={sel.size} onChange={(e) => setSel((p) => ({ ...p, size: e.target.value }))} />
                                <span className={styles.suffix}>평대</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.dropdown}>
                    <button type="button" className={styles.trigger} onClick={() => toggle('floor')}>
                        <span className={`${styles.text} ${sel.floorLabel || sel.floorNum ? styles.active : ''}`}>
                            {sel.floorNum ? `${sel.floorNum}층` : (sel.floorLabel || '층수')}
                        </span>
                        <img src={downArrow} alt="" className={styles.caretIcon} />
                    </button>
                    {openDrop.floor && (
                        <div className={styles.menu}>
                            <div className={`${styles.option} ${sel.floorLabel === '반지하' ? styles.active : ''}`} onClick={() => { setSel((p) => ({ ...p, floorLabel: '반지하', floorNum: '' })); setOpenDrop((p) => ({ ...p, floor: false })); }}>
                                반지하
                            </div>
                            <div className={styles.inputRow} onClick={(e) => e.stopPropagation()}>
                                <input className={styles.input} type="number" placeholder="층" value={sel.floorNum} onChange={(e) => setSel((p) => ({ ...p, floorNum: e.target.value, floorLabel: '' }))} />
                                <span className={styles.suffix}>층</span>
                            </div>
                        </div>
                    )}
                </div>
                <button type="button" className={styles.resetAll} onClick={resetAll}>초기화</button>
            </div>
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
                                    onClick={() => handleCardClick(r.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') handleCardClick(r.id);
                                    }}
                                    role="button"
                                    tabIndex={0}
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