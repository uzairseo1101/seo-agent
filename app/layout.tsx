import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RankPilot AI — Clean Rank SEO Intelligence & Action SaaS",
    template: "%s | RankPilot AI",
  },
  description: "Connect your website. Discover SEO, GEO and AEO opportunities. Get prioritized actions, monitor performance and verify improvements with AI-powered intelligence.",
  keywords: ["SEO Intelligence", "GEO Optimization", "AEO Optimization", "Google Search Console", "SEO Action Management", "SEO Agency Software"],
  openGraph: {
    title: "RankPilot AI — Evidence-Backed SEO Intelligence & Action Management",
    description: "Turn SEO data into evidence-backed work. Audit technical health, evaluate GEO & AEO signals, uncover high-ROI queries, and verify live fixes.",
    type: "website",
    siteName: "RankPilot AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-text font-sans antialiased selection:bg-primary-tint selection:text-primary">
        {children}
      </body>
    </html>
  );
}
