import { Metadata } from "next";
import { Navbar } from "@/components/marketing/navbar";
import { SEOFooter } from "@/components/marketing/seo-footer";

export const metadata: Metadata = {
  title: "MindRei - Transform Your Voice Into Mind Maps | AI-Powered",
  description:
    "Transform your voice into beautiful mind maps in real-time. AI-powered speech-to-map conversion for better thinking, brainstorming, and organization.",
  keywords: [
    "mind map",
    "voice to mind map",
    "AI mind mapping",
    "brainstorming tool",
    "speech recognition",
    "visual thinking",
    "productivity",
  ],
  openGraph: {
    title: "MindRei - Transform Your Voice Into Mind Maps",
    description:
      "Speak naturally and watch your ideas transform into beautiful, organized mind maps in real-time. Powered by AI.",
    url: "https://mindrei.app",
    siteName: "MindRei",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MindRei - Voice to Mind Map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindRei - Transform Your Voice Into Mind Maps",
    description:
      "Speak naturally and watch your ideas transform into beautiful mind maps. AI-powered.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://mindrei.app",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <SEOFooter />
    </div>
  );
}
