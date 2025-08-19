// src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';

import FavoriteHeart from '../../pages/MyRoom/FavoriteHeart';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';
import { loadAuth } from '../../apis/auth';

// 금액 변환 함수 (억/만원 단위)
const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '0원';

    const eok = Math.floor(num / 100000000); // 억
    const man = Math.floor((num % 100000000) / 10000); // 만원

    if (eok > 0 && man > 0) return `${eok}억 ${man}`;
    if (eok > 0) return `${eok}억`;
    return `${man}`;
};

const getRandomUniqueIds = (count, min, max) => {
    const s = new Set();
    while (s.size < count) {
        s.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return [...s];
};

/** 개별 방 카드 */
const RoomCard = ({ room, isFav, onToggle, onClick }) => {
    const imageUrl = room.images && room.images.length > 0 ? room.images[0].image_url : '';

    // 월세일 때: 보증금/월세, 전세일 때: 보증금만
    const priceLabel =
        room.contract_type === '전세'
            ? `전세 ${formatPrice(room.deposit)}`
            : `월세 ${formatPrice(room.deposit)} / ${formatPrice(room.monthly_fee)}`;

    return (
        <div
            className={styles.room__card}
            style={{ position: 'relative' }}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick();
            }}
        >
            <img src={imageUrl} alt={room.title} className={styles.room__image} />

            {/* 하트 버튼 */}
            <FavoriteHeart
                filled={isFav}
                onToggle={(e) => {
                    e.stopPropagation();
                    onToggle(room.id);
                }}
            />

            <div className={styles.room__details}>
                {/* 제목은 유지(숨기고 싶으면 CSS에서 .room__title {display:none;} ) */}
                <h3 className={styles.room__title}>{room.title}</h3>

                {/* ✅ 1) 가격 먼저 */}
                <p className={styles.room__price}>{priceLabel}</p>

                {/* ✅ 2) 방 형식 / 면적 */}
                <p className={styles.room__info}>
                    {room.room_type} | {room.real_area}㎡
                </p>

                {/* ✅ 3) 위치(주소) */}
                <p className={styles.room__address}>{room.address}</p>
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roomType, setRoomType] = useState('');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [favoriteRoomIds, setFavoriteRoomIds] = useState(new Set());
    const [syncing, setSyncing] = useState(false);

    const [randomRooms, setRandomRooms] = useState([]);
    const RANDOM_MIN_ID = 1;
    const RANDOM_MAX_ID = 209;

    const fetchRoomById = async (id) => {
        try {
            const res = await axios.get(`https://www.uniroom.shop/api/rooms/${id}/`);
            return res.data;
        } catch (e) {
            if (e?.response?.status !== 404) console.error('fetchRoomById error:', id, e);
            return null;
        }
    }

    const fetchRooms = async (query = '', type = '') => {
        setLoading(true);
        try {
            const picked = getRandomUniqueIds(3, RANDOM_MIN_ID, RANDOM_MAX_ID);
            const first = await Promise.all(picked.map(fetchRoomById));
            let valid = first.filter(Boolean);

            let attempts = 0;
            const tried = new Set(picked);
            while (valid.length < 3 && attempts < 30) {
                const [nextId] = getRandomUniqueIds(1, RANDOM_MIN_ID, RANDOM_MAX_ID);
                if (tried.has(nextId)) { attempts++; continue; }
                tried.add(nextId);
                const r = await fetchRoomById(nextId);
                if (r) valid.push(r);
                attempts++;
            }

            setRandomRooms(valid.slice(0, 3));
        } catch (e) {
            console.error('fetchRandomRooms error:', e);
            setRandomRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        try {
            const list = await fetchAllBookmarks();
            setFavoriteRoomIds(new Set(list.map((bm) => bm?.room?.id).filter((id) => id !== null && id !== undefined)));
        } catch (e) {
            console.error(e);
            setFavoriteRoomIds(new Set());
        }
    };

    useEffect(() => {
        const authData = loadAuth();
        if (authData && authData.user) {
            setUser(authData.user);
        }

        fetchRooms();
        if (authData && authData.access) {
            loadBookmarks();
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRooms(searchQuery, roomType);
    };

    const handleRoomTypeFilter = (type) => {
        const nextType = roomType === type ? '' : type;
        setRoomType(nextType);
        fetchRooms(searchQuery, nextType);
    };

    // --- 하트 토글 (수정된 부분) ---
    const handleToggle = async (roomId) => {
        const authData = loadAuth();
        if (!authData || !authData.access) {
            alert('로그인이 필요한 기능입니다.');
            navigate('/login');
            return;
        }

        if (syncing) return;
        setSyncing(true);

        // 낙관적 업데이트
        setFavoriteRoomIds((prev) => {
            const next = new Set(prev);
            if (next.has(roomId)) next.delete(roomId);
            else next.add(roomId);
            return next;
        });

        try {
            await toggleBookmark(roomId);
            await loadBookmarks();
        } catch (e) {
            console.error(e);
            await loadBookmarks(); // 에러 발생 시 상태를 다시 동기화
            alert(e.message || '찜 처리에 실패했습니다.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className={styles.main__wrapper}>
            {/* 검색창 섹션 */}
            <div className={styles.home__container1}>
                <p className={styles.home__text1}>
                    <span className={styles.home__text1__shadow}>어떤 집을 찾고 계세요?</span>
                </p>
                <form className={styles.home__searchbox} onSubmit={handleSearch}>
                    <div className={styles.home__inputbox}>
                        <input
                            type="text"
                            placeholder="원하시는 지역명, 지하철역, 단지명(아파트명)을 입력해주세요"
                            className={styles.home__input}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className={styles.home__inputbutton} />
                    </div>
                    <div className={styles.home__buttons1}>
                        {['원룸', '투룸', '아파트', '빌라', '오피스텔'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`${styles.home__category} ${roomType === type ? styles.active : ''}`}
                                onClick={() => handleRoomTypeFilter(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </form>
            </div>

            {/* AI 추천 매물 섹션 */}
            <div className={styles.home__container2}>
                <p className={styles.home__text2}>
                    <span className={styles.home__text2__highlight}>{user ? user.username : '멋쟁이사자'}</span>
                    님께 주변 매물을 추천드려요.
                </p>

                <div className={styles.home__lists}>
                    {loading ? (
                        <p>추천 매물을 불러오는 중...</p>
                    ) : randomRooms.length > 0 ? (
                        randomRooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                isFav={favoriteRoomIds.has(room.id)}
                                onToggle={handleToggle}
                                onClick={() => navigate(`/property/${room.id}`)}
                            />
                        ))
                        ) : (
                        <p>추천 매물이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
