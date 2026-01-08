import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/useAuth";
import { ADMIN_MENU_ITEMS } from "./constants/adminMenu";

export default function NavBar() {
  const { user, permissions, logout, login } = useAuth();

  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAdminDropdown(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminItems = ADMIN_MENU_ITEMS.filter(item =>
    permissions?.global_permissions?.includes(item.requiredPermission) ||
    permissions?.room_permissions?.includes(item.requiredPermission)
  );
  const showAdmin = adminItems.length > 0;

  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-black/50 backdrop-blur-md text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
          <a href="/">OSC</a>
        </div>
        <div className="space-x-6 text-sm font-medium flex items-center">
          <a href="/" className="hover:text-red-400">Home</a>
          <a href="/leagues" className="hover:text-red-400">Leagues</a>
          <a href="/faq" className="hover:text-red-400">FAQ</a>

          {showAdmin && (
            <div className="relative inline-block" ref={adminDropdownRef}>
              <button
                onClick={() => setShowAdminDropdown(prev => !prev)}
                className="hover:text-red-400"
              >
                Admin
              </button>
              {showAdminDropdown && (
                <div className="absolute left-0 mt-2 bg-black p-2 rounded shadow-lg text-sm min-w-[160px] text-left z-50">
                  {adminItems.map(item => (
                    <a
                      key={item.path}
                      href={item.path}
                      className="block px-4 py-2 text-white hover:text-red-400"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative inline-block" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="hover:text-red-400"
              >
                {user.email || "Profile"}
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 bg-black p-2 rounded shadow-lg text-sm min-w-[140px] text-left z-50">
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
