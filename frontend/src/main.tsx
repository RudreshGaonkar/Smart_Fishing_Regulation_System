import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { FishingSessionProvider } from './context/FishingSessionContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <FishingSessionProvider>
        <App />
      </FishingSessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
