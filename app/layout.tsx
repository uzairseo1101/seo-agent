import type { Metadata } from "next";
import "./globals.css";
import { SiteJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankpilot.ai"),
  title: {
    default: "RankPilot AI - AI SEO Agent for Audits, Keywords & Reports",
    template: "%s | RankPilot AI",
  },
  description: "RankPilot AI is an AI SEO agent that audits websites, discovers striking-distance keyword opportunities, and verifies technical fixes automatically.",
  keywords: [
    "AI SEO agent",
    "AI SEO assistant",
    "AI SEO tool",
    "AI SEO for agencies",
    "AI SEO for freelancers",
    "automated SEO audit",
    "AI keyword research tool",
    "white-label SEO reports",
    "AI SEO automation"
  ],
  openGraph: {
    title: "RankPilot AI - AI SEO Agent for Audits, Keywords & Reports",
    description: "Tell the agent what you need in plain English. It audits your site, finds keywords, writes content briefs and builds client reports in minutes.",
    type: "website",
    siteName: "RankPilot AI",
    url: "https://rankpilot.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankPilot AI - AI SEO Agent for Audits, Keywords & Reports",
    description: "Autonomous AI SEO agent for freelancers, agencies and SEO teams. Audit, research and fix SEO in minutes.",
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
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}
