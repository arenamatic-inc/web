import React from "react";

export default function ArenamaticStreaming() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-white to-gray-50 py-20 text-center px-6">
                <img
                    src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/arenamatic_logo_2.png?20250530_2"
                    alt="Arenamatic logo"
                    className="mx-auto h-36 mb-6"
                />
                <h1 className="text-3xl font-bold mb-4">Arenamatic Match Streaming</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Relive every frame. Share the moments that matter. Streaming built into every match.
                </p>
            </section>

            {/* How It Works */}
            <section className="py-16 px-6 md:px-16 text-center">
                <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
                <p className="text-gray-700 max-w-3xl mx-auto mb-8">
                    Streaming is fully integrated into every table. No setup, no equipment, no tech hassle.
                    <br /><br />
                    You can start a stream at any point during a match — and whether you start at the
                    beginning or halfway through, you’ll get the full match video from the very first shot.
                    <br /><br />
                    Payment is only required if you choose to share or keep a recording. Start the stream,
                    and you’ll pay for the match duration. Join halfway, and you’ll still get the complete
                    video — and you’ll pay at the end. Want to revisit a match after it’s over? You can
                    purchase the recording within a limited window and go back in time to watch it all.
                </p>
            </section>

            {/* Player Value */}
            <section className="bg-gray-100 py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">For Players</h2>
                <ul className="text-gray-700 max-w-2xl mx-auto text-left list-disc list-inside space-y-3">
                    <li>
                        <strong>Go back in time:</strong> Start a stream late, or even after the match, and get
                        the full video from the beginning.
                    </li>
                    <li>
                        <strong>Relive the highlights:</strong> Scroll back to great shots or settle disputes,
                        even mid-match.
                    </li>
                    <li>
                        <strong>Share only if you want:</strong> Keep streams private by default, or share them
                        with friends or the public.
                    </li>
                    <li>
                        <strong>No setup required:</strong> Streaming is built into every table, ready when you are.
                    </li>
                </ul>
            </section>

            {/* Club Value */}
            <section className="py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">For Clubs</h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                    Streaming drives engagement and keeps players coming back. It also creates new revenue
                    opportunities without changing how you run your room. Players pay only when they keep or
                    share a recording — everything else runs automatically in the background.
                </p>
            </section>

            {/* Contact */}
            <section className="py-20 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Contact</h2>
                <p className="text-gray-700 mb-4">
                    Want to bring integrated streaming to your club?
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
