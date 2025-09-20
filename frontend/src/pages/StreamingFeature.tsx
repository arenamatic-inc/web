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
                <h1 className="text-3-4xl font-bold mb-4">🎥 Match Streaming with Arenamatic</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Bring a whole new dimension to your game. With Arenamatic’s integrated match streaming,
                    every table is stream-ready—designed to balance convenience, player privacy, and powerful
                    tools for improving and sharing your game.
                </p>
            </section>

            {/* How It Works */}
            <section className="py-16 px-6 md:px-16 text-center">
                <h2 className="text-2xl font-semibold mb-6">🚀 How It Works</h2>
                <ul className="text-gray-700 max-w-3xl mx-auto text-left list-disc list-inside space-y-4">
                    <li>
                        <strong>Start any time—even after the match:</strong> Purchase a stream mid-match or after it ends,
                        and you’ll get the <strong>entire match from the moment the table lights turned on</strong>, not just
                        from the point of purchase.
                    </li>
                    <li>
                        <strong>Your choice of visibility:</strong> Players choose whether the stream is{" "}
                        <strong>unlisted</strong> (private link for the participants) or <strong>public</strong> (visible to
                        everyone, with opponent consent).
                    </li>
                    <li>
                        <strong>Zero setup:</strong> No equipment, no hassle. Streaming is built right into every table.
                    </li>
                </ul>
                <p className="mt-6 text-gray-600 italic">
                    💡 Pro Tip: Want to relive a great shot or settle a scoring dispute? Purchase the stream—even after
                    the match—and scrub back to the exact moment it happened.
                </p>
            </section>

            {/* Player Privacy and Consent */}
            <section className="bg-gray-100 py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">🔒 Player Privacy and Consent</h2>
                <p className="text-gray-700 max-w-3xl mx-auto mb-8">
                    Our streaming system is built to respect privacy while making sharing simple when everyone agrees:
                </p>
                <div className="overflow-x-auto">
                    <table className="table-auto border-collapse border border-gray-300 mx-auto text-left text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Scenario</th>
                                <th className="border border-gray-300 px-4 py-2">Consent Requirements</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Practice / Solo Play</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    No restrictions. Stream or purchase freely.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Match – Unlisted Stream</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    Link is private to both players. You agree not to share it without your opponent’s consent.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Match – Public Stream</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    Your opponent must explicitly approve in the app before the stream is made public.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">
                                    Events (Leagues/Tournaments)
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    Some events may be fully streamed; this is disclosed before registration.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                    This approach was developed through careful iteration—even in collaboration with YouTube—to ensure
                    streaming feels seamless, fun, and respectful.
                </p>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                    <strong>No audio, ever:</strong> While cameras include microphones, all audio is permanently discarded
                    before anything is saved or streamed. Streams are video-only, so conversations in the room remain private.
                </p>
            </section>

            {/* Billing */}
            <section className="py-16 px-6 md:px-16 text-center">
                <h2 className="text-2xl font-semibold mb-6">💰 Billing</h2>
                <ul className="text-gray-700 max-w-3xl mx-auto text-left list-disc list-inside space-y-3">
                    <li>
                        <strong>Premium feature with clear pricing:</strong> Before you purchase, you’ll see the{" "}
                        <strong>additional cost per hour</strong> for streaming.
                    </li>
                    <li>
                        <strong>Full-match access:</strong> You are billed for the entire match duration and receive the
                        full recording from the moment the lights turned on—whether you start streaming at the beginning,
                        in the middle, or after it’s over.
                    </li>
                    <li>
                        <strong>Time-limited archive:</strong> Past matches remain available for a limited period (e.g. 2 weeks).
                    </li>
                    <li>
                        <strong>Promotions:</strong> Clubs may offer free or discounted streams during feature launches.
                    </li>
                </ul>
            </section>

            {/* Why Players Love It */}
            <section className="bg-gray-100 py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">🎯 Why Players Love It</h2>
                <ul className="text-gray-700 max-w-2xl mx-auto text-left list-disc list-inside space-y-3">
                    <li>Review your game and improve with real match footage.</li>
                    <li>Relive big moments—or resolve disputes—with full-match replays.</li>
                    <li>Share great matches with friends (with consent).</li>
                    <li>Let family and friends watch live from anywhere.</li>
                    <li>Enjoy a feature that respects your privacy while adding real value.</li>
                </ul>
            </section>

            {/* Why Clubs Love It */}
            <section className="py-16 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">🏆 Why Clubs Love It</h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                    A premium feature that sets your club apart from traditional venues. Professional-grade presentation
                    elevates your club’s image, and it’s fully integrated with Arenamatic—no setup or maintenance required.
                </p>
            </section>

            {/* Contact */}
            <section className="py-20 px-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Contact</h2>
                <p className="text-gray-700 mb-4">Want to bring integrated streaming to your club?</p>
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
