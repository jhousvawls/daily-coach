import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { TeamProvider } from './contexts/TeamContext'

// Import keep-alive service to start it automatically
import './services/keepAlive'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TeamProvider>
        <App />
      </TeamProvider>
    </BrowserRouter>
  </StrictMode>,
)
