import { use, useEffect } from 'react'
import './App.css'
import Footer from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import Category from './components/Sections/Category'
import NewArrivals from './components/Sections/NewArrivals'
import content from './data/content.json';
import { fetchCategories } from './api/fetchCategories'
import { useDispatch } from 'react-redux'
import { setLoading } from './store/features/common'
import { loadCategories } from './store/features/category'

function App() {

  const dispatch = useDispatch();


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
        {content?.pages?.shop?.sections?.map((category) => (
          <Category
            key={category.id || category.title}
            title={category.title}
            data={category.data}
          />
        ))}
        <Footer content={content?.footer} />
      </div>
    </>
  )
}

export default App 
