import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SortVisualizer from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SortVisualizer />
  </StrictMode>,
)
