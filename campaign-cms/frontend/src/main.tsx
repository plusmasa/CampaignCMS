// Note: Avoid StrictMode to prevent dev-time double mount that can cause duplicate creates
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
