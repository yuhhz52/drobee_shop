import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navigation from '@features/navigation/components/Navigation/Navigation';
import Footer from '@features/footer/components/Footer/Footer';
import Spinner from '@shared/components/Spinner/Spinner';
import ScrollToTop from '@shared/components/ScrollToTop';
import content from '@data/static/content.json';

const ShopLayout = () => {
  const isLoading = useSelector((state) => state.commonState.isLoading);

  return (
    <div>
      <ScrollToTop />
      <Navigation />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer content={content?.footer} />
      {isLoading && <Spinner />}
    </div>
  );
};

export default ShopLayout;
