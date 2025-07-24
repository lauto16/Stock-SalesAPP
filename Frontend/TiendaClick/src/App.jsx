import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard.jsx'
import Inventory from './components/Inventory.jsx'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory/" element={<Inventory />} />
      </Routes>
    </Router>

  )
}

export default App
