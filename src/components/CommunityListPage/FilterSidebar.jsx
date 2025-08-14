import React, { useState } from 'react';
import styles from './FilterSidebar.module.css';

const FilterSidebar = () => {
    const [selectedRegion, setSelectedRegion] = useState('이문동');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedSort, setSelectedSort] = useState('최근');

    const regionOptions = ['이문동', '회기동', '휘경동', '청량리동', '제기동', '신설동'];
    const categoryOptions = ['전체', '구해요', '동네 소식', '자취 꿀팁', '기타'];
    const sortOptions = ['최근', '인기'];

    return (
        <div className={styles.sidebar}>
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>지역</h4>
                <p className={styles.subTitle}>서울특별시 동대문구</p>
                {regionOptions.map((region) => (
                    <label key={region} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="region"
                            value={region}
                            checked={selectedRegion === region}
                            onChange={() => setSelectedRegion(region)}
                        />
                        {region}
                    </label>
                ))}
                <button className={styles.moreButton}>더보기</button>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>카테고리</h4>
                {categoryOptions.map((cat) => (
                    <label key={cat} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                        />
                        {cat}
                    </label>
                ))}
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>정렬</h4>
                {sortOptions.map((sort) => (
                    <label key={sort} className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value={sort}
                            checked={selectedSort === sort}
                            onChange={() => setSelectedSort(sort)}
                        />
                        {sort}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FilterSidebar;
