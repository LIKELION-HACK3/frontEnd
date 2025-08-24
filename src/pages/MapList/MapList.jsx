import styles from './MapList.module.css';
import KakaoMap from '../../components/KakaoMap/KakaoMap';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchRooms, searchRooms } from '../../apis/roomsApi';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';
import downArrow from '../../assets/pic/down_arrow.svg';

const MapList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [visibleSet, setVisibleSet] = useState(null);
    const itemRefs = useRef(new Map());
    const listRef = useRef(null);
    const pendingScrollId = useRef(null);
    const [bookmarked, setBookmarked] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [fromSearch, setFromSearch] = useState(false);
    const [mapLevel, setMapLevel] = useState(4);

    useEffect(() => {
        if (location.state?.fromHome) setMapLevel(6);
    }, []);

    const handleMapSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        const trimmed = searchQuery.trim();
        if (trimmed) params.set('address', trimmed);
        else params.delete('address');
        navigate(`/map?${params.toString()}`, { replace: true });
        setMapLevel(4);
    };

    const [filters, setFilters] = useState({
        type: '',
        lease: '',
        price: '',
        size: '',
        floorLabel: '',
        floorNum: ''
    });

    const sqmToPyeongNum = (sqm) => {
        const n = Number(sqm);
        return Number.isFinite(n) ? n / 3.305785 : NaN;
    };

    const getFrontFloor = (floorStr) => {
        if (!floorStr) return null;
        const s = String(floorStr).trim();

        if (/(반지층|반지하|지하|\bB\d+)/i.test(s)) return -1;

        const front = s.split('/')[0];
        const m = front.match(/-?\d+/);
        return m ? parseInt(m[0], 10) : null;
    };

    const isSemiBasement = (floorStr, typeStr) => {
        const s1 = String(floorStr || '');
        const s2 = String(typeStr || '');
        if (/(반지층|반지하|지하|\bB\d+)/i.test(s1)) return true;
        if (/(반지층|반지하)/i.test(s2)) return true;
        const fr = getFrontFloor(floorStr);
        return fr != null && fr <= 0;
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams(location.search);
                const address = params.get('address') || '';
                const room_type = params.get('room_type') || '';
                setSearchQuery(address);
                const isSearch = Boolean(address || room_type);
                setFromSearch(isSearch);
                if (isSearch) {
                    const data = await searchRooms({ address, room_type, page: 1, page_size: 100 });
                    setRooms(Array.isArray(data?.rooms) ? data.rooms : []);
                } else {
                    const data = await fetchRooms();
                    setRooms(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                setError(err);
                setRooms([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [location.search]);

    useEffect(() => {
        (async () => {
            try {
                const all = await fetchAllBookmarks();
                const ids = new Set(
                    (all || []).map((b) => 
                        typeof b.room === 'object' ? b.room?.id : b.room
                    ).filter(Boolean)
                );  
                setBookmarked(ids);
            } catch (e) {
                console.warn('bookmark init failed', e);
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
        return Number.isFinite(n) ? `${Math.floor(n / 3.305785)}평` : '-';
    };

    const toManwon = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return NaN;
        return n >= 10000 ? n / 10000 : n;
    };

    const handleMarkerClick = useCallback((id) => {
        setSelectedId(id);
        pendingScrollId.current = id;
    }, []);

    const centerCardNow = (id) => {
        const container = listRef.current;
        const el = itemRefs.current.get(id);
        if (!container || !el) return false;
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        const targetTop = container.scrollTop + (eRect.top - cRect.top) - (container.clientHeight - el.clientHeight) / 2;
        container.scrollTop = Math.max(0, targetTop);
        const afterERect = el.getBoundingClientRect();
        const centerDiff = Math.abs((afterERect.top + afterERect.height / 2) - (cRect.top + cRect.height / 2));
        return centerDiff <= 2;
    };

    useEffect(() => {
        const id = selectedId;
        if (!id || !visibleSet || pendingScrollId.current !== id) return;
        if (!visibleSet.has(id)) return;

        let attempts = 0;
        const MAX_ATTEMPTS = 6;

        const tick = () => {
            attempts += 1;
            const ok = centerCardNow(id);
            if (ok || attempts >= MAX_ATTEMPTS) {
                pendingScrollId.current = null;
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [visibleSet, selectedId]);

    const handleVisibleChange = useCallback((ids) => {
        setVisibleSet(prev => {
            const next = new Set(ids);
            if (prev && next.size === prev.size && ids.every(v => prev.has(v))) return prev;
            return next;
        });
    }, []);

    useEffect(() => {
        if (visibleSet && selectedId && !visibleSet.has(selectedId)) {
            setSelectedId(null);
        }
    }, [visibleSet, selectedId]);

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
        navigate(`/property/${id}`);
    };

    useEffect(() => {
         setVisibleSet(null);
    }, [sel.type, sel.lease, sel.price, sel.size, sel.floorLabel, sel.floorNum]);

    const filteredRooms = rooms.filter((r) => {
        const { type, lease, price, size, floorLabel, floorNum } = sel;
        if (type && (r.room_type || '').trim() !== type) return false;
        const monthly = Number(r?.monthly_fee);
        const deposit = Number(r?.deposit);
        if (lease === '월세') {
            if (!Number.isFinite(monthly) || monthly <= 0) return false;
        } else if (lease === '전세') {
            const monthlyIsZero = !Number.isFinite(monthly) || monthly === 0;
            if (!monthlyIsZero) return false;
        }
        if (sel.price) {
            const limit = Number(sel.price);
            if (Number.isFinite(limit)) {
                const raw = r?.monthly_fee;
                const monthlyMan = toManwon((raw === '' || raw == null) ? NaN : raw);
                if (!Number.isFinite(monthlyMan)) return false;
                if (monthlyMan > limit) return false;
            }
        }
        if (sel.size) {
            const base = Number(sel.size);
            if (Number.isFinite(base)) {
                const py = sqmToPyeongNum(r?.real_area);
                if (!Number.isFinite(py)) return false;
                if (py < base || py >= base + 1) return false;
            }
        }
        if (floorLabel === '반지하' || floorLabel === '반지층') {
            if (!isSemiBasement(r?.floor, r?.room_type)) return false;
        } else if (floorNum) {
            const want = parseInt(floorNum, 10);
            const fr = getFrontFloor(r?.floor);
            if (fr == null || fr !== want) return false;
        }
        return true;
    });

    const roomsToShow = visibleSet ? filteredRooms.filter(r => visibleSet.has(r.id)) : filteredRooms;

    const onClickBookmark = async (e, roomId) => {
        e.stopPropagation();
        e.preventDefault();

        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(roomId)) next.delete(roomId);
            else next.add(roomId);
            return next;
        });

        try {
            const res = await toggleBookmark(roomId);
            if (res.action === 'added') {
                setBookmarked((prev) => new Set(prev).add(roomId));
            } else if (res.action === 'removed') {
                setBookmarked((prev) => {
                    const next = new Set(prev);
                    next.delete(roomId);
                    return next;
                });
            }
        } catch (err) {
            setBookmarked((prev) => {
                const next = new Set(prev);
                if (next.has(roomId)) next.delete(roomId);
                else next.add(roomId);
                return next;
            });
            alert(err.message || '북마크 처리에 실패했습니다.');
        }
    };

    const isBookmarked = (id) => bookmarked.has(id);

    return (
        <div className={styles.main__wrapper}>
            <div className={styles.map__categorybox}>
                <div className={styles.map__categorybox2}>
                    <div className={styles.dropdown}>
                        <button type="button" className={styles.trigger} onClick={() => toggle('type')}>
                            <span className={`${styles.text} ${sel.type ? styles.active : ''}`}>
                                {sel.type || '방 종류'}
                            </span>
                            <img src={downArrow} alt="" className={styles.caretIcon} />
                        </button>
                        {openDrop.type && (
                            <div className={`${styles.menu} ${styles.menuNarrow}`} style={{ '--menu-hpad': '23px', '--option-hpad': '0px' }}>
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
                            <div className={`${styles.menu} ${styles.menuNarrow}`} style={{ '--menu-hpad': '24px', '--option-hpad': '9px' }}>
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
                <form className={styles.home__inputbox} onSubmit={handleMapSearch}>
                    <input
                        type="text"
                        placeholder="원하시는 지역명, 지하철역, 단지명(아파트명)을 입력해주세요"
                        className={styles.home__input}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.home__inputbutton} />
                </form>
            </div>
            <div className={styles.map__canvas}>
                <KakaoMap rooms={filteredRooms} selectedId={selectedId} onMarkerClick={handleMarkerClick} onVisibleChange={handleVisibleChange} level={mapLevel} />
                <div className={styles.map__showestate}>
                    <div className={styles.map__scrollarea} ref={listRef}>
                        {loading && <div>불러오는 중...</div>}
                        {error && <div>목록을 불러오지 못했습니다.</div>}

                        {!loading && !error && roomsToShow.map((r) => {
                            const firstImage = r?.images?.[0]?.image_url;
                            const isActive = selectedId === r.id;
                            const pressed = isBookmarked(r.id);
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
                                    <button
                                        type="button"
                                        className={`${styles.bookmarkBtn} ${styles.bookmarkBtnSm}`}
                                        onClick={(e) => onClickBookmark(e, r.id)}
                                        aria-pressed={pressed}
                                        aria-label={pressed ? '북마크 해제' : '북마크 추가'}>
                                        <span className={`${styles.bookmarkIcon} ${styles.bookmarkIconSm} ${pressed ? styles.bookmarkActive : ''}`} />
                                    </button>
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