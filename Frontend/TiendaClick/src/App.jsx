import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard.jsx';
import Inventory from './components/inventory/Inventory.jsx';
import Home from './components/home/Home.jsx';
import Login from './components/auth/login.jsx';
import Providers from './components/providers/Providers.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import ProductBlame from './components/blame/ProductBlame.jsx'
import PinManager from './components/pin_manager/PinManager.jsx';
import SignUp from './components/auth/SignUp.jsx';
import Sales from './components/sales/Sales.jsx'
import Offers from './components/offers/Offers.jsx';
import DeleteUser from './components/auth/DeleteUser.jsx'
import AuthGuard from "./components/auth/AuthGuard.jsx";
import SalesStatsButtons from "./components/tests/Stats.jsx"
function App() {
  return (
    <Router>
      <AuthGuard>
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
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />
        <Route
          path="/product-blame/"
          element={
            <PrivateRoute>
              <ProductBlame />
            </PrivateRoute>
          }
        />
        <Route
          path="/pin-manager/"
          element={
            <PinManager />
          }
        />
        <Route
          path='/sign-up/'
          element={
            <PrivateRoute>
              <SignUp />
            </PrivateRoute>
          }
        />
        <Route
          path='delete-user'
          element={<PrivateRoute>
            <DeleteUser />
          </PrivateRoute>}
        />
        <Route
          path='/offers/'
          element={
            <PrivateRoute>
              <Offers />
            </PrivateRoute>
          }
        />
        <Route
          path='/stats/'
          element={<SalesStatsButtons></SalesStatsButtons>}
        />
      </Routes>
      </AuthGuard>
    </Router>
  );
}

export default App;