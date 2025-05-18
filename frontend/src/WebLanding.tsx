import { useEffect, useRef, useState } from 'react';
import { SiYoutube, SiInstagram, SiFacebook, SiApple, SiAndroid } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { useAuth } from './auth/useAuth';

const MOCK_API_URL = `${import.meta.env.VITE_API_BASE}/web/public_content`;

type WebPublicContent = {
  name: string;
  slug: string;
  tagline: string;
  subline: string;
  sections: { title: string; html: string }[];
  social?: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    email?: string;
  };
};

function startLogin() {
  const state = `${window.location.origin}/login/finish`;
  window.location.href = `https://auth.arenamatic.ca/login?state=${encodeURIComponent(state)}`;
}

export default function WebLanding() {
  const [data, setData] = useState<WebPublicContent | null>(null);
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
  const { user, logout } = useAuth();

  useEffect(() => {
    fetch(MOCK_API_URL, {
      headers: {
        'X-Club-Host': window.location.hostname,
      },
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const assetBase = `https://d2o72uxgym8vs9.cloudfront.net/clubs/${data.slug}`;
  const logoUrl = `${assetBase}/logo.png?v=20240517`;
  const fallbackLogoUrl = `https://d2o72uxgym8vs9.cloudfront.net/clubs/defaults/logo.png`;
  const heroUrl = `${assetBase}/hero.jpg?v=20240517`;
  const fallbackHeroUrl = `https://d2o72uxgym8vs9.cloudfront.net/clubs/defaults/hero.jpg`;
  const IOS_APP_URL = "https://apps.apple.com/us/app/snookerclub/id6475537905";
  const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.ottawasnookerclub.SnookerClub&pli=1";


  return (
    <>
      {/* Static Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-black/50 backdrop-blur-md text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-bold">OSC</div>
          <div className="space-x-6 text-sm font-medium">
            <a href="#" className="hover:text-red-400">Home</a>
            <a href="#" className="hover:text-red-400">Results</a>
            <a href="#" className="hover:text-red-400">Events</a>
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
                    <a
                      href="/account"
                      className="block px-4 py-2 text-white hover:text-red-400"
                    >
                      Account
                    </a>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-white hover:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={startLogin} className="hover:text-red-400">
                Login
              </button>
            )}
            <a href="#" className="hover:text-red-400">Admin</a>
          </div>
        </div>
      </nav>

      {/* Hero + content area */}
      <div
        className="w-full text-gray-200 bg-black pt-16"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,1)), url('${heroUrl || fallbackHeroUrl}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
          backgroundAttachment: 'scroll',
        }}
      >
        <div className="relative px-4 pb-32 max-w-5xl mx-auto text-center">
          {/* Logo + tagline */}
          <img
            src={logoUrl || fallbackLogoUrl}
            alt={`${data.name} logo`}
            className="w-[85%] h-auto mx-auto mb-6 drop-shadow-xl"
          />
          <p className="text-xl md:text-2xl text-gray-200 mb-4">
            {data.tagline}
          </p>
          <p className="text-md md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            {data.subline}
          </p>

          {/* Content Sections */}
          {data.sections.map((section, idx) => (
            <section
              key={idx}
              className="max-w-4xl mx-auto px-4 py-10"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-300">{section.title}</h2>
              <div
                className="prose prose-invert prose-lg max-w-none text-neutral-200"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </section>
          ))}

          {/* Footer */}
          <footer className="text-center py-10 mt-16 text-neutral-400">
            <div className="flex justify-center gap-6 my-6 text-white text-xl">
              {data.social?.email && (
                <a href={`mailto:${data.social.email}`} target="_blank" className="hover:text-red-400">
                  <MdEmail />
                </a>
              )}
              {data.social?.facebook && (
                <a href={data.social.facebook} target="_blank" className="hover:text-red-400">
                  <SiFacebook />
                </a>
              )}
              {data.social?.instagram && (
                <a href={data.social.instagram} target="_blank" className="hover:text-red-400">
                  <SiInstagram />
                </a>
              )}
              {data.social?.youtube && (
                <a href={data.social.youtube} target="_blank" className="hover:text-red-400">
                  <SiYoutube />
                </a>
              )}
              <a href={IOS_APP_URL} target="_blank" className="hover:text-red-400">
                <SiApple />
              </a>
              <a href={ANDROID_APP_URL} target="_blank" className="hover:text-red-400">
                <SiAndroid />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

