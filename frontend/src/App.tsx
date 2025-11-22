import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import MatchList from './pages/MatchList';
import MatchDetails from './pages/MatchDetails';
import PlayerDetails from './pages/PlayerDetails';

function App() {

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<MatchList />} />
        <Route path="/matches/:matchId" element={<MatchDetails />} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
      </Routes>
  )
}

export default App
