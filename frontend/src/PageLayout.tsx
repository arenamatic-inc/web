import { useEffect } from "react";
import NavBar from "./NavBar";
import { usePublicContent } from "./hooks/usePublicContent";

type PageLayoutProps = {
    children: React.ReactNode;
};

export default function PageLayout({ children }: PageLayoutProps) {
    const { publicContent } = usePublicContent();

    const assetBase = publicContent?.slug
        ? `https://d2o72uxgym8vs9.cloudfront.net/clubs/${publicContent.slug}`
        : `https://d2o72uxgym8vs9.cloudfront.net/clubs/defaults`;

    const heroUrl = `${assetBase}/hero_tiled.jpg?v=20240518`;

    useEffect(() => {
        if (publicContent?.name) {
            document.title = publicContent.name;
        }
    }, [publicContent]);

    return (
        <>
            <NavBar />
            <div
                className="w-full text-gray-200 bg-black pt-16 min-h-screen"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(
                            to bottom,
                            rgba(0, 0, 0, 0.65),
                            rgba(0, 0, 0, 0.65) 100%,
                            black 100%,
                            black 150%
                        ),
                        url('${heroUrl}')
                    `,
                    backgroundRepeat: 'repeat-y',
                    backgroundSize: '100% auto',
                    backgroundPosition: 'top center',
                    backgroundAttachment: 'scroll',
                }}
                            >
                {children}
            </div>
        </>
    );
}
