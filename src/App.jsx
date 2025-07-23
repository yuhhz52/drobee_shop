import { use, useEffect } from 'react'
import './App.css'
import Footer from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import Category from './components/Sections/Category'
import NewArrivals from './components/Sections/NewArrivals'
import content from './data/content.json';
import { fetchCategories } from './api/fetchCategories.js'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from './store/features/common'
import { loadCategories } from './store/features/category'
import Modal from 'react-modal';

Modal.setAppElement('#root');

function App() {

  const dispatch = useDispatch();
  const categories = useSelector(state => state.categoryState.categories);


  useEffect(() => {
    dispatch(setLoading(true));
    fetchCategories().then(res=>{
      console.log("Categories fetched successfully:", res);
      dispatch(loadCategories(res));
    }).catch(err=>{
      console.error("Error fetching categories:", err);
    }).finally(() => {
      dispatch(setLoading(false));
    })
  
  }, [dispatch]);

  return (
    <>
      <div className='App'>
        <HeroSection/>
        <NewArrivals/>
        {/* Render category từ backend thay vì content.json */}
        {categories?.map((category) => (
          <Category
            key={category.id}
            title={category.name}
            data={category.categoryTypes} // Đúng với dữ liệu API
          />
        ))}
        <Footer content={content?.footer} />
      </div>
    </>
  )
}

export default App 
