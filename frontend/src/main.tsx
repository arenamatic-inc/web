import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './auth/AuthContext';
import { SiteProvider } from './SiteContext';

const splash = document.getElementById('preload-splash');
if (splash) splash.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SiteProvider>

  </StrictMode>,
)
