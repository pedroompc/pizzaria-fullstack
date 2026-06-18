import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1916',
            color: '#F5EFE6',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#3ECF8E', secondary: '#0F0E0D' },
          },
          error: {
            iconTheme: { primary: '#F56565', secondary: '#0F0E0D' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
