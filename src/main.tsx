import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// IMPORTANTE: Ruta relativa correcta desde src/
import { AuthProvider } from './core/auth/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Envolvemos TODA la app para que useAuth funcione */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)