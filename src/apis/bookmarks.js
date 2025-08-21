import api from './api';

export async function fetchBookmarks({ page = 1, page_size = 50 } = {}) {
    try {
        const response = await api.get('/api/bookmarks/', {
            params: { page: String(page), page_size: String(page_size) },
        });
        return response.data;
    } catch (error) {
        console.error('fetchBookmarks failed:', error.response || error);
        throw new Error('북마크 목록을 불러오지 못했습니다.');
    }
}

// 방 상세 데이터 조회
async function fetchRoomDetail(roomId) {
    const res = await api.get(`/api/rooms/${roomId}/`);
    return res.data;
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

    const needDetailIds = Array.from(
        new Set(
            all
                .map((bm) => bm?.room?.id)
                .filter((id, idx) => {
                    const r = all[idx]?.room;
                    return (
                        id != null &&
                        (r?.room_type === undefined ||
                            r?.floor === undefined ||
                            r?.real_area === undefined)
                    );
                })
        )
    );

    if (needDetailIds.length > 0) {
        const pairs = await Promise.all(
            needDetailIds.map(async (id) => {
                try {
                    const detail = await fetchRoomDetail(id);
                    return [id, detail];
                } catch (e) {
                    console.error('fetchRoomDetail failed:', id, e?.response || e);
                    return null;
                }
            })
        );

        const detailMap = new Map(pairs.filter(Boolean));
        for (const bm of all) {
            const rid = bm?.room?.id;
            const d = rid != null ? detailMap.get(rid) : null;
            if (d) {
                bm.room = { ...bm.room, ...d };
            }
        }
    }

    return all;
}

export async function toggleBookmark(roomId) {
    try {
        const response = await api.post(`/api/bookmarks/${roomId}/toggle/`, {});
        if (response.status === 201) return { action: 'added' };
        if (response.status === 200) return { action: 'removed' };
        return { action: 'unknown' };
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('방을 찾을 수 없습니다.');
        }
        console.error('toggleBookmark failed:', error.response || error);
        throw new Error('북마크 토글에 실패했습니다.');
    }
}