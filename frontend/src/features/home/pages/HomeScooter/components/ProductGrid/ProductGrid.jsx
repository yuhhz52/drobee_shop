import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { inferBrand } from '@shared/utils/product-brand';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './ProductGrid.css';

const ProductGrid = ({ products = [], title, viewAllLink = '/products' }) => {
  const { t } = useTranslation();
  return (
    <section className="horizon-section">
      <div className="horizon-container">
        <div className="horizon-section-head">
          <h2>{title}</h2>
          <Link to={viewAllLink} className="horizon-link-red">
            {t('common.viewAll')}
          </Link>
        </div>
        <div className="horizon-product-grid">
          {products.length > 0 ? (
            products.map((item) => (
              <ProductCard
                key={item.id}
                {...item}
                brand={inferBrand(item.name)}
              />
            ))
          ) : (
            <div className="horizon-empty-state">
              <p>{t('common.loading')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
