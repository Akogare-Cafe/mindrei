import { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Pricing - MindRei | Simple, Transparent Plans",
  description:
    "Choose the perfect MindRei plan for your needs. Free, Pro, and Team plans available. Start with our free tier and upgrade anytime.",
  openGraph: {
    title: "Pricing - MindRei | Simple, Transparent Plans",
    description:
      "Choose the perfect MindRei plan. Free tier available. Pro and Team plans for power users.",
    url: "https://mindrei.app/pricing",
    siteName: "MindRei",
    type: "website",
    images: [
      {
        url: "/og-pricing.png",
        width: 1200,
        height: 630,
        alt: "MindRei Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - MindRei | Simple, Transparent Plans",
    description: "Choose the perfect MindRei plan. Free tier available.",
    images: ["/og-pricing.png"],
  },
  alternates: {
    canonical: "https://mindrei.app/pricing",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "MindRei",
  description: "AI-powered voice to mind map application",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "10 mind maps per month, basic features",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "12",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "12",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
      description: "Unlimited mind maps, advanced features",
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "29",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "29",
        priceCurrency: "USD",
        billingDuration: "P1M",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "USER",
        },
      },
      description: "Team collaboration, admin controls, API access",
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-12">
        <PricingSection />
        <CTASection />
      </div>
    </>
  );
}
