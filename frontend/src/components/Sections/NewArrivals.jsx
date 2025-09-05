import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../../api/fetchProducts';
import ProductCard from '../../pages/ProductListPage/ProductCard';
import bannernew from '../../assets/images/bannernew.jpg';
import Carousel from '../Carousel';
import { useNavigate } from 'react-router-dom';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi API trực tiếp với newArrival=true
        const res = await getAllProducts({ newArrival: true, size: 8 });
        if (res && Array.isArray(res.products)) {
          setProducts(res.products); 
        }
      } catch {
        setError('Lỗi khi tải sản phẩm mới');
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

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
        !loading && (
          <div className='col-span-full text-center text-2xl text-gray-500'>
            Sản phẩm sẽ cập nhật vào thời gian sớm nhất
          </div>
        )
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
