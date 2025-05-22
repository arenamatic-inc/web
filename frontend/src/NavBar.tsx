import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/useAuth";

export default function Navbar() {
  const { user, logout, login } = useAuth();  // Destructure login from useAuth
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

//   function startLogin() {
//     const state = ${window.location.origin}/login/finish;
//     window.location.href = https://auth.arenamatic.ca/login?state=${encodeURIComponent(state)};
//   }
  
  
  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-black/50 backdrop-blur-md text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
          <a href="/">OSC</a>
        </div>
        <div className="space-x-6 text-sm font-medium">
          <a href="/" className="hover:text-red-400">Home</a>
          <a href="#" className="hover:text-red-400">Results</a>
          <a href="/leagues" className="hover:text-red-400">Leagues</a>
          {user ? (
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                className="hover:text-red-400"
              >
                {user.email || "Profile"}
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 bg-black p-2 rounded shadow-lg text-sm min-w-[140px] text-left z-50">
                  <a href="/account" className="block px-4 py-2 text-white hover:text-red-400">Account</a>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-white hover:text-red-400">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="hover:text-red-400">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}
