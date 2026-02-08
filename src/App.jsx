import { Routes, Route } from 'react-router-dom'
import Home from './components/Home/Home'
import Player from './components/Player/Player'
import WordBank from './components/WordBank/WordBank'
import Flashcard from './components/WordBank/Flashcard'
import Navigation from './components/Navigation/Navigation'

export default function App() {
  return (
    <div className="app">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/song/:songId" element={<Player />} />
          <Route path="/wordbank" element={<WordBank />} />
          <Route path="/wordbank/flashcards" element={<Flashcard />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  )
}
