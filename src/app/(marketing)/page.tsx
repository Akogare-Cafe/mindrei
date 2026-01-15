import { Metadata } from "next";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
} from "@/components/marketing";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MindRei",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description:
    "Transform your voice into beautiful mind maps in real-time. AI-powered speech-to-map conversion.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
