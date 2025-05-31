import React from "react";

export default function ArenamaticLanding() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-white to-gray-50 py-20 text-center px-6">
                <img
                    src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/arenamatic_logo_2.png?20250530_2"
                    alt="Arenamatic logo"
                    className="mx-auto h-36 mb-6"
                />
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Autonomous, always-on venues — built for players, not overhead.
                </p>
            </section>

            {/* What We Do */}
            <section className="py-16 px-6 md:px-16 text-center">
                <h2 className="text-2xl font-semibold mb-6">What We Do</h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                    Arenamatic is a platform for a new kind of venue — autonomous, technology-driven,
                    and built around the activity, not the overhead.
                    <br /><br />
                    We deliver a radically better player experience: seamless access, integrated scoring
                    and streaming, and an environment designed for focus and community.
                    <br /><br />
                    At the same time, we enable a new business model — one that removes the need for
                    constant staffing, maximizes room utilization, and makes it financially viable
                    to operate high-quality recreational spaces 24/7.
                    <br /><br />
                    Our first product, <strong>Arenamatic Snooker</strong>, reimagines the traditional
                    snooker club — but the model applies to a wide range of cue sports and beyond.
                </p>
            </section>

            <section className="bg-gray-100 py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Real-World Proven</h2>
                <p className="text-gray-700 max-w-3xl mx-auto mb-6">
                    The Arenamatic platform powers the Ottawa Snooker Club — a fully autonomous venue
                    open 24/7 with no staff on site. From lighting and access control to live scoring, 
                    streaming, payments, and usage tracking —every element is automated.
                </p>
                <img
                    src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/ottawa-snooker-club-logo-2.png"
                    alt="Ottawa Snooker Club"
                    className="h-12 mx-auto mb-4"
                />
                <a
                    href="https://www.ottawasnookerclub.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white border border-gray-300 text-blue-900 px-6 py-3 rounded-full hover:bg-gray-50"
                >
                    Visit ottawasnookerclub.com →
                </a>
            </section>

            {/* Contact */}
            <section className="py-20 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Contact</h2>
                <p className="text-gray-700 mb-4">
                    Interested in running your room with the Arenamatic platform? Want to learn more?
                </p>
                <a
                    href="mailto:info@arenamatic.ca"
                    className="inline-block bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800"
                >
                    Contact Us
                </a>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 text-sm text-gray-500 text-center">
                &copy; {new Date().getFullYear()} Arenamatic Inc. All rights reserved.
            </footer>
        </div>
    );
}
