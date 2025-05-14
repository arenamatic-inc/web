import { useEffect, useState } from 'react';

const MOCK_API_URL = `${import.meta.env.VITE_API_BASE}/web/public_content`;

type WebPublicContent = {
  name: string;
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

  return (
    <>
      <div className="bg-blue-700 text-white p-4 text-center">✔ Tailwind is working</div>
      <div className="bg-neutral-900 text-white p-4">Tailwind dark mode test</div>
      <div className="bg-black text-white p-4">This should be black background, white text</div>
      <div style={{ backgroundColor: "#111", color: "#fff", padding: "1rem" }}>
  Hardcoded dark style test
</div>


      <div className="min-h-screen bg-neutral-900 text-white font-sans border-8 border-red-500">
        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <img src={data.logo_url} alt="Logo" className="mx-auto h-28 mb-6 drop-shadow-xl" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-white">
            {data.name}
          </h1>
          <p className="text-xs italic text-yellow-300 mb-4">
            Deployed: {new Date().toDateString()}
          </p>
          <p className="text-xl text-neutral-300 max-w-xl mx-auto">
            {data.tagline}
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-md">
              Join Now
            </button>
            <button className="border border-white hover:border-red-400 text-white px-6 py-3 rounded-xl shadow-md">
              View Matches
            </button>
          </div>
          <div className="mt-6">
            <button className="text-sm text-blue-400 underline hover:text-blue-300">
              Login
            </button>
          </div>
        </section>

        {/* Content Sections */}
        {data.sections.map((section, idx) => (
          <section
            key={idx}
            className="max-w-4xl mx-auto px-4 py-10 border-t border-neutral-600"
          >
            <h2 className="text-3xl font-bold mb-4 text-red-400">{section.title}</h2>
            <div
              className="prose prose-invert prose-lg max-w-none text-neutral-200"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}

        {/* Footer */}
        <footer className="text-center py-10 border-t border-neutral-600 mt-16">
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
    </>
  );
}

