import { useEffect, useState } from 'react';
const MOCK_API_URL = `${import.meta.env.VITE_API_BASE}/web/public_content`;

type WebPublicContent = {
  name: string;
  slug: string;
  logo_url?: string;
  tagline: string;
  sections: { title: string; html: string }[];
  social?: {
    youtube?: string;
    instagram?: string;
  };
};

export default function WebLanding() {
  const [data, setData] = useState<WebPublicContent | null>(null);

  useEffect(() => {
    fetch(MOCK_API_URL)
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

  return (
    <div
      className="w-full text-gray-200 bg-black"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,1)), url('${heroUrl || fallbackHeroUrl}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundAttachment: 'scroll', // could be 'fixed' for subtle parallax
      }}
    >
      <div className="relative px-4 pt-16 pb-32 max-w-5xl mx-auto text-center">
        {/* Logo + tagline at top */}
        <img
          src={logoUrl || fallbackLogoUrl}
          alt={`${data.name} logo`}
          className="w-[85%] h-auto mx-auto mb-6 drop-shadow-xl"
        />
        <p className="text-xl md:text-2xl text-gray-200 mb-12">
          Play Like the Pros — At Your Table
        </p>
  
        {/* Content Sections */}
        {data.sections.map((section, idx) => (
          <section
            key={idx}
            className="max-w-4xl mx-auto px-4 py-10 border-neutral-700"
          >
            <h2 className="text-3xl font-bold mb-4 text-red-400">{section.title}</h2>
            <div
              className="prose prose-invert prose-lg max-w-none text-neutral-200"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}
  
        {/* Footer */}
        <footer className="text-center py-10 border-neutral-700 mt-16">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} {data.name}
          </p>
          <div className="mt-3 flex justify-center gap-6">
            {data.social?.youtube && (
              <a
                href={data.social.youtube}
                className="text-blue-400 hover:text-white underline"
                target="_blank"
              >
                YouTube
              </a>
            )}
            {data.social?.instagram && (
              <a
                href={data.social.instagram}
                className="text-pink-400 hover:text-white underline"
                target="_blank"
              >
                Instagram
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
  }

