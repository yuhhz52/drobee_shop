import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Categories from '@shared/components/Filters/Categories.jsx'
import PriceFilter from '@shared/components/Filters/PriceFilter.jsx'
import ColorFilter from '@shared/components/Filters/ColorFilter.jsx'
import ScooterSpecFilter from '@shared/components/Filters/ScooterSpecFilter.jsx'
import { useTranslation } from '@shared/i18n/useTranslation.js'
import './CollectionFilterDrawer.css'

const PRODUCT_COLLECTION_CODES = new Set([
  'electric',
  'kukirin',
  'dualtron',
  'teverun',
  'rovoron',
  'kuickwheel',
])

const FilterAccordion = ({ title, children, defaultOpen = true }) => (
  <details className="kalles-facet" open={defaultOpen}>
    <summary className="kalles-facet__title">
      <span>{title}</span>
      <svg width="11" height="7" viewBox="0 0 11 7" aria-hidden="true">
        <path
          d="M11 5.5L5.5 0L0 5.5L0.97625 6.47625L5.5 1.9525L10.0238 6.47625L11 5.5Z"
          fill="currentColor"
        />
      </svg>
    </summary>
    <div className="kalles-facet__body">{children}</div>
  </details>
)

const CollectionFilterDrawer = ({
  open,
  onClose,
  categories = [],
  categoryTypes = [],
  selectedTypes,
  onTypeChange,
  onPriceChange,
  colors = [],
  selectedColor,
  onColorChange,
  availability,
  onAvailabilityChange,
  productCounts = {},
  priceRange,
  priceMax,
  specFilters,
  onSpecFilterChange,
}) => {
  const { t } = useTranslation();
  const location = useLocation()
  const currentPath = `${location.pathname}${location.search || ''}`

  const collectionLinks = [
    { label: t('plp.all'), path: '/products' },
    { label: t('plp.newArrivals'), path: '/new-arrivals' },
    { label: t('plp.hotProducts'), path: '/sale' },
    ...categories
      .filter((c) => PRODUCT_COLLECTION_CODES.has(c?.code) && c?.code !== 'electric')
      .map((c) => ({
        label: c.name,
        path: `/products?categoryId=${c.id}`,
      })),
  ]

  return (
    <>
      <button
        type="button"
        className={`kalles-drawer__backdrop ${open ? 'is-open' : ''}`}
        aria-label={t('common.closeFilter')}
        onClick={onClose}
      />
      <aside className={`kalles-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="kalles-drawer__header">
          <h6>{t('common.filter')}</h6>
          <button type="button" className="kalles-drawer__close" onClick={onClose} aria-label={t('common.close')}>
            <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
              <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" fill="none" />
            </svg>
          </button>
        </div>

        <div className="kalles-drawer__inner">
          <FilterAccordion title={t('filter.productCategories')}>
            <ul className="kalles-cate-list">
              {collectionLinks.map((item) => (
                <li
                  key={item.path}
                  className={currentPath === item.path ? 'is-current' : ''}
                >
                  <Link to={item.path} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FilterAccordion>

          {categoryTypes?.length > 0 && (
            <FilterAccordion title={t('filter.productType')}>
              <Categories
                types={categoryTypes}
                selectedTypes={selectedTypes}
                onTypeChange={onTypeChange}
              />
            </FilterAccordion>
          )}

          <FilterAccordion title={t('filter.scooterSpecs')}>
            <ScooterSpecFilter
              specFilters={specFilters}
              onSpecFilterChange={onSpecFilterChange}
              activeTab={specFilters?.activeTab || 'maxSpeed'}
              onTabChange={(tab) => onSpecFilterChange({ ...specFilters, activeTab: tab })}
            />
          </FilterAccordion>

          <FilterAccordion title={t('filter.availability')}>
            <ul className="kalles-check-list">
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={availability.includes('in')}
                    onChange={() => onAvailabilityChange('in')}
                  />
                  <span className="kalles-check-box" />
                  <span>
                    {t('filter.inStock')}
                    {productCounts.inStock != null && (
                      <span className="kalles-count"> ({productCounts.inStock})</span>
                    )}
                  </span>
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={availability.includes('out')}
                    onChange={() => onAvailabilityChange('out')}
                  />
                  <span className="kalles-check-box" />
                  <span>
                    {t('filter.outOfStock')}
                    {productCounts.outStock != null && (
                      <span className="kalles-count"> ({productCounts.outStock})</span>
                    )}
                  </span>
                </label>
              </li>
            </ul>
          </FilterAccordion>

          {colors.length > 0 && (
            <FilterAccordion title={t('filter.color')}>
              <ColorFilter colors={colors} onChange={onColorChange} selectedColor={selectedColor} />
            </FilterAccordion>
          )}

          <FilterAccordion title={t('filter.price')}>
            <PriceFilter
              onChange={onPriceChange}
              initialRange={priceRange}
              max={priceMax}
            />
          </FilterAccordion>
        </div>
      </aside>
    </>
  )
}

export default CollectionFilterDrawer
