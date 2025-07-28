import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { NotificationProvider } from './context/NotificationSystem';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
    <UserProvider>
      <App />
    </UserProvider>
    </NotificationProvider>
  </StrictMode>,
)
