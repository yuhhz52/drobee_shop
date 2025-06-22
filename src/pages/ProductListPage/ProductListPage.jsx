import React, { useMemo, useState } from 'react'
import FilterIcon from '../../components/commom/FilterIcon.jsx'
import content from '../../data/content.json'
import Categories from '../../components/Filters/Categories.jsx';
import PriceFilter from '../../components/Filters/PriceFilter.jsx';
import ColorFilter from '../../components/Filters/ColorFilter.jsx';
import SizeFilter from '../../components/Filters/SizeFilter.jsx';
import ProductCard from './ProductCard.jsx';

const categories = content?.categories;

const ProductListPage = ({ categoryType }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryContent = useMemo(() => {
    return categories?.find(category => category.code === categoryType);
  },[categoryType]);

  const productListItems = useMemo(() => {
    return content?.products?.filter((product) => product?.category_id === categoryContent?.id);
  },[categoryContent]);

  return (
   <>
    <div className='flex flex-col lg:flex-row'>
      {/* Mobile Filter Toggle Button */}
      <div className='lg:hidden p-4 border-b border-gray-200'>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
        >
          <FilterIcon />
          <span className='text-sm font-medium'>Filters</span>
        </button>
      </div>

      {/* Filter Section - Responsive */}
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
        {/*Filter Header*/}
        <div className='flex justify-between items-center mb-4'>
          <p className='text-lg font-medium text-gray-700'>Filter</p>
          <div className='lg:hidden'>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              ✕
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <p className='text-base font-medium text-gray-800 mb-3'>Categories</p>
            <Categories types={categoryContent?.types} />
          </div>

          <div>
            <PriceFilter />
          </div>
          
          <div>
            <ColorFilter colors={categoryContent?.meta_data?.colors}/>
          </div>
          
          <div>
            <SizeFilter sizes={categoryContent?.meta_data?.sizes}/>
          </div>
        </div>
      </div>

      {/* Product List Section - Responsive */}
      <div className='flex-1 p-4 lg:p-6'>
        <div className='mb-6'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2'>{categoryContent?.name}</h1>
          <p className='text-sm sm:text-base text-gray-600'>{categoryContent?.description}</p>
        </div>
        
        {/* Product Grid - Responsive */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 lg:gap-5'>
          {productListItems?.map((product, index) => (
            <ProductCard key={product.id || index} {...product} />
          ))}
        </div>
        
        {productListItems?.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
   </>
  )
}

export default ProductListPage