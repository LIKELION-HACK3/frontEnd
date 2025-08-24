import React, { useState } from 'react';
import styles from './FilterSidebar.module.css';

const FilterSidebar = ({ selectedRegion, setSelectedRegion, selectedCategory, setSelectedCategory, selectedSort, setSelectedSort }) => {
    const allRegionOptions = ['전체', '이문동', '회기동', '휘경동', '청량리동', '제기동'];
    const categoryOptions = ['전체', '구해요', '동네 소식', '자취 꿀팁', '기타'];
    const sortOptions = ['최근', '인기'];

    const [showAllRegions, setShowAllRegions] = useState(false);
    const collapsedCount = Math.max(1, allRegionOptions.indexOf('휘경동') + 1);
    const visibleRegions = showAllRegions ? allRegionOptions : allRegionOptions.slice(0, collapsedCount);

    const handleReset = () => {
        setSelectedRegion('전체');
        setSelectedCategory('전체');
        setSelectedSort('최근');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                    필터
                    <button className={styles.resetButton} onClick={handleReset}>
                        초기화
                    </button>
                </h4>
                <div className={styles.subTitle}>서울특별시 동대문구</div>
                {visibleRegions.map((region) => (
                    <label key={region} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="filter_region"
                            value={region}
                            checked={selectedRegion === region}
                            onChange={() => setSelectedRegion(region)}
                        />
                        <span className={styles.radioText}>{region}</span>
                    </label>
                ))}
                <button className={styles.moreButton} onClick={() => setShowAllRegions((v) => !v)}>{showAllRegions ? '접기' : '더보기'}</button>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>카테고리</h4>
                {categoryOptions.map((cat) => (
                    <label key={cat} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="filter_category"
                            value={cat}
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                        />
                        <span className={styles.radioText}>{cat}</span>
                    </label>
                ))}
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>정렬</h4>
                {sortOptions.map((sort) => (
                    <label key={sort} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="filter_sort"
                            value={sort}
                            checked={selectedSort === sort}
                            onChange={() => setSelectedSort(sort)}
                        />
                        <span className={styles.radioText}>{sort}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FilterSidebar;
