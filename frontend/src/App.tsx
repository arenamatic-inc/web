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
import ArenamaticLanding from './pages/ArenamaticLanding';
import RoomActivityPage from './pages/admin/RoomActivity';

function App() {
  const hostname = window.location.hostname;
  const isAuthHost = hostname === import.meta.env.VITE_AUTH_HOST;
  const isArenamaticSite = hostname === import.meta.env.VITE_ARENAMATIC_HOST;


  console.log(import.meta.env.VITE_COGNITO_CLIENT_ID); // Should log the value from .env
  console.log(import.meta.env.VITE_COGNITO_DOMAIN); // Log this in your frontend code

  console.log("Detected hostname:", window.location.hostname);
  console.log("Expected auth host:", import.meta.env.VITE_AUTH_HOST);
  console.log("Expected arenamatic host:", import.meta.env.VITE_ARENAMATIC_HOST);

  let routeElements;

  if (isArenamaticSite) {
    routeElements = (
      <>
        <Route path="*" element={<ArenamaticLanding />} />
      </>
    );
  } else if (isAuthHost) {
    routeElements = (
      <>
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/logout/callback" element={<LogoutCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<div className="p-8 text-white">Unknown auth route</div>} />
      </>
    );
  } else {
    routeElements = (
      <>
        <Route path="/" element={<WebLanding />} />
        <Route path="/login/finish" element={<LoginFinish />} />
        <Route path="/account" element={<Account />} />
        <Route path="/leagues" element={<LeaguePage />} />
        <Route path="/admin/activity" element={<RoomActivityPage />} />
        <Route path="*" element={<div className="p-8">Page not found</div>} />
      </>
    );
  }

  return (
    <Router>
      <Routes>{routeElements}</Routes>
    </Router>
  );
}

export default App;

