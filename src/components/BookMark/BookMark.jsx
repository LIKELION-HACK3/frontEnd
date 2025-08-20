import heart from '../../assets/pic/heart.svg';
import { useEffect, useState } from 'react';
import { toggleBookmark } from '../../apis/bookmarks';
import { loadAuth } from '../../apis/auth';

const BookMark = ({ roomId, filled = false, onToggle, stopPropagation = true, placement = 'top-right' }) => {
    const [isOn, setIsOn] = useState(!!filled);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setIsOn(!!filled);
    }, [filled]);

    const handleClick = async (e) => {
        if (stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (busy) return;

        const auth = loadAuth();
        if (!auth || !auth.access) {
            alert('로그인 후 북마크를 이용하실 수 있습니다');
            return;
        }

        const next = !isOn;
        setIsOn(next);
        onToggle?.(next);

        if (!roomId) return;
        setBusy(true);

        try {
            const res = await toggleBookmark(roomId);
            if (res?.action === 'added' && !next) setIsOn(true);
            if (res?.action === 'removed' && next) setIsOn(false);
        } catch (err) {
            setIsOn(!next);
            onToggle?.(!next);
            alert(err?.message || '북마크 처리에 실패했습니다.');
        } finally {
            setBusy(false);
        }
    };

    const iconStyle = {
        width: 24,
        height: 24,
        backgroundColor: isOn ? '#F35588' : '#DDDDDD',
        WebkitMask: `url(${heart}) no-repeat center / contain`,
        mask: `url(${heart}) no-repeat center / contain`,
        display: 'block',
        transition: 'background-color 120ms ease-in-out',
    }

    const placementStyle =
        placement === 'bottom-right' ? { right: 12, bottom: 12 } :
        placement === 'bottom-left'  ? { left: 12, bottom: 12 } :
        placement === 'top-left'     ? { left: 12, top: 12 } :
                                       { right: 12, top: 12 };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={isOn}
            aria-label={isOn ? '북마크 해제' : '북마크 추가'}
            disabled={busy}
            style={{
                position: 'absolute',
                ...placementStyle,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                display: 'grid',
                placeItems: 'center',
                cursor: busy ? 'default' : 'pointer',
                transition: 'transform 120ms',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            <span style={iconStyle} />
        </button>
    );
};

export default BookMark;
