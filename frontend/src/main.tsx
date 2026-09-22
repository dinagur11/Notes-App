import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NotificationProvider } from './contexts/NotificationContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
