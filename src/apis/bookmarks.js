// src/apis/bookmarks.js
const BASE_URL = 'https://www.uniroom.shop';

function authHeaders() {
    const token = localStorage.getItem('accessToken'); // 프로젝트 저장 위치에 맞게 조정
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET /api/bookmarks/  (페이지네이션 + 합치기)
export async function fetchBookmarks({ page = 1, page_size = 50 } = {}) {
    const url = new URL('/api/bookmarks/', BASE_URL);
    url.searchParams.set('page', String(page));
    url.searchParams.set('page_size', String(page_size));

    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
    });
    if (!res.ok) throw new Error('북마크 목록을 불러오지 못했습니다.');
    return res.json(); // {count, next, previous, results:[{id, room:{...}, created_at}]}
}

export async function fetchAllBookmarks() {
    let page = 1;
    const all = [];
    while (true) {
        const data = await fetchBookmarks({ page, page_size: 50 });
        all.push(...(data.results || []));
        if (!data.next) break;
        page += 1;
    }
    return all;
}

// POST /api/bookmarks/{room_id}/toggle/
export async function toggleBookmark(roomId) {
    const res = await fetch(`${BASE_URL}/api/bookmarks/${roomId}/toggle/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
    });

    // 스웨거 명세: 201=추가됨, 200=해제됨, 404=방 없음
    if (res.status === 201) return { action: 'added' };
    if (res.status === 200) return { action: 'removed' };
    if (res.status === 404) throw new Error('방을 찾을 수 없습니다.');
    if (!res.ok) throw new Error('북마크 토글 실패');
    return { action: 'unknown' };
}
