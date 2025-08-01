import React from 'react';
import { useSelector } from 'react-redux';
import Carousel from '../Carousel';

import aokhoac from '../../assets/images/aokhoac.png';
import aosomi from '../../assets/images/aosomi.png';
import aothun from '../../assets/images/aothun.png';
import domaconha from '../../assets/images/domaconha.png';
import vay from '../../assets/images/vay.png';
import balo from '../../assets/images/balo.png';
import giay from '../../assets/images/giay.png';

const Bycategory = () => {
  const categories = useSelector(state => state.categoryState.categories);
  
  // Lấy tất cả categoryTypes từ API
  const allCategoryTypes = [];
  categories?.forEach(category => {
    if (category.categoryTypes) {
      allCategoryTypes.push(...category.categoryTypes);
    }
  });

  const getCategoryImage = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('áo khoác')) {
      return aokhoac;
    } else if (name.includes('áo sơ mi') ) {
      return aosomi;
    } else if (name.includes('áo thun') ) {
      return aothun;
    } else if (name.includes('đồ ở nhà')) {
      return domaconha;
    } else if (name.includes('váy')) {
      return vay;
    } else if (name.includes('túi xách')) {
      return balo;
    } else if (name.includes('giày')) {
      return giay;
    } else {
      return aokhoac; 
    }
  };

  const carouselSettings = {
    slidesToShow: 5,
    slidesToScroll: 2,
    infinite: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } }
    ]
  };

  return (
    <div className="my-10 px-5 md:px-12 lg:px-15">
      {/* Tiêu đề cố định */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh mục sản phẩm</h2>

      {/* Carousel danh mục */}
     <div className="flex justify-center">
      <Carousel settings={carouselSettings}>
        {allCategoryTypes.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center justify-center px-2">
            <div className="w-full max-w-[256px] h-[164px] sm:h-[140px] xs:h-[120px] rounded-b-full overflow-hidden mb-3 shadow-md">
              <img
                src={getCategoryImage(cat.name)}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full max-w-[256px] flex justify-center">
              <span className="text-center text-sm md:text-base font-bold text-gray-800 whitespace-nowrap">
                {cat.name}
              </span>
            </div>
          </div>
        ))}
      </Carousel>
      </div>

    </div>
  );
};

export default Bycategory;
