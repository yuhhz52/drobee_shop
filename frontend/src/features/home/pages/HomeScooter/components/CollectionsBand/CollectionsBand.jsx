import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CollectionsBand.css';

const CDN = 'https://horizon.com/cdn/shop/files';
const CDN_FALLBACK =
  'https://0i1kw6o8mm0dwce9-70714851584.shopifypreview.com/cdn/shop/files';

const defaultBrands = [
  'Dualtron',
  'Kukirin',
  'Teverun',
  'Rovoron',
  'KuickWheel',
  'Electric',
  'Kaabo',
  'NanRobot',
  'SmooSat',
  'Hiley',
  'Yumo',
  'Zing',
];

const CollectionsBand = ({ collections = [], categories = [] }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    checkScrollButtons();
    measureItem();
    window.addEventListener('resize', measureItem);
    return () => window.removeEventListener('resize', measureItem);
  }, []);

  const measureItem = () => {
    if (scrollRef.current) {
      const firstItem = scrollRef.current.querySelector('.horizon-collections__item');
      if (firstItem) {
        setItemWidth(firstItem.offsetWidth);
      }
      checkScrollButtons();
    }
  };

  const getCollectionLink = (collection) => {
    if (collection.slug === 'electric-scooters' || collection.isAllProducts) {
      return '/products';
    }
    return `/collections/${collection.slug}`;
  };

  const getCategoryLink = (category) => {
    return `/products?category=${category.slug || category.id}`;
  };

  const getFallbackLink = (item) => {
    return `/products?brand=${item.slug}`;
  };

  const getItems = () => {
    if (collections.length > 0) {
      return collections;
    }
    if (categories.length > 0) {
      return categories;
    }
    return defaultBrands.map((brand) => ({
      id: brand,
      slug: brand.toLowerCase(),
      title: `${brand} Electric Scooters`,
      isFallback: true,
    }));
  };

  const items = getItems();

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current && itemWidth > 0) {
      const gap = 16;
      const scrollAmount = (itemWidth + gap) * 6;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const renderItem = (item) => {
    const isFallback = item.isFallback;
    const title = item.title || item.name || '';
    const slug = item.slug || item.id || '';
    const imageSrc = isFallback
      ? `${CDN}/${slug}-electric-scooters-collection.png?v=1&width=200`
      : item.image || `${CDN}/${slug}-collection.png?v=1&width=200`;

    return (
      <Link
        key={item.id || slug}
        to={isFallback ? getFallbackLink({ slug }) : (item.title ? getCollectionLink(item) : getCategoryLink(item))}
        className="horizon-collections__item"
      >
        <div className="horizon-collections__circle">
          <img
            src={imageSrc}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${CDN_FALLBACK}/Image_0f80380a-7697-449a-8854-d0435025b891.jpg?width=120`;
            }}
          />
        </div>
        <span>{title}</span>
      </Link>
    );
  };

  return (
    <section className="horizon-collections-band">
      <div className="horizon-container">
        <div className="horizon-section-head">
          <h2>Our collections</h2>
          <Link to="/products" className="horizon-link-red">
            View all
          </Link>
        </div>
        <div className="horizon-collections-wrapper">
          <button
            className="horizon-collections__nav horizon-collections__nav--left"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div
            className="horizon-collections"
            ref={scrollRef}
            onScroll={checkScrollButtons}
          >
            {items.map(renderItem)}
          </div>
          <button
            className="horizon-collections__nav horizon-collections__nav--right"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CollectionsBand;
