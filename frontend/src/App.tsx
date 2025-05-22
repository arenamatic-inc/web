import WebLanding from './WebLanding';
import LoginCallback from './LoginCallback';
import LogoutCallback from './LogoutCallback';
import Account from './Account';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext'; // ✅
import LoginFinish from './LoginFinish';
import Login from './auth/Login';
import LeaguePage from './LeaguePage';
import Logout from './auth/Logout';

function App() {
  const hostname = window.location.hostname;
  const isAuthHost = hostname === 'auth.arenamatic.ca';

  console.log(import.meta.env.VITE_COGNITO_CLIENT_ID); // Should log the value from .env
  console.log(import.meta.env.VITE_COGNITO_DOMAIN); // Log this in your frontend code

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {isAuthHost ? (
            <>
              <Route path="/login/callback" element={<LoginCallback />} />
              <Route path="/logout/callback" element={<LogoutCallback />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="*" element={<div className="p-8 text-white">Unknown auth route</div>} />
            </>
          ) : (
            <>
            <Route path="*" element={<WebLanding />} />
            <Route path="/login/finish" element={<LoginFinish />} />
            <Route path="/account" element={<Account />} />
            <Route path="/leagues" element={<LeaguePage />} />
            </>
          )}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

