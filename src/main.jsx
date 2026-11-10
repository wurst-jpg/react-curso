import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Sin <StrictMode>: con él, Sandpack 2.x registra la vista previa dos veces y deja de
// actualizarla al escribir (y su capa "cargando" no desaparece nunca).
createRoot(document.getElementById('root')).render(<App />)
