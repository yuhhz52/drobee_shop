import './App.css'
import { Footer } from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import Navigation from './components/Navigation/Navigation'
import NewArrivals from './components/Sections/NewArrivals'

function App() {

  return (
    <>
    <div className='App'>
      <Navigation/>
      <HeroSection/>
      <NewArrivals/>
      <Footer/>
      </div>
    </>
  )
}

export default App 
