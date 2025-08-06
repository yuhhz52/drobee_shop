import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllProducts } from '../../api/fetchProducts';
import ProductCard from '../../pages/ProductListPage/ProductCard';
import bannernew from '../../assets/images/bannernew.jpg';
import Carousel from '../Carousel';
import { useNavigate } from 'react-router-dom';

const NewArrivals = () => {
  const categories = useSelector(state => state.categoryState.categories);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNewArrivals = async () => {
      if (!categories || categories.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const allProducts = [];
        for (const category of categories) {
          try {
            const res = await getAllProducts(category.id);
            if (res && Array.isArray(res)) {
              allProducts.push(...res);
            }
          } catch (err) {
            console.error(`Error fetching products for category ${category.id}:`, err);
          }
        }
        // Filter only products with newArrival = true
        const newArrivalProducts = allProducts.filter(product => product.newArrival === true);
        setProducts(newArrivalProducts);
      } catch {
        setError('Lỗi khi tải sản phẩm mới');
      } finally {
        setLoading(false);
      }
    };
    fetchAllNewArrivals();
  }, [categories]);

  return (
    <div className='flex flex-col px-5 md:px-12 lg:px-15 my-5 items-center gap-4'>
      <img
        src={bannernew}
        alt="New Arrivals"
        className="w-full h-[120px] md:h-[180px] lg:h-[220px] object-cover mb-4"
      />
      {loading && <div>Đang tải sản phẩm...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {products && products.length > 0 ? (
        <Carousel>
          {products.slice(0, 8).map((item) => (
            <div key={item.id}>
              <ProductCard {...item} />
            </div>
          ))}
        </Carousel>
      ) : (
        !loading && <div className='col-span-full text-center text-2xl text-gray-500'>Sản phẩm sẽ cập nhật vào thời gian sớm nhất</div>
      )}
      <button
        className='mb-2 px-8 py-2 bg-gray-200 text-black rounded hover:bg-gray-500 transition block mx-auto'
        onClick={() => navigate('/new-arrivals')}
      >
        Xem tất cả
      </button>
    </div>
  );
};

export default NewArrivals;
