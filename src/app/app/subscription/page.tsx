"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Crown,
  Brain,
  Users,
  Infinity,
  Shield,
  Clock,
  Download,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle, PixelCardDescription } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { text: "5 mind maps", included: true },
      { text: "Basic voice recording", included: true },
      { text: "Standard AI insights", included: true },
      { text: "Export to PNG", included: true },
      { text: "Community support", included: true },
      { text: "Unlimited collaborators", included: false },
      { text: "Priority AI processing", included: false },
      { text: "Custom themes", included: false },
    ],
    icon: Brain,
    popular: false,
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For power users and professionals",
    features: [
      { text: "Unlimited mind maps", included: true },
      { text: "Advanced voice recording", included: true },
      { text: "Priority AI insights", included: true },
      { text: "Export to all formats", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 10 collaborators", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Custom themes", included: false },
    ],
    icon: Zap,
    popular: true,
    current: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For teams and organizations",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited collaborators", included: true },
      { text: "Team workspace", included: true },
      { text: "Admin controls", included: true },
      { text: "SSO integration", included: true },
      { text: "Custom themes", included: true },
      { text: "API access", included: true },
      { text: "Dedicated support", included: true },
    ],
    icon: Users,
    popular: false,
    current: false,
  },
];

const billingHistory = [
  { date: "Jan 14, 2026", description: "Free Plan - Started", amount: "$0.00", status: "Active" },
];

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  if (!isLoaded || !user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </PixelButton>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlock the full potential of MindRei with our premium plans
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <PixelBadge variant="default" className="text-xs">Save 20%</PixelBadge>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PixelCard
                  className={`relative h-full ${
                    plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""
                  } ${plan.current ? "ring-2 ring-primary/50" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <PixelBadge variant="default" className="shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </PixelBadge>
                    </div>
                  )}
                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <PixelBadge variant="secondary">Current Plan</PixelBadge>
                    </div>
                  )}
                  <PixelCardHeader className="text-center pt-8">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <plan.icon className="w-7 h-7 text-primary" />
                    </div>
                    <PixelCardTitle className="text-xl">{plan.name}</PixelCardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-foreground">
                        {billingCycle === "yearly" && plan.price !== "$0"
                          ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`
                          : plan.price}
                      </span>
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    </div>
                    <PixelCardDescription className="mt-2">
                      {plan.description}
                    </PixelCardDescription>
                  </PixelCardHeader>
                  <PixelCardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              feature.included
                                ? "bg-green-500/10 text-green-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included ? "text-foreground" : "text-muted-foreground line-through"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <PixelButton
                      className="w-full"
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                    </PixelButton>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>

          {/* Current Subscription */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Current Subscription
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      5 mind maps • Basic features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PixelBadge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Active
                  </PixelBadge>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Billing History */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Billing History
              </PixelCardTitle>
              <PixelCardDescription>
                View and download your past invoices
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item, index) => (
                      <tr key={index} className="border-b border-border/30 last:border-0">
                        <td className="py-3 px-4 text-sm text-foreground">{item.date}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{item.amount}</td>
                        <td className="py-3 px-4">
                          <PixelBadge variant="secondary" className="text-xs">
                            {item.status}
                          </PixelBadge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <PixelButton variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </PixelButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* FAQ */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle>Frequently Asked Questions</PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              {[
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
                },
                {
                  q: "What happens to my mind maps if I downgrade?",
                  a: "Your mind maps are safe! You'll keep access to all existing maps, but won't be able to create new ones beyond the free plan limit.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 14-day money-back guarantee for all paid plans. Contact support for assistance.",
                },
              ].map((faq, index) => (
                <div key={index} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <p className="font-medium text-foreground mb-2">{faq.q}</p>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </div>
    </div>
  );
}
