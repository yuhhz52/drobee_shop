import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'react-modal';
import { fetchCategories } from '@services/category.service';
import { setLoading } from '@app/store/slices/common.jsx';
import { loadCategories } from '@app/store/slices/category.jsx';
import HomeScooter from '@features/home/pages/HomeScooter/HomeScooter';

Modal.setAppElement('#root');

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    fetchCategories()
      .then((res) => dispatch(loadCategories(res)))
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  return (
    <div className="App">
      <HomeScooter />
    </div>
  );
}

export default App;
