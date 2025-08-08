import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { NotificationProvider } from './context/NotificationSystem';
import { PinProvider } from './context/PinContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <UserProvider>
        <PinProvider>
          <App />
        </PinProvider>
      </UserProvider>
    </NotificationProvider>
  </StrictMode>
)
