import './App.css'
import HeroSection from './components/HeroSection/HeroSection'
import Navigation from './components/Navigation/Navigation'
import NewArrivals from './components/Sections/NewArrivals'
import SeactionHeading from './components/Sections/SeactionHeading'

function App() {

  return (
    <>
    <div className='App'>
      <Navigation/>
      <HeroSection/>
      <NewArrivals/>
      </div>
    </>
  )
}

export default App 
