import { useEffect, useState } from 'react';
import { SiYoutube, SiInstagram, SiFacebook, SiApple, SiAndroid } from "react-icons/si";
import { MdEmail } from "react-icons/md";
// import { useAuth } from './auth/useAuth';
import PageLayout from "./PageLayout";

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

export default function WebLanding() {
  const [data, setData] = useState<WebPublicContent | null>(null);

  useEffect(() => {
    fetch(MOCK_API_URL, {
      headers: {
        'X-Club-Host': window.location.hostname,
      },
    })
    
      .then(res => res.json())
      .then((json) => {
        setData(json);
        localStorage.setItem("room_slug", json.slug);
      })
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const assetBase = `https://d2o72uxgym8vs9.cloudfront.net/clubs/${data.slug}`;
  const logoUrl = `${assetBase}/logo.png?v=20240517`;
  const fallbackLogoUrl = `https://d2o72uxgym8vs9.cloudfront.net/clubs/defaults/logo.png`;
  const IOS_APP_URL = "https://apps.apple.com/us/app/snookerclub/id6475537905";
  const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.ottawasnookerclub.SnookerClub&pli=1";


  return (
    <>
      <PageLayout>

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
      </PageLayout>
    </>
  );
}

