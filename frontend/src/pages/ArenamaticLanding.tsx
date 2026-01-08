import React, { useEffect } from "react";

export default function ArenamaticLanding() {
    useEffect(() => {
        document.title = "Arenamatic";
        const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
        favicon.setAttribute("rel", "icon");
        favicon.setAttribute("href", "https://d2o72uxgym8vs9.cloudfront.net/arenamatic/arenamatic_favicon.svg");
        document.head.appendChild(favicon);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-white to-gray-50 py-20 text-center px-6">
                <img
                    src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/arenamatic_header_logo.svg"
                    alt="Arenamatic logo"
                    className="mx-auto h-36 mb-6"
                />

                <h1 className="text-3xl md:text-4xl font-semibold max-w-3xl mx-auto leading-tight mb-6 text-gray-900">
                    The only fully automated platform that provides a pro-level experience,
                    grows a real snooker community, and runs itself.
                </h1>

                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
                    Arenamatic unifies scoring tablets, table-side controllers, mobile app, website,
                    automatic player-controlled streaming, lighting, access, billing, and real-time monitoring
                    into one resilient system that eliminates most operating cost and maximizes revenue.
                </p>

                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
                    Designed to remove every barrier between a player and the table. No booking, no staff,
                    no friction — just great snooker.
                </p>

                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    By integrating every part of the room and every part of the experience, Arenamatic makes
                    the club feel alive, consistent, and effortless to run.
                </p>
            </section>

            {/* Three Pillars With Images */}
            <section className="py-20 px-6 md:px-16 bg-white text-center">
                <h2 className="text-2xl font-semibold mb-12">What Arenamatic Delivers</h2>

                <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto text-left">

                    {/* Player Experience */}
                    <div>
                        <div className="w-full h-64 flex items-center justify-center">
                            <img
                                src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/player_experience.jpg"
                                alt="Player experience"
                                className="max-h-full object-contain rounded-xl shadow mb-4"
                            />
                        </div>
                        <h3 className="font-semibold text-lg text-blue-900 mb-4">Player Experience</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-700">
                            <li>A club that plays like the pros</li>
                            <li>Instant scoring at the table</li>
                            <li>Live score overlays on TV & YouTube</li>
                            <li>Player-controlled, responsible streaming</li>
                            <li>Real-time room view: who’s playing, which tables are free</li>
                            <li>Matchfinder: find new opponents</li>
                            <li>No booking — just walk in and play</li>
                            <li>Automated tournaments</li>
                        </ul>
                    </div>

                    {/* Owner Experience */}
                    <div>
                        <div className="w-full h-64 flex items-center justify-center">
                            <img
                                src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/owner_experience.jpg"
                                alt="Owner dashboard"
                                className="max-h-full object-contain rounded-xl shadow mb-4"
                            />
                        </div>
                        <h3 className="font-semibold text-lg text-blue-900 mb-4">Owner Experience</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-700">
                            <li>Runs itself — 24/7, staff-free</li>
                            <li>Automatic access control, lighting, and to-the-penny billing</li>
                            <li>Multiple self-serve play modes</li>
                            <li>Full financial dashboard & reconciliation</li>
                            <li>Room activity dashboard: door access, history, live & past matches</li>
                            <li>Underpayment / misuse detection</li>
                            <li>Operate your club from anywhere in the world</li>
                            <li>Fine-grained permission controls for delegation</li>
                        </ul>
                    </div>

                    {/* The Platform */}
                    <div>
                        <div className="w-full h-64 flex items-center justify-center">
                            <img
                                src="https://d2o72uxgym8vs9.cloudfront.net/arenamatic/the_platform.jpg"
                                alt="The platform"
                                className="max-h-full object-contain rounded-xl shadow mb-4"
                            />
                        </div>
                        <h3 className="font-semibold text-lg text-blue-900 mb-4">The Platform</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-700">
                            <li>A fully-integrated, battle-tested system</li>
                            <li>Tablet + big-screen TV at every table</li>
                            <li>Players interact through the mobile app</li>
                            <li>Automated cameras and streaming</li>
                            <li>In-room controllers: video, lighting, doors, more</li>
                            <li>Cloud-coordinated, high-availability architecture</li>
                            <li>Built end-to-end in a real 24/7 club</li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* The Problem */}
            <section className="py-16 px-6 md:px-16 text-center bg-white">
                <h2 className="text-2xl font-semibold mb-6">The problem with providing snooker today</h2>

                <p className="text-gray-700 max-w-3xl mx-auto mb-6">
                    Most snooker clubs are forced into a business model that works against the game.
                    Snooker tends to survive commercially only when supported by bars, pool tables, and other
                    distractions — the opposite of the quiet, focused environment most players want.
                </p>

                <p className="text-gray-700 max-w-3xl mx-auto">
                    Many owners try to fix this with creativity: booking platforms, access tools, lighting controls,
                    scoring apps, and other bits of automation. These solutions help, but because they’re separate,
                    they can’t coordinate match flow, walk-in play, or community-building. And booking systems,
                    though well-intentioned, still force players to guess match length and leave gaps that hurt utilization.
                </p>
            </section>

            {/* The Arenamatic Approach */}
            <section className="py-16 px-6 md:px-16 text-center bg-gray-50">
                <h2 className="text-2xl font-semibold mb-6">The Arenamatic Approach</h2>

                <p className="text-gray-700 max-w-3xl mx-auto mb-10">
                    Arenamatic works because it treats the entire club as one coordinated system.
                    It’s built on three principles:
                </p>

                <div className="max-w-prose mx-auto">
                    <ul className="list-disc space-y-3 pl-5 text-gray-800">
                        <li>Give players a better experience than any staffed club</li>
                        <li>Make the club run itself, even when the owner is away for weeks</li>
                        <li>Integrate everything so nothing falls between the cracks</li>
                    </ul>
                </div>

                <p className="text-gray-700 max-w-3xl mx-auto mt-8">
                    The result is a room that feels active and social, an operating model that needs no on-site presence,
                    and a level of reliability that no combination of separate tools can deliver.
                </p>
            </section>

            {/* Origin Story */}
            <section className="py-20 px-6 md:px-16 bg-gray-50 text-center">
                <h2 className="text-2xl font-semibold mb-10">Why Arenamatic Exists</h2>

                <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    For years, nothing changed — because the traditional snooker business model makes it nearly impossible.
                    To run a snooker club at a high standard, owners usually have to bolt it onto a restaurant or sports bar,
                    turning snooker into the “quiet corner” of a much louder business. Even well-run hybrid venues leave the
                    owner with little time to actually enjoy the game.
                    <br /><br />
                    The thought emerged: What if a club could run entirely through automation? If it could, the experience for players could improve dramatically — not just the economics.
                    <br /><br />
                    The idea was tested the only way possible: by building a complete prototype at home, from scratch, piece by piece, until a fully automated snooker environment could function end to end. After about 18 months, the first version worked well enough to justify opening a real space. Tables were installed, the doors opened, and the early months were a mix of local players, free sessions, and continuous iteration whenever something broke.
                    <br /><br />
                    Eventually the system stabilized. The club ran for days on its own — then weeks, then months. Features were rebuilt based on feedback. New capabilities were added. And the early hardware — microcontrollers, component cameras, relay boards, and all the jumper cables and soldering — was replaced with off-the-shelf controllers using USB, HDMI, and custom software. The platform gradually evolved into something industrial-grade.
                    <br /><br />
                    The next phase was operations. Admin features were added to delegate table maintenance and league management to members who wanted to help. Web interfaces replaced hand-written SQL for tasks like refunds. A financial dashboard removed manual bookkeeping. A room-activity dashboard enabled true remote supervision. And as membership expanded and some pushed boundaries, new systems made it easy to detect underpayment or “time theft.” Multi-club support had been designed from the beginning, and a dedicated lab was built to exercise it.
                    <br /><br />
                    The result is a fully automated platform tested through thousands of real matches and everyday operational challenges. It grew from lived experience — not from a product plan or startup playbook — but from solving the practical problems of running a snooker-first club with no staff and high standards.
                </p>
            </section>

            {/* Future of the Game */}
            <section className="py-20 px-6 md:px-16 bg-white text-center">
                <h2 className="text-2xl font-semibold mb-10">Supporting the Future of the Game</h2>

                <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    Snooker grows when the experience is good, the environment is consistent,
                    and clubs are financially sustainable. The last part has always been the hardest.
                    Traditional models rely on food, drink, or other table games to subsidize snooker,
                    and that pressure often works against the quiet, focused environment players want.
                    <br /><br />
                    Arenamatic helps flip that equation. By removing staffing burdens and automating operational overhead,
                    clubs can offer a better experience at a lower cost — and one that fits how people expect to interact
                    with activities today: modern, connected, shareable, and social.
                    <br /><br />
                    Players can track matches, stream their play, revisit highlights, and see what’s happening in the room
                    before they arrive. These touches help younger players engage more deeply and give clubs new ways
                    to build community without sacrificing the integrity of the game.
                    <br /><br />
                    As clubs grow, the infrastructure keeps up: automated billing, maintenance tracking, tournaments,
                    scoring, streaming, and full room visibility all scale without adding complexity.
                    This makes it easier to welcome new demographics — younger players, new players,
                    and players who simply want a safe, respectful, well-run environment.
                    <br /><br />
                    Snooker doesn’t need louder venues or more distractions to grow. It needs a modern operating model
                    that respects the game, serves players well, and makes sustainable clubs possible again.
                    Arenamatic is one way to make that possible.
                </p>
            </section>

            {/* Contact */}
            <section className="py-20 px-6 text-center bg-gray-50">
                <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                <p className="text-gray-700 mb-4">
                    If you’re building a club, running one, or simply want to understand what full automation can do for your space, I’m always happy to talk.
                </p>
                <p className="text-gray-700">
                    <strong>Email:</strong> info@arenamatic.ca<br />
                    <strong>Ottawa Club:</strong> <a href="https://www.ottawasnookerclub.com" className="text-blue-900 underline">www.ottawasnookerclub.com</a>
                </p>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 text-sm text-gray-500 text-center">
                &copy; {new Date().getFullYear()} Arenamatic Inc. All rights reserved.
            </footer>

        </div>
    );
}
