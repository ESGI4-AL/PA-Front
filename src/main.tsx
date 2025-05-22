import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import logger from '@/utils/logger';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

logger.info('🚀 Application lancée');
console.log('🔍 API_URL used at build time:', import.meta.env.VITE_API_URL);