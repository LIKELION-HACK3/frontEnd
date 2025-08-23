import heart from '../../assets/pic/heart.svg';
import { ReactComponent as HeartSvg } from '../../assets/pic/heart.svg';
import { useEffect, useState } from 'react';
import { toggleBookmark } from '../../apis/bookmarks';
import { loadAuth } from '../../apis/auth';

const BookMark = ({
    roomId,
    filled = false,
    onToggle,
    stopPropagation = true,
    placement = 'top-right',
    variant = 'badge',
    size = 24,
    interactive
}) => {
    const [isOn, setIsOn] = useState(!!filled);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setIsOn(!!filled);
    }, [filled]);

    const isInteractive = interactive === undefined ? variant === 'badge' : interactive;

    const handleClick = async (e) => {
        if (!isInteractive) return;
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

    if (variant === 'inline') {
        return (
            <span
                onClick={isInteractive ? handleClick : undefined}
                aria-pressed={isInteractive ? isOn : undefined}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 2, height: size + 2 }}
            >
                <HeartSvg
                    width={size}
                    height={size}
                    fill={isOn ? '#FFFFFF' : 'none'}
                    stroke={isOn ? 'none' : '#FFFFFF'}
                    strokeWidth={1}
                    style={{ overflow: 'visible', display: 'block' }}
                />
            </span>
        );
    }

    const iconStyle = {
        width: size,
        height: size,
        backgroundColor: isOn ? '#F35588' : '#DDDDDD',
        WebkitMask: `url(${heart}) no-repeat center / contain`,
        mask: `url(${heart}) no-repeat center / contain`,
        display: 'block',
        transition: 'background-color 120ms ease-in-out'
    };

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
                width: size + 12,
                height: size + 12,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                display: 'grid',
                placeItems: 'center',
                cursor: busy ? 'default' : 'pointer'
            }}
        >
            <span style={iconStyle} />
        </button>
    );
};

export default BookMark;