import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard.jsx';
import Inventory from './components/inventory/Inventory.jsx';
import Home from './components/home/Home.jsx';
import Login from './components/auth/login.jsx';
import Providers from './components/providers/Providers.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import ProductBlame from './components/blame/ProductBlame.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/providers"
          element={
            <PrivateRoute>
              <Providers />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          }
        />
        <Route
        path="/product-blame/"
        element={
          <PrivateRoute>
            <ProductBlame/>
          </PrivateRoute>
        }
        />
      </Routes>
    </Router>
  );
}

export default App;