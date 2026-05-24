import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Categories from '../../components/Filters/Categories.jsx'
import PriceFilter from '../../components/Filters/PriceFilter.jsx'
import ColorFilter from '../../components/Filters/ColorFilter.jsx'
import './CollectionFilterDrawer.css'

const STATIC_COLLECTIONS = [
  { label: 'All', path: '/products' },
  { label: 'Accessories', path: '/accessories' },
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Hot Products', path: '/sale' },
]

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
}) => {
  const location = useLocation()

  const categoryLinks = categories.map((c) => ({
    label: c.name,
    path: `/${c.code === 'phukien' ? 'accessories' : c.code === 'nam' ? 'men' : c.code === 'nu' ? 'women' : c.code}`,
  }))

  const collectionLinks = [...STATIC_COLLECTIONS, ...categoryLinks.filter(
    (link) => !STATIC_COLLECTIONS.some((s) => s.path === link.path)
  )]

  return (
    <>
      <button
        type="button"
        className={`kalles-drawer__backdrop ${open ? 'is-open' : ''}`}
        aria-label="Close filter"
        onClick={onClose}
      />
      <aside className={`kalles-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="kalles-drawer__header">
          <h6>Filter</h6>
          <button type="button" className="kalles-drawer__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
              <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" fill="none" />
            </svg>
          </button>
        </div>

        <div className="kalles-drawer__inner">
          <FilterAccordion title="Product categories">
            <ul className="kalles-cate-list">
              {collectionLinks.map((item) => (
                <li
                  key={item.path}
                  className={location.pathname === item.path ? 'is-current' : ''}
                >
                  <Link to={item.path} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FilterAccordion>

          {categoryTypes?.length > 0 && (
            <FilterAccordion title="Product type">
              <Categories
                types={categoryTypes}
                selectedTypes={selectedTypes}
                onTypeChange={onTypeChange}
              />
            </FilterAccordion>
          )}

          <FilterAccordion title="Availability">
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
                    In stock
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
                    Out of stock
                    {productCounts.outStock != null && (
                      <span className="kalles-count"> ({productCounts.outStock})</span>
                    )}
                  </span>
                </label>
              </li>
            </ul>
          </FilterAccordion>

          {colors.length > 0 && (
            <FilterAccordion title="Color">
              <ColorFilter colors={colors} onChange={onColorChange} selectedColor={selectedColor} />
            </FilterAccordion>
          )}

          <FilterAccordion title="Price">
            <PriceFilter onChange={onPriceChange} />
          </FilterAccordion>
        </div>
      </aside>
    </>
  )
}

export default CollectionFilterDrawer
