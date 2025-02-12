import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { CreateGame } from "./createGame/CreateGame"
import { Game } from "./game/Game-Page"

function App() {

  return <div>
    <BrowserRouter>
    <Routes>
      <Route path="/"  element={<CreateGame></CreateGame>}/>
      <Route path="/game" element={<Game></Game>}/>
    </Routes>
    </BrowserRouter>
  </div>
}

export default App
