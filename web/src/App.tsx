import { Route, Routes } from 'react-router-dom'
import { Box } from './routes/Box'
import { Curator } from './routes/Curator'
import { Home } from './routes/Home'
import { Log } from './routes/Log'
import { Reveal } from './routes/Reveal'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/make" element={<Curator />} />
      <Route path="/log" element={<Log />} />
      <Route path="/b/:id" element={<Box />} />
      <Route path="/r/:id" element={<Reveal />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
