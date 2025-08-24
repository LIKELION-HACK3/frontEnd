import React, { useState, useEffect } from 'react';
import { createCommunityPost } from '../../../apis/communityApi';
import styles from './CommunityWriteModal.module.css';

const CATEGORY_OPTIONS = [
    { value: '구해요', label: '구해요' },
    { value: '동네 소식', label: '동네 소식' },
    { value: '자취 꿀팁', label: '자취 꿀팁' },
    { value: '기타', label: '기타' },
];

const REGION_OPTIONS = [
    { value: '이문동', label: '이문동' },
    { value: '회기동', label: '회기동' },
    { value: '휘경동', label: '휘경동' },
    { value: '청량리동', label: '청량리동' },
    { value: '제기동', label: '제기동' },
];

const CommunityWriteModal = ({ isOpen, onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('구해요');
    const [region, setRegion] = useState('이문동');
    const [anonymous, setAnonymous] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
            setCategory('구해요');
            setRegion('이문동');
            setAnonymous(false);
            setError('');
            setAttemptedSubmit(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);

        if (!title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const normalizedCategory = category.replace(/\s+/g, '');
            const postData = {
                title: title.trim(),
                content: content.trim(),
                region,
                category: normalizedCategory,
            };
            if (anonymous) {
                postData.anonymous = true;
            }

            const created = await createCommunityPost(postData);
            // 프론트 전용 익명 처리: 로컬에 익명 게시글 id 저장
            if (anonymous && created?.id != null) {
                try {
                    const raw = localStorage.getItem('anonymous_posts');
                    const list = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
                    if (!list.includes(created.id)) {
                        const next = [...list, created.id];
                        localStorage.setItem('anonymous_posts', JSON.stringify(next));
                    }
                } catch {
                    localStorage.setItem('anonymous_posts', JSON.stringify([created.id]));
                }
            } else if (anonymous) {
                // 백엔드가 id를 반환하지 않는 경우 대비: 제목/시간 기반 식별 저장
                const entry = { title: String(title).slice(0, 100), createdAt: new Date().toISOString() };
                try {
                    const raw = localStorage.getItem('anonymous_titles');
                    const list = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
                    const next = [entry, ...list].slice(0, 20);
                    localStorage.setItem('anonymous_titles', JSON.stringify(next));
                } catch {
                    localStorage.setItem('anonymous_titles', JSON.stringify([entry]));
                }
            }
            alert('게시글이 성공적으로 등록되었습니다.');
            onPostCreated?.();
            onClose?.();
        } catch (err) {
            setError(err?.message || '게시글 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const titleInvalid = attemptedSubmit && !title.trim();
    const contentInvalid = attemptedSubmit && !content.trim();

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                {/* 왼쪽 사이드바 - 지역 */}
                <div className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>나의 지역</h3>
                    <p className={styles.sidebarSubtitle}>서울특별시 동대문구</p>

                    <div className={styles.regionList}>
                        {REGION_OPTIONS.map((opt) => {
                            const id = `region-${opt.value}`;
                            const selected = region === opt.value;
                            return (
                                <label key={opt.value} className={styles.radioLabel}>
                                    <input id={id} type="radio" name="write_region" value={opt.value} checked={selected} onChange={() => setRegion(opt.value)} />
                                    <span className={styles.radioText}>{opt.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 오른쪽 메인 영역 */}
                <div className={styles.mainContent}>
                    <h2 className={styles.mainTitle}>글 제목</h2>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${styles.titleInput} ${titleInvalid ? styles.invalid : ''}`}
                        placeholder="제목을 입력하세요."
                    />

                    {/* 익명 옵션 - 제목 아래로 이동 */}
                    <label className={styles.radioLabel} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
                        <input
                            type="checkbox"
                            checked={anonymous}
                            onChange={(e) => setAnonymous(e.target.checked)}
                        />
                        <span style={{ marginLeft: 6 }}>익명으로 작성</span>
                    </label>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`${styles.textarea} ${contentInvalid ? styles.invalid : ''}`}
                        placeholder="본문 글을 이곳에 작성해보세요."
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.bottomBar}>
                        {/* 카테고리 선택 */}
                        <div className={styles.categorySection}>
                            <span className={styles.categoryLabel}>카테고리</span>
                            <div className={styles.radioGroupHorizontal}>
                                {CATEGORY_OPTIONS.map((opt) => {
                                    const id = `category-${opt.value}`;
                                    const selected = category === opt.value;
                                    return (
                                        <label key={opt.value} className={styles.radioLabel}>
                                            <input id={id} type="radio" name="write_category" value={opt.value} checked={selected} onChange={() => setCategory(opt.value)} />
                                            <span className={styles.radioText}>{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 제출 버튼 */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={styles.submitButton}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <span className={styles.spinner} aria-hidden="true" />
                            ) : (
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54288L12.1086 9.27005C11.8131 9.56562 11.61 9.94206 11.5298 10.352L11 13L13.648 12.4702C14.058 12.3901 14.4344 12.187 14.7299 11.8914L20.4571 6.16422C21.181 5.44037 21.181 4.26676 20.4571 3.54291L19.4571 2.54291C18.7332 1.81906 17.5596 1.81906 16.8358 2.54291L17.8358 3.54288Z"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M19 12C19 16.4183 15.4183 20 11 20H5C3.89543 20 3 19.1046 3 18V7C3 5.89543 3.89543 5 5 5H8"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityWriteModal;
