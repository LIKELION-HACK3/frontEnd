// src/components/FavoriteHeart.jsx
import React from 'react';

const FavoriteHeart = ({ filled, onToggle }) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={filled}
            aria-label={filled ? '찜 해제' : '찜하기'}
            style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'transform 120ms',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {/* SVG 하트: filled면 채움, 아니면 테두리 */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={filled ? '#ff477e' : 'none'}
                stroke={filled ? '#ff477e' : '#222'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
    );
};

export default FavoriteHeart;
