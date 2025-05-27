import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './customHooks/UserContext'
import { SectionsProvider } from './customHooks/SectionsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <SectionsProvider>
        <App />
      </SectionsProvider>
    </UserProvider>
  </StrictMode>,
)
