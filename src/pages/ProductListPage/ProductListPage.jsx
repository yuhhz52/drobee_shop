import React, { useEffect, useMemo, useState, useCallback } from 'react'
import FilterIcon from '../../components/commom/FilterIcon.jsx'
import content from '../../data/content.json'
import Categories from '../../components/Filters/Categories.jsx';
import PriceFilter from '../../components/Filters/PriceFilter.jsx';
import ProductCard from './ProductCard.jsx';
import { getAllProducts } from '../../api/fetchProducts.js';
import { fetchCategories } from '../../api/fetchCategories.js';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../store/features/common.jsx';
import { loadCategories } from '../../store/features/category.jsx';

const CATEGORIES = content?.categories;

const ProductListPage = ({ categoryType }) => {

  const dispatch = useDispatch();
  const categoryData = useSelector((state) => state.categoryState.categories);
  const [products, setProducts] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const category = useMemo(() => {
    return categoryData?.find(category => category.code === categoryType);
  }, [categoryData, categoryType]);

  const handleTypeChange = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleFilterToggle = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const fetchProducts = useCallback(async (categoryId) => {
    try {
      dispatch(setLoading(true));
      const response = await getAllProducts(categoryId);
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchCategoriesData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetchCategories();
      dispatch(loadCategories(response));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    setProducts([]);
    
    if (!category?.id && categoryType) {
      fetchCategoriesData();
      return;
    }

    if (!category?.id) {
      return;
    }

    dispatch(setLoading(true));
    getAllProducts(category.id, selectedTypes)
      .then(setProducts)
      .finally(() => dispatch(setLoading(false)));
  }, [category?.id, categoryType, selectedTypes, fetchCategoriesData, dispatch]);


  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.price >= priceRange.min &&
        p.price <= priceRange.max &&
        (selectedColors.length === 0 || p.colors?.some(color => selectedColors.includes(color))) &&
        (selectedSizes.length === 0 || p.sizes?.some(size => selectedSizes.includes(size)))
    );
  }, [products, priceRange, selectedColors, selectedSizes]);

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
        <p className='text-lg font-medium text-gray-700'>Filter</p>
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

      <div className='space-y-6'>
        <div>
          <p className='text-base font-medium text-gray-800 mb-3'>Categories</p>
          <Categories 
            types={category?.categoryTypes || category?.types} 
            selectedTypes={selectedTypes}
            onTypeChange={handleTypeChange}
          />
        </div>

        <div>
          <PriceFilter onChange={setPriceRange} />
        </div>
        
      </div>
    </div>
  );

  const renderProductGrid = () => {
    return (
      <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 lg:gap-5'>
        {filteredProducts?.map((item, index) => (
          <ProductCard key={item.id || index} {...item} title={item?.name} />
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    products?.length === 0 && (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào trong danh mục này.</p>
      </div>
    )
  );

  return (
   <>
    <div className='flex flex-col lg:flex-row'>
      {/* Mobile Filter Toggle Button */}
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

      {/* Filter Section */}
      {renderFilterSection()}

      {/* Product List Section */}
      <div className='flex-1 p-4 lg:p-6'>
        <div className='mb-6'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2'>{category?.name}</h1>
          <p className='text-sm sm:text-base text-gray-600'>{category?.description}</p>
        </div>
        
        {renderProductGrid()}
        {renderEmptyState()}
      </div>
    </div>
   </>
  )
}

export default ProductListPage