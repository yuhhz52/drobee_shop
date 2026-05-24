import { useEffect } from 'react'
import { fetchCategories } from './api/fetchCategories.js'
import { useDispatch } from 'react-redux'
import { setLoading } from './store/features/common'
import { loadCategories } from './store/features/category'
import Modal from 'react-modal';
import HomeScooter from './pages/HomeScooter/HomeScooter';

Modal.setAppElement('#root');

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    fetchCategories().then(res=>{
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
        <HomeScooter />
      </div>
    </>
  )
}

export default App 
