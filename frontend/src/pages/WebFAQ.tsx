import { useEffect, useState } from "react";
import PageLayout from "../PageLayout";

const FAQ_API_URL = `${import.meta.env.VITE_API_BASE}/web/faq`;

type FaqItem = {
    question: string;
    answer: string;
};

type FaqCategory = {
    title: string;
    items: FaqItem[];
};

type WebFaq = {
    categories: FaqCategory[];
};

function renderParagraphs(text: string) {
    return text
        .trim()
        .split(/\n\s*\n/)
        .map((paragraph, idx) => (
            <p key={idx} className="mb-4">
                {paragraph}
            </p>
        ));
}

export default function WebFaq() {
    const [data, setData] = useState<WebFaq | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(FAQ_API_URL, {
            headers: {
                "X-Club-Host": window.location.hostname,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch((err) => {
                console.error(err);
                setError("Failed to load FAQ");
            });
    }, []);

    if (error) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-red-400">{error}</div>
            </PageLayout>
        );
    }

    if (!data) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-neutral-400">Loading…</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="relative px-4 pb-32 max-w-5xl mx-auto">
                <header className="text-center py-16">
                    <h1 className="text-4xl font-bold text-gray-200 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Everything you need to know before, during, and after your visit.
                    </p>
                </header>

                {/* =============================== */}
                {/* NEW: Jump menu */}
                {/* =============================== */}
                <nav className="mb-12 flex flex-wrap justify-center gap-4">
                    {data.categories.map((category, idx) => {
                        const anchor = category.title.toLowerCase().replace(/\s+/g, "-");
                        return (
                            <a
                                key={idx}
                                href={`#${anchor}`}
                                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-sm transition"
                            >
                                {category.title}
                            </a>
                        );
                    })}
                </nav>

                {/* ================================== */}
                {/* Categories + content */}
                {/* ================================== */}
                {data.categories.map((category, idx) => {
                    const anchor = category.title.toLowerCase().replace(/\s+/g, "-");
                    return (
                        <section key={idx} id={anchor} className="mb-16 scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-gray-300 mb-6">
                                {category.title}
                            </h2>

                            <div className="space-y-4">
                                {category.items.map((item, i) => (
                                    <details
                                        key={i}
                                        className="group bg-neutral-900 rounded-xl px-6 py-4 border border-neutral-800"
                                    >
                                        <summary className="cursor-pointer list-none flex justify-between items-center text-lg font-medium text-neutral-200">
                                            {item.question}
                                            <span className="ml-4 text-neutral-500 group-open:rotate-180 transition-transform">
                                                ▾
                                            </span>
                                        </summary>

                                        <div className="prose prose-invert prose-lg mt-4 max-w-none text-neutral-300">
                                            {renderParagraphs(item.answer)}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </PageLayout>
    );
}
