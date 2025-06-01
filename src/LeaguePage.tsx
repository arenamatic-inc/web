import { useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import { getRoomSlug } from "./utils/roomSlug";

const API_BASE = import.meta.env.VITE_API_BASE!;
const API_KEY = import.meta.env.VITE_API_KEY!;

export default function LeagueViewer() {
    const [leagues, setLeagues] = useState<any[]>([]);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [standings, setStandings] = useState<any[]>([]);
    const [tab, setTab] = useState<"results" | "schedule" | "standings">("results");

    useEffect(() => {
        async function loadLeagues() {
          const slug = await getRoomSlug();
          if (!slug) return;
      
          try {
            const res = await fetch(`${API_BASE}/event/${slug}/leagues`, {
              headers: {
                "x-api-key": API_KEY,
              },
            });
            const data = await res.json();
            setLeagues(data);
          } catch (err) {
            console.error("Failed to load leagues:", err);
          }
        }
      
        loadLeagues();
      }, []);

      useEffect(() => {
        if (!selectedSlug) return;

        fetch(`${API_BASE}/event/${selectedSlug}/match_reports`, {
            headers: {
                "x-api-key": API_KEY,
            },
        })
            .then((res) => res.json())
            .then(setMatches)
            .catch(console.error);

        fetch(`${API_BASE}/event/ottawa/league/${selectedSlug}`, {
            headers: {
                "x-api-key": API_KEY,
            },
        })
            .then((res) => res.json())
            .then((data) => setStandings(data?.event?.players ?? []))
            .catch(console.error);
    }, [selectedSlug]);

    const renderResults = () => (
        <div className="space-y-4">
            {matches.filter(m => m.status !== 'Future').map((match) => (
                <div key={match.id} className="p-4 rounded border border-white/30 text-white bg-black/20 backdrop-blur-sm">
                    <div className="font-bold text-lg">{match.p1_name} vs {match.p2_name}</div>
                    <div className="text-sm text-gray-400">{match.table_name || "Table TBA"}</div>
                    <div className="text-lg font-semibold my-2">Match Score: {match.p1_games} - {match.p2_games}</div>

                    {Array.isArray(match.gamescores) && match.gamescores.length > 0 && (
                        <table className="text-sm mb-2 mx-auto text-white/90">
                            <thead>
                                <tr>
                                    <th className="text-right pr-4">Frame</th>
                                    <th className="text-left">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {match.gamescores.map((g: any, i: number) => (
                                    <tr key={i}>
                                        <td className="text-right pr-4">{i + 1}</td>
                                        <td className="text-left">{g[0]} - {g[1]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {match.match_highlights && (
                        <div className="mt-3">
                            <div className="font-semibold mb-1">Highlights</div>
                            {match.match_highlights.length > 0 ? (
                                <div className="space-y-2">
                                    {match.match_highlights.map((h: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div>{new Date(h.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div>{h.title || "Shot"}</div>
                                            <a
                                                href={h.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-3 py-1 rounded"
                                            >
                                                Watch
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm italic text-gray-400">No highlights captured.</div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderSchedule = () => {
        const futureMatches = matches.filter(m => m.status === 'Future');

        const grouped: { [date: string]: any[] } = {};
        futureMatches.forEach(match => {
            const dateStr = new Date(match.start).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(match);
        });

        return (
            <div className="space-y-6">
                {Object.entries(grouped).map(([date, group]) => {
                    const sortedGroup = [...group].sort((a, b) => {
                        const timeDiff = a.start - b.start;
                        if (timeDiff !== 0) return timeDiff;
                        const aTable = a.table_name || "";
                        const bTable = b.table_name || "";
                        return aTable.localeCompare(bTable);
                    });

                    return (
                        <div
                            key={date}
                            className="flex flex-col md:flex-row md:items-start border border-white/30 rounded backdrop-blur-sm bg-black/20 text-white"
                        >
                            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-white/20 p-4">
                                <h3 className="text-xl font-bold">{date}</h3>
                            </div>
                            <div className="md:w-2/3 p-4 space-y-4">
                                {sortedGroup.map(match => (
                                    <div key={match.id} className="border border-white/20 p-4 rounded">
                                        <div className="font-bold text-lg">{match.p1_name} vs {match.p2_name}</div>
                                        <div className="text-sm">{match.table_name || "Table TBA"}</div>
                                        <div className="text-sm">
                                            {new Date(match.start).toLocaleTimeString(undefined, {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderStandings = () => (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-white">Standings</h2>
            <div className="border border-white/30 rounded backdrop-blur-sm bg-black/20 text-white p-4 overflow-x-auto">
                <table className="w-full text-sm text-white border-collapse min-w-[500px]">
                    <thead className="border-b border-white/30">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Matches Won</th>
                            <th className="p-2 text-left">Matches Lost</th>
                            <th className="p-2 text-left">Frames Won</th>
                            <th className="p-2 text-left">Frames Lost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(standings ?? []).map((p: any, i: number) => (
                            <tr key={i} className="border-b border-white/10">
                                <td className="p-2">{p.player.display_name || `${p.player.first_name} ${p.player.last_name}`}</td>
                                <td className="p-2">{p.matches_won ?? 0}</td>
                                <td className="p-2">{p.matches_lost ?? 0}</td>
                                <td className="p-2">{p.frames_won ?? 0}</td>
                                <td className="p-2">{p.frames_lost ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            <PageLayout>
                <div className="relative px-4 pb-32 max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl mb-6">League Viewer</h1>

                    <select
                        className="mb-6 text-black p-2 rounded"
                        onChange={(e) => setSelectedSlug(e.target.value)}
                        value={selectedSlug || ""}
                    >
                        <option value="">Select a league</option>
                        {leagues.map((league) => (
                            <option key={league.slug} value={league.slug}>
                                {league.event.name || league.event.description || league.slug}
                            </option>
                        ))}
                    </select>

                    {selectedSlug && (
                        <div>
                            <div className="flex space-x-4 mb-6">
                                <button onClick={() => setTab("results")} className={tab === "results" ? "underline" : ""}>Results</button>
                                <button onClick={() => setTab("schedule")} className={tab === "schedule" ? "underline" : ""}>Schedule</button>
                                <button onClick={() => setTab("standings")} className={tab === "standings" ? "underline" : ""}>Standings</button>
                            </div>

                            {tab === "results" && renderResults()}
                            {tab === "schedule" && renderSchedule()}
                            {tab === "standings" && renderStandings()}
                        </div>
                    )}
                </div>
            </PageLayout>
        </>
    );
}
