import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/vol_apps/i8n/i18n'
import {App} from "./App";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
