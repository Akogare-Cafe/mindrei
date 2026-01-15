"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out MindRei",
    price: "$0",
    period: "forever",
    features: [
      "10 mind maps per month",
      "Basic voice recognition",
      "Standard AI generation",
      "Export to PNG",
      "Community support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
    rarity: "common" as const,
  },
  {
    name: "Pro",
    description: "For individuals who think big",
    price: "$12",
    period: "per month",
    features: [
      "Unlimited mind maps",
      "Advanced voice recognition",
      "GPT-4o powered generation",
      "Export to PNG, PDF, JSON",
      "Priority support",
      "Custom node colors",
      "Collaboration (up to 3)",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    popular: true,
    rarity: "rare" as const,
  },
  {
    name: "Team",
    description: "For teams that collaborate",
    price: "$29",
    period: "per user/month",
    features: [
      "Everything in Pro",
      "Unlimited collaborators",
      "Team workspaces",
      "Admin controls",
      "SSO authentication",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/contact?plan=team",
    popular: false,
    rarity: "legendary" as const,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-primary mb-4"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "relative",
                plan.popular && "md:-mt-4 md:mb-4"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <PixelBadge variant="accent" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </PixelBadge>
                </div>
              )}
              
              <PixelCard rarity={plan.rarity} className="h-full">
                <PixelCardHeader className="text-center pb-6">
                  <PixelCardTitle className="text-xl">{plan.name}</PixelCardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.period}</span>
                  </div>
                </PixelCardHeader>
                
                <PixelCardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.href} className="block">
                    <PixelButton
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </PixelButton>
                  </Link>
                </PixelCardContent>
              </PixelCard>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All prices in USD. Cancel anytime. No hidden fees.
        </motion.p>
      </div>
    </section>
  );
}
