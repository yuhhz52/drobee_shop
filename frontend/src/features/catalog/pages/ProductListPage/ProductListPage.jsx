import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import VepaceProductCard from '@features/home/pages/HomeScooter/VepaceProductCard'
import { inferBrandFromProduct } from '@shared/utils/product-brand'
import CollectionFilterDrawer from './CollectionFilterDrawer.jsx'
import { getAllProducts } from '@services/product.service'
import { fetchCategories } from '@services/category.service'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@app/store/slices/common.jsx'
import { loadCategories } from '@app/store/slices/category.jsx'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import './ProductListPage.css'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'title-asc', label: 'Alphabetically, A-Z' },
  { value: 'title-desc', label: 'Alphabetically, Z-A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'date-desc', label: 'Date, new to old' },
  { value: 'date-asc', label: 'Date, old to new' },
]

const isProductInStock = (product) => {
  if (!product?.variants?.length) return true
  return product.variants.some((v) => (v.stockQuantity ?? 1) > 0)
}

const GridIcon = ({ cols, active, onClick }) => (
  <button
    type="button"
    className={`vepace-grid-btn ${active ? 'is-active' : ''}`}
    onClick={onClick}
    aria-label={`${cols} column grid`}
  >
    <span className={`vepace-grid-icon vepace-grid-icon--${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <span key={i} />
      ))}
    </span>
  </button>
)

const ProductListPage = ({
  categoryType,
  showNewArrivals,
  showSale,
  showAllProducts,
  bannerImage,
  title,
}) => {
  const dispatch = useDispatch()
  const categoryData = useSelector((state) => state.categoryState.categories)
  const [searchParams] = useSearchParams()
  const sortRef = useRef(null)

  const [products, setProducts] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 })
  const [selectedColor, setSelectedColor] = useState('')
  const [availability, setAvailability] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [gridColumns, setGridColumns] = useState(4) // 3 | 4 | 5 columns
  const [sortBy, setSortBy] = useState('best-selling')
  const [sortOpen, setSortOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [size] = useState(12)
  const [totalElements, setTotalElements] = useState(0)

  const categoryIdFromQuery = searchParams.get('categoryId')
  const typeIdFromQuery = searchParams.get('typeId')
  const category = useMemo(
    () =>
      categoryIdFromQuery
        ? categoryData?.find((c) => String(c.id) === String(categoryIdFromQuery))
        : categoryData?.find((c) => c.code === categoryType),
    [categoryData, categoryType, categoryIdFromQuery]
  )

  const pageTitle = title || (showSale ? 'Sale' : showNewArrivals ? 'New arrivals' : showAllProducts ? 'All' : category?.name || 'Products')

  const allCategoryTypes = useMemo(() => {
    if (category?.categoryTypes?.length) return category.categoryTypes
    if (category?.types?.length) return category.types
    return categoryData?.flatMap((c) => c.categoryTypes || c.types || []) || []
  }, [category, categoryData])

  const handleFilterToggle = useCallback(() => setIsFilterOpen((prev) => !prev), [])
  const handleCloseFilter = useCallback(() => setIsFilterOpen(false), [])

  const handleAvailabilityChange = useCallback((key) => {
    setAvailability((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    )
  }, [])

  const handleTypeChange = useCallback((id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }, [])

  useEffect(() => {
    if (!typeIdFromQuery) return
    setSelectedTypes([String(typeIdFromQuery)])
    setPage(1)
  }, [typeIdFromQuery])

  const handlePageChange = (_event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!categoryData?.length) {
      fetchCategories()
        .then((response) => dispatch(loadCategories(response)))
        .catch(() => {})
    }
  }, [categoryData?.length, dispatch])

  useEffect(() => {
    if (
      !showAllProducts &&
      !category?.id &&
      !showNewArrivals &&
      !showSale &&
      (categoryType || categoryIdFromQuery)
    ) return

    dispatch(setLoading(true))
    const fetchProducts = async () => {
      try {
        let res
        if (showNewArrivals) {
          res = await getAllProducts({ newArrival: true, page: page - 1, size })
        } else if (showSale || showAllProducts) {
          res = await getAllProducts({ page: page - 1, size })
        } else {
          res = await getAllProducts({
            categoryId: category?.id,
            typeIds: selectedTypes,
            page: page - 1,
            size,
          })
        }
        setProducts(res.products || [])
        setTotalElements(res.totalElements || 0)
      } catch {
        setProducts([])
        setTotalElements(0)
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchProducts()
  }, [category?.id, showNewArrivals, showSale, showAllProducts, categoryType, categoryIdFromQuery, selectedTypes, page, size, dispatch])

  useEffect(() => {
    setPage(1)
  }, [selectedTypes, category?.id, showNewArrivals, showSale])

  useEffect(() => {
    handleCloseFilter()
  }, [categoryType, categoryIdFromQuery, showNewArrivals, showSale, showAllProducts, handleCloseFilter])

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFilterOpen])

  useEffect(() => {
    const onDocClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const uniqueColors = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.color) set.add(v.color)
      })
    })
    return [...set]
  }, [products])

  const productCounts = useMemo(() => {
    let inStock = 0
    let outStock = 0
    products.forEach((p) => {
      if (isProductInStock(p)) inStock += 1
      else outStock += 1
    })
    return { inStock, outStock }
  }, [products])

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const numericPrice = Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price)
        ? Number(p.salePrice)
        : Number(p.price) || 0
      const priceMatch = numericPrice >= priceRange.min && numericPrice <= priceRange.max
      const typeMatch =
        selectedTypes.length === 0 || selectedTypes.includes(String(p.categoryTypeId))
      const colorMatch =
        !selectedColor ||
        p.variants?.some((v) => v.color === selectedColor)
      const inStock = isProductInStock(p)
      const availMatch =
        availability.length === 0 ||
        (availability.includes('in') && inStock) ||
        (availability.includes('out') && !inStock)
      return priceMatch && typeMatch && colorMatch && availMatch
    })

    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => {
          const priceA = Number(a.salePrice) > 0 && Number(a.salePrice) < Number(a.price)
            ? Number(a.salePrice)
            : Number(a.price) || 0
          const priceB = Number(b.salePrice) > 0 && Number(b.salePrice) < Number(b.price)
            ? Number(b.salePrice)
            : Number(b.price) || 0
          return priceA - priceB
        })
        break
      case 'price-desc':
        list = [...list].sort((a, b) => {
          const priceA = Number(a.salePrice) > 0 && Number(a.salePrice) < Number(a.price)
            ? Number(a.salePrice)
            : Number(a.price) || 0
          const priceB = Number(b.salePrice) > 0 && Number(b.salePrice) < Number(b.price)
            ? Number(b.salePrice)
            : Number(b.price) || 0
          return priceB - priceA
        })
        break
      case 'title-asc':
        list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'title-desc':
        list = [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'date-desc':
        list = [...list].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0))
        break
      case 'date-asc':
        list = [...list].sort((a, b) => (a.newArrival ? 1 : 0) - (b.newArrival ? 1 : 0))
        break
      case 'best-selling':
        list = [...list].sort((a, b) => (Number(b.totalSold) || 0) - (Number(a.totalSold) || 0))
        break
      case 'featured':
        list = [...list].sort((a, b) => {
          const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
          if (featuredDiff !== 0) return featuredDiff
          return (Number(b.totalSold) || 0) - (Number(a.totalSold) || 0)
        })
        break
      default:
        break
    }

    return list
  }, [products, priceRange, selectedTypes, selectedColor, availability, sortBy])

  const totalPages = Math.ceil(totalElements / size)
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'

  return (
    <div className="vepace-plp">
      <div className="vepace-plp__header">
        <div className="vepace-plp__container">
          <nav className="vepace-plp__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="vepace-plp__breadcrumb-sep">/</span>
            <span>{pageTitle}</span>
          </nav>
          <h1>{pageTitle}</h1>
          <p className="vepace-plp__count">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="vepace-plp__container">
        <div className="vepace-plp__toolbar">
          <button type="button" className="vepace-plp__filter-btn" onClick={handleFilterToggle}>
            <svg width="16" height="16" viewBox="0 0 512 512" aria-hidden="true">
              <path
                fill="currentColor"
                d="M324.4 64C339.6 64 352 76.37 352 91.63C352 98.32 349.6 104.8 345.2 109.8L240 230V423.6C240 437.1 229.1 448 215.6 448C210.3 448 205.2 446.3 200.9 443.1L124.7 385.6C116.7 379.5 112 370.1 112 360V230L6.836 109.8C2.429 104.8 0 98.32 0 91.63C0 76.37 12.37 64 27.63 64H324.4zM144 224V360L208 408.3V223.1C208 220.1 209.4 216.4 211.1 213.5L314.7 95.1H37.26L140 213.5C142.6 216.4 143.1 220.1 143.1 223.1L144 224zM496 400C504.8 400 512 407.2 512 416C512 424.8 504.8 432 496 432H336C327.2 432 320 424.8 320 416C320 407.2 327.2 400 336 400H496zM320 256C320 247.2 327.2 240 336 240H496C504.8 240 512 247.2 512 256C512 264.8 504.8 272 496 272H336C327.2 272 320 264.8 320 256zM496 80C504.8 80 512 87.16 512 96C512 104.8 504.8 112 496 112H400C391.2 112 384 104.8 384 96C384 87.16 391.2 80 400 80H496z"
              />
            </svg>
            <span>Filter</span>
          </button>

          <div className="vepace-plp__layout">
            <GridIcon cols={3} active={gridColumns === 3} onClick={() => setGridColumns(3)} />
            <GridIcon cols={4} active={gridColumns === 4} onClick={() => setGridColumns(4)} />
            <GridIcon cols={5} active={gridColumns === 5} onClick={() => setGridColumns(5)} />
          </div>

          <div className="vepace-plp__sort" ref={sortRef}>
            <button
              type="button"
              className="vepace-plp__sort-btn"
              onClick={(e) => {
                e.stopPropagation()
                setSortOpen((o) => !o)
              }}
            >
              <span className="vepace-plp__sort-label">{sortLabel}</span>
              <span className="vepace-plp__sort-label-mobile">Sort</span>
              <svg width="10" height="10" viewBox="0 0 19 12" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  points="17 2 9.5 10 2 2"
                  strokeWidth="2"
                />
              </svg>
            </button>
            {sortOpen && (
              <ul className="vepace-plp__sort-menu" role="listbox">
                {SORT_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sortBy === opt.value}
                      className={sortBy === opt.value ? 'is-selected' : ''}
                      onClick={() => {
                        setSortBy(opt.value)
                        setSortOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={`vepace-plp__grid vepace-plp__grid--${gridColumns}`}>
            {filteredProducts.map((item) => (
              <VepaceProductCard
                key={item.id}
                {...item}
                brand={inferBrandFromProduct(item)}
              />
            ))}
          </div>
        ) : (
          <div className="vepace-plp__empty">
            <p>
              {products.length === 0
                ? 'No products found in this collection.'
                : 'No products match your filters.'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="vepace-plp__pagination">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: 'var(--font-body)',
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'var(--vepace-red) !important',
                    color: '#fff',
                  },
                }}
              />
            </Stack>
          </div>
        )}
      </div>

      <CollectionFilterDrawer
        open={isFilterOpen}
        onClose={handleCloseFilter}
        categories={categoryData}
        categoryTypes={showNewArrivals ? [] : allCategoryTypes}
        selectedTypes={selectedTypes}
        onTypeChange={handleTypeChange}
        onPriceChange={setPriceRange}
        colors={uniqueColors}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        availability={availability}
        onAvailabilityChange={handleAvailabilityChange}
        productCounts={productCounts}
      />
    </div>
  )
}

export default ProductListPage
