import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'

// Note: not wrapped in <StrictMode> — React 18's dev-only double-invoke of
// effects causes Tiptap's useEditor to briefly create/destroy/recreate the
// editor, which can throw a spurious "Cannot read properties of null
// (reading 'commands')" error. This is a known Tiptap/StrictMode
// interaction, harmless in production (effects only run once there).
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)
