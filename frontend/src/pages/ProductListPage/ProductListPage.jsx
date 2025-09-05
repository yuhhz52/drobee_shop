import React, { useEffect, useMemo, useState, useCallback } from 'react'
import FilterIcon from '../../components/commom/FilterIcon.jsx'
import Categories from '../../components/Filters/Categories.jsx'
import PriceFilter from '../../components/Filters/PriceFilter.jsx'
import ProductCard from './ProductCard.jsx'
import { getAllProducts } from '../../api/fetchProducts.js'
import { fetchCategories } from '../../api/fetchCategories.js'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../store/features/common.jsx'
import { loadCategories } from '../../store/features/category.jsx'
import bannernew from '../../assets/images/bannernew.jpg'
import { GrPowerReset } from "react-icons/gr"
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

const ProductListPage = ({ categoryType, showNewArrivals }) => {
  const dispatch = useDispatch()
  const categoryData = useSelector((state) => state.categoryState.categories)

  const [products, setProducts] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [page, setPage] = useState(1) 
  const [size] = useState(10)
  const [totalElements, setTotalElements] = useState(0)

  // Lấy category hiện tại
  const category = useMemo(() => {
    return categoryData?.find(category => category.code === categoryType)
  }, [categoryData, categoryType])

  // Toggle filter mobile
  const handleFilterToggle = useCallback(() => setIsFilterOpen(prev => !prev), [])
  const handleCloseFilter = useCallback(() => setIsFilterOpen(false), [])
  const handleResetFilters = useCallback(() => {
    setPriceRange({ min: 0, max: 1000000 })
    setSelectedTypes([])
  }, [])

  const handlePageChange = (event, value) => {
    setPage(value)
  }


  const fetchCategoriesData = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      const response = await fetchCategories()
      dispatch(loadCategories(response))
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])


  useEffect(() => {
    if (!category?.id && !showNewArrivals) return

    dispatch(setLoading(true))
    const fetchProducts = async () => {
      try {
        let res
        if (showNewArrivals) {
          // gọi thẳng API hỗ trợ newArrival
          res = await getAllProducts({
            newArrival: true,
            page: page - 1,
            size,
          })
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
  }, [category?.id, showNewArrivals, selectedTypes, page, size, dispatch])

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1)
  }, [selectedTypes, category?.id, showNewArrivals])

  // Filter theo price + type
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(String(p.categoryTypeId))
      return priceMatch && typeMatch
    })
  }, [products, priceRange, selectedTypes])

  const totalPages = Math.ceil(totalElements / size)

  // --- Render ---
  const renderFilterSection = () => (
    <div className={`
      ${isFilterOpen ? 'block' : 'hidden'} 
      lg:block 
      w-full lg:w-[280px] xl:w-[320px] 
      p-4 lg:p-6 
      border-b lg:border-r lg:border-b-0 border-gray-300 
      bg-white lg:bg-transparent
      lg:rounded-lg lg:m-5
      lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto
    `}>
      <div className='flex justify-between items-center mb-4'>
        <p className='text-lg font-semibold text-gray-900'>Bộ lọc</p>
        <div className='flex gap-2'>
          <button
            onClick={handleResetFilters}
            className='text-xl text-gray-600 hover:text-black underline'
            aria-label="Reset filters"
          >
            <GrPowerReset />
          </button>
          <div className='lg:hidden'>
            <button
              onClick={handleCloseFilter}
              className='text-gray-500 hover:text-gray-700'
              aria-label="Close filter"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <p className='text-base font-semibold text-gray-700 mb-3'>Danh mục sản phẩm</p>
          <Categories
            types={category?.categoryTypes || category?.types}
            selectedTypes={selectedTypes}
            onTypeChange={(id) =>
              setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
            }
          />
        </div>

        <div>
          <PriceFilter onChange={setPriceRange} />
        </div>
      </div>
    </div>
  )

  const renderProductGrid = () => {
    const gridClass = showNewArrivals
      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5'
      : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 lg:gap-5'

    return (
      <div className={gridClass}>
        {filteredProducts?.map((item, index) => (
          <ProductCard key={item.id || index} {...item} title={item?.name} />
        ))}
      </div>
    )
  }

  const renderEmptyState = () => {
    if (products?.length === 0) {
      return (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </div>
      )
    }

    if (filteredProducts?.length === 0 && products?.length > 0) {
      return (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn.</p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {showNewArrivals && (
        <img
          src={bannernew}
          alt='New Arrivals'
          className='w-full h-auto object-cover mb-4'
        />
      )}

      <div className='flex flex-col lg:flex-row'>
        <div className='lg:hidden p-4 border-b border-gray-200'>
          <button
            onClick={handleFilterToggle}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            aria-label="Toggle filters"
          >
            <FilterIcon />
            <span className='text-sm font-medium'>Filters</span>
          </button>
        </div>

        {!showNewArrivals && renderFilterSection()}

        <div className='flex-1 p-4 lg:p-6'>
          <div className='mb-6'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2'>
              {showNewArrivals ? "Sản phẩm mới" : category?.name}
            </h1>
            {!showNewArrivals && (
              <p className='text-sm sm:text-base text-gray-600'>{category?.description}</p>
            )}
          </div>
          {renderProductGrid()}
          {renderEmptyState()}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center my-6">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </div>
      )}
    </>
  )
}

export default ProductListPage
