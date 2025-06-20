import './App.css'
import Footer from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import Navigation from './components/Navigation/Navigation'
import Category from './components/Sections/Category'
import NewArrivals from './components/Sections/NewArrivals'
import content from './data/content.json';

function App() {
  return (
    <>
      <div className='App'>
        <Navigation/>
        <HeroSection/>
        <NewArrivals/>
        {content?.categories?.map((category) => (
          <Category
            key={category.id || category.title}
            title={category.title}
            data={category.data}
          />
        ))}
        <Footer content={content.footer} />
      </div>
    </>
  )
}

export default App 
