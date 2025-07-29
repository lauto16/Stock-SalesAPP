import { useState } from 'react'
import './css/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/dashboard/Dashboard.jsx'
import Inventory from './components/inventory/Inventory.jsx'
import Home from './components/home/Home.jsx'
import Login from './components/auth/login.jsx'
import Providers from './components/providers/Providers.jsx'
function App() {

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router >

  )
}

export default App
