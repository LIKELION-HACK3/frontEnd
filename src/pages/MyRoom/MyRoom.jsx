import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyRoom.module.css';
import BookMark from '../../components/BookMark/BookMark';
import { fetchAllBookmarks, toggleBookmark } from '../../apis/bookmarks';
import { createAiReport, fetchAiReport } from '../../apis/aiApi';
import leftArrow from '../../assets/pic/left_arrow.svg';
import rightArrow from '../../assets/pic/right_arrow.svg';
import moneyIcon from '../../assets/pic/property_money.svg';
import locationIcon from '../../assets/pic/property_location.svg';
import roomsIcon from '../../assets/pic/property_rooms.svg';
import plusIcon from '../../assets/pic/myroom_plus.svg';

import AiReportResult from '../AiReport/AiReportResult';


const fmtMoney = (v) => {
    if (v == null || v === '') return '-';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n >= 10000 ? `${Math.round(n / 10000).toLocaleString()}` : `${n.toLocaleString()}`;
};

const toPyeong = (sqm) => {
    if (sqm === '' || sqm == null) return '-';
    const n = Number(sqm);
    if (!Number.isFinite(n)) return '-';
    if (n === 0) return '0평';
    return `${Math.floor(n / 3.305785)}평`;
};

const safeString = (v, fallback = '-') => {
    if (v == null) return fallback;
    const s = String(v).trim();
    return s === '' ? fallback : s;
};

const MyRoom = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [favoriteRoomIds, setFavoriteRoomIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(new Set());
    const [selectedForReport, setSelectedForReport] = useState([null, null]);
    const [additionalCriteria, setAdditionalCriteria] = useState(null);
    const [weights, setWeights] = useState({ price: 0, location: 0, area: 0 });
    const [userPreference, setUserPreference] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [reportData, setReportData] = useState(null);
    const bookmarksSectionRef = useRef(null);
    const scrollToBookmarks = () => {
        bookmarksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const hasTwoRooms = selectedForReport.filter(Boolean).length === 2;
    const hasWeights = (weights.price + weights.location + weights.area) > 0;
    const hasCriteria = !!additionalCriteria;
    const hasPreference = userPreference.trim().length > 0;
    const isReadyToGenerate = hasTwoRooms && hasWeights && hasCriteria && hasPreference;

    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const list = await fetchAllBookmarks();
            setBookmarks(list);
            setFavoriteRoomIds(
                new Set(list.map((bm) => bm?.room?.id).filter((id) => id !== null && id !== undefined))
            );
        } catch (e) {
            alert(e.message || '북마크를 불러오지 못했습니다.');
            setBookmarks([]);
            setFavoriteRoomIds(new Set());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookmarks();
    }, []);

    const rooms = useMemo(() => bookmarks.map((bm) => bm.room).filter(Boolean), [bookmarks]);

    const pages = useMemo(() => {
        const chunked = [];
        for (let i = 0; i < rooms.length; i += 6) {
            chunked.push(rooms.slice(i, i + 6));
        }
        if (chunked.length === 0) chunked.push([]);
        return chunked;
    }, [rooms]);

    useEffect(() => {
        // Ensure current pageIndex is valid when pages change.
        // Include pageIndex in deps to satisfy eslint rule, but only update when necessary to avoid loop.
        const maxIdx = Math.max(0, pages.length - 1);
        if (pageIndex > maxIdx) {
            setPageIndex(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pages.length, pageIndex]);

    const maxPageIndex = Math.max(0, pages.length - 1);
    const isPrevDisabled = pageIndex === 0;
    const isNextDisabled = pageIndex >= maxPageIndex;

    const handlePrevPage = () => {
        if (!isPrevDisabled) setPageIndex((i) => i - 1);
    };

    const handleNextPage = () => {
        if (!isNextDisabled) setPageIndex((i) => i + 1);
    };

    const onToggle = async (roomId) => {
        if (toggling.has(roomId)) return;
        setToggling(new Set(toggling).add(roomId));
        try {
            const optimistic = new Set(favoriteRoomIds);
            if (optimistic.has(roomId)) optimistic.delete(roomId);
            else optimistic.add(roomId);
            setFavoriteRoomIds(optimistic);
            await toggleBookmark(roomId);
            await loadBookmarks();
        } catch (e) {
            alert(e.message || '찜 처리에 실패했습니다.');
            await loadBookmarks();
        } finally {
            const done = new Set(toggling);
            done.delete(roomId);
            setToggling(done);
        }
    };

    const handleSelectForReport = (room) => {
        setSelectedForReport((prev) => {
            if (prev.some((r) => r?.id === room.id)) {
                return prev.map((r) => (r?.id === room.id ? null : r));
            }
            const emptyIndex = prev.indexOf(null);
            if (emptyIndex !== -1) {
                const next = [...prev];
                next[emptyIndex] = room;
                return next;
            }
            alert('최대 2개의 집만 선택할 수 있습니다.');
            return prev;
        });
    };

    const handleCancelSelection = (index) => {
        setSelectedForReport((prev) => {
            const next = [...prev];
            if (index === 0) {
                if (next[1]) {
                    next[0] = next[1];
                    next[1] = null;
                } else {
                    next[0] = null;
                }
            } else {
                next[1] = null;
            }
            return next;
        });
    };

    const handleWeightChange = (key, value) => {
        setWeights((prev) => ({ ...prev, [key]: value }));
    };

    const renderStars = (ratingKey) => (
        <div className={styles.stars} role="radiogroup" aria-label={`${ratingKey} 가중치`}>
            {[1, 2, 3, 4, 5].map((n) => {
                const active = n <= weights[ratingKey];
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => handleWeightChange(ratingKey, n)}
                        role="radio"
                        aria-checked={active}
                        className={styles.starButton}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleWeightChange(ratingKey, n);
                        }}
                    >
                        <Star className={`${styles.starIcon} ${active ? styles.starIconFilled : styles.starIconEmpty}`} />
                    </button>
                );
            })}
        </div>
    );

    const handleGenerateReport = async () => {
        if (selectedForReport.includes(null)) {
            alert('비교할 집 2개를 모두 선택해주세요.');
            return;
        }
        const totalWeight = weights.price + weights.location + weights.area;
        if (totalWeight === 0) {
            alert('가중치를 하나 이상 설정해주세요.');
            return;
        }
        setIsGenerating(true);
        const apiData = {
            room_a_id: selectedForReport[0].id,
            room_b_id: selectedForReport[1].id,
            comparison_criteria: {
                price_weight: weights.price / totalWeight,
                location_weight: weights.location / totalWeight,
                area_weight: weights.area / totalWeight
            },
            user_preferences: userPreference
        };
        try {
            const reportResult = await createAiReport(apiData);
            const reportId = reportResult.id;
            if (reportId) {
                const detail = await fetchAiReport(reportId);
                setReportData(detail);
                setTimeout(() => {
                    const el = document.getElementById('ai-report-result');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            } else {
                alert('리포트 ID를 받지 못했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.myPage}>
            <div className={styles.topHeader}>
                <h1 className={styles.title}>MY 룸 목록</h1>
                <p className={styles.subtitle}>관심 있는 집들을 한번에 확인해보세요.</p>
            </div>
            <div className={styles.section} ref={bookmarksSectionRef}>
                {loading ? (
                    <p className={styles.subtitle}>불러오는 중…</p>
                ) : (
                    <div className={styles.carousel}>
                        <img
                            src={leftArrow}
                            alt="이전"
                            className={`${styles.slider} ${isPrevDisabled ? styles.sliderDisabled : ''}`}
                            onClick={handlePrevPage}
                        />
                        <div className={styles.viewport}>
                            <div
                                className={styles.track}
                                style={{ transform: `translateX(-${pageIndex * 100}%)` }}
                            >
                                {pages.map((pageRooms, idx) => {
                                    const items = [...pageRooms];
                                    while (items.length < 6) {
                                        items.push({ __empty: true, _key: `empty-${idx}-${items.length}` });
                                    }
                                    return (
                                        <div className={styles.page} key={idx}>
                                            <div className={styles.propertyGrid}>
                                                {items.map((item) => {
                                                    if (item.__empty) {
                                                        return (
                                                            <div key={item._key} className={styles.cardWrapper}>
                                                                <div className={`${styles.propertyCard} ${styles.propertyCardEmpty}`}>
                                                                    <div className={styles.emptyCardBody}>
                                                                        북마크로 원하는 매물을 추가하세요
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`${styles.selectButton} ${styles.selectButtonDisabledGray}`}
                                                                    disabled
                                                                    aria-disabled="true"
                                                                >
                                                                    AI 리포트 선택
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    const room = item;
                                                    const isSelected = selectedForReport.some((r) => r?.id === room.id);
                                                    const isJeonse =
                                                        room.contract_type === '전세' ||
                                                        Number(room?.monthly_fee) === 0 ||
                                                        room?.monthly_fee == null;
                                                    return (
                                                        <div key={room.id} className={styles.cardWrapper}>
                                                            <div className={styles.propertyCard}>
                                                                <BookMark
                                                                    filled={favoriteRoomIds.has(room.id)}
                                                                    onToggle={() => onToggle(room.id)}
                                                                />
                                                                <div className={styles.cardPic}>
                                                                    <img
                                                                        src={room.thumbnail_url || 'https://via.placeholder.com/160'}
                                                                        alt={room.title}
                                                                        className={styles.cardImg}
                                                                    />
                                                                </div>
                                                                <div className={styles.cardBody}>
                                                                    <div className={styles.info1}>
                                                                        {isJeonse ? (
                                                                            <>
                                                                                <span className={styles.text1}>전세 </span>
                                                                                <span className={styles.deposit}>{fmtMoney(room.deposit)}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className={styles.text1}>월세 </span>
                                                                                <span className={styles.deposit}>{fmtMoney(room.deposit)}</span>
                                                                                <span className={styles.text2}>/</span>
                                                                                <span className={styles.monthlyFee}>{fmtMoney(room.monthly_fee)}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className={styles.info2}>
                                                                        <span className={styles.text3}>관리비 </span>
                                                                        <span className={styles.maintenance}>{fmtMoney(room.maintenance_cost)}</span>
                                                                    </div>
                                                                    <div className={styles.info3}>
                                                                        <span>{safeString(room?.room_type)}</span>
                                                                        <span className={styles.dot}>ㆍ</span>
                                                                        <span>{room?.floor ?? '-'}</span>
                                                                        <span className={styles.dot}>ㆍ</span>
                                                                        <span>{toPyeong(room?.real_area)}</span>
                                                                    </div>
                                                                    <div className={styles.info4}>
                                                                        <div className={styles.titleText}>{room.title || ''}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className={`${styles.selectButton} ${isSelected ? styles.selected : ''}`}
                                                                onClick={() => handleSelectForReport(room)}
                                                            >
                                                                {isSelected ? '선택됨' : 'AI 리포트 선택'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <img
                            src={rightArrow}
                            alt="다음"
                            className={`${styles.slider} ${isNextDisabled ? styles.sliderDisabled : ''}`}
                            onClick={handleNextPage}
                        />
                    </div>
                )}
            </div>
            <div className={`${styles.section} ${styles.aiSectionWrapper}`}>
                <div className={styles.aiSection}>
                    <div className={styles.aiLeft}>
                        <h1 className={styles.title}>AI 리포트 받아보기</h1>
                        <p className={styles.subtitle}>2개의 매물을 골라 AI에게 분석을 맡겨보세요.</p>
                        <div className={styles.reportSelectionGrid}>
                            {[0, 1].map((index) => {
                                const sel = selectedForReport[index];
                                return (
                                    <div key={index} className={styles.reportSelectionRow}>
                                        <div
                                            className={`${styles.reportSelectionCard} ${sel ? styles.reportSelectionCardSelected : ''}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={scrollToBookmarks}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToBookmarks(); }}
                                        >
                                            {!sel && <p className={styles.selectionTitle}>{`선택 ${index + 1}`}</p>}
                                            {sel ? (
                                                <div className={styles.selectedRoomInfo}>
                                                    <img
                                                        src={sel.thumbnail_url || 'https://via.placeholder.com/92'}
                                                        alt={safeString(sel.title, '')}
                                                        className={styles.selectedRoomImage}
                                                    />
                                                    <div className={styles.selectedRoomText}>
                                                        <p className={styles.selectedRoomPrice}>
                                                            {(() => {
                                                                const isJeonse =
                                                                    sel.contract_type === '전세' ||
                                                                    Number(sel?.monthly_fee) === 0 ||
                                                                    sel?.monthly_fee == null;
                                                                return isJeonse
                                                                    ? `전세 ${fmtMoney(sel.deposit)}`
                                                                    : `월세 ${fmtMoney(sel.deposit)}/${fmtMoney(sel.monthly_fee)}`;
                                                            })()}
                                                        </p>
                                                        <p className={styles.selectedRoomMaint}>
                                                            <span className={styles.text3}>관리비 </span>
                                                            <span className={styles.maintenance}>{fmtMoney(sel.maintenance_cost)}</span>
                                                        </p>
                                                        <p className={styles.selectedRoomMeta}>
                                                            <span>{safeString(sel?.room_type)}</span>
                                                            <span className={styles.dot}>ㆍ</span>
                                                            <span>{sel?.floor ?? '-'}</span>
                                                            <span className={styles.dot}>ㆍ</span>
                                                            <span>{toPyeong(sel?.real_area)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={styles.emptySelection} aria-label="집을 선택해 주세요">
                                                    <img src={plusIcon} alt="추가" className={styles.emptyIcon} />
                                                </div>
                                            )}
                                        </div>
                                        {sel && (
                                            <button
                                                type="button"
                                                className={styles.cancelButton}
                                                onClick={() => handleCancelSelection(index)}
                                                aria-label="선택 해제"
                                                title="선택 해제"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.aiRight}>
                        <div className={styles.criteriaGroup}>
                            <h4 className={styles.groupTitle}>가중치 설정</h4>
                            <div className={styles.weightGroup}>
                                <div className={styles.weightItem}>
                                    <div className={styles.ratingLabel}>
                                        <div className={styles.iconCircle}>
                                            <img src={moneyIcon} alt="가격" className={styles.icon} />
                                        </div>
                                        <span className={styles.labelText}>가격</span>
                                    </div>
                                    {renderStars('price')}
                                </div>
                                <div className={styles.weightItem}>
                                    <div className={styles.ratingLabel}>
                                        <div className={styles.iconCircle}>
                                            <img src={locationIcon} alt="위치" className={styles.icon} />
                                        </div>
                                        <span className={styles.labelText}>위치</span>
                                    </div>
                                    {renderStars('location')}
                                </div>
                                <div className={styles.weightItem}>
                                    <div className={styles.ratingLabel}>
                                        <div className={styles.iconCircle}>
                                            <img src={roomsIcon} alt="면적" className={styles.icon} />
                                        </div>
                                        <span className={styles.labelText}>면적</span>
                                    </div>
                                    {renderStars('area')}
                                </div>
                            </div>
                        </div>
                        <div className={styles.criteriaGroup}>
                            <h4 className={styles.groupTitle}>추가 기준</h4>
                            <div className={styles.radioGroup}>
                                {['지도', '편의시설', '보안', '층수'].map((item) => (
                                    <label key={item} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="criteria"
                                            value={item}
                                            checked={additionalCriteria === item}
                                            onChange={(e) => setAdditionalCriteria(e.target.value)}
                                        />
                                        <span className={styles.radioText}>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.preferenceSection}>
                    <h4 className={styles.groupTitle}>사용자 선호 입력</h4>
                    <textarea
                        className={styles.preferenceTextarea}
                        value={userPreference}
                        onChange={(e) => setUserPreference(e.target.value)}
                        placeholder="중요하게 생각하는 점이나 특별한 요청사항을 자유롭게 작성해주세요."
                    />
                </div>
                <button
                    className={`${styles.generateButton} ${isReadyToGenerate ? styles.generateButtonActive : styles.generateButtonDisabled}`}
                    onClick={isReadyToGenerate ? handleGenerateReport : undefined}
                    disabled={!isReadyToGenerate || isGenerating}
                    aria-disabled={!isReadyToGenerate || isGenerating}
                >
                    {isGenerating ? '리포트 생성 중...' : 'AI 리포트 생성하기'}
                </button>
            </div>

            {/* 결과 표시 영역 */}
            {reportData && (
                <div id="ai-report-result" className={`${styles.section} ${styles.sectionColumn}`}>
                    <div className={styles.resultHeaderBox}>
                        <h2 className={styles.resultHeaderTitle}>AI 비교 결과</h2>
                        <p className={styles.resultHeaderSubtitle}>유니룸의 AI 추천은 다음과 같아요.</p>
                    </div>
                    <AiReportResult data={reportData} hideHeader />
                </div>
            )}
        </div>
    );
};

export default MyRoom;