"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PixelCard, PixelCardContent, PixelCardDescription, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { Activity, CreditCard, TrendingUp, Zap, Crown, Shield, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { STRIPE_PLANS } from "@/lib/stripe";

export const metadata = {
  title: "Usage & Billing | MindRei",
  description: "Track your usage, manage your subscription, and upgrade your plan to unlock more features for AI-powered mind mapping.",
  openGraph: {
    title: "Usage & Billing | MindRei",
    description: "Track your usage, manage your subscription, and upgrade your plan to unlock more features for AI-powered mind mapping.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Usage & Billing | MindRei",
    description: "Track your usage, manage your subscription, and upgrade your plan to unlock more features for AI-powered mind mapping.",
  },
};

export default function UsagePage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const usage = useQuery(
    api.usage.getUserUsage,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const handleUpgrade = async (plan: "pro" | "enterprise") => {
    setIsLoading(true);
    try {
      const priceId = STRIPE_PLANS[plan].priceId;
      if (!priceId) {
        throw new Error("Price ID not configured");
      }

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, plan }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Zap className="w-5 h-5" />;
      case "enterprise":
        return <Crown className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "from-primary to-accent";
      case "enterprise":
        return "from-accent to-primary";
      default:
        return "from-muted to-muted";
    }
  };

  if (!currentUser || !subscription || !usage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading usage data...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription.plan || "free";
  const isActive = subscription.isActive;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Usage & Billing
          </h1>
          <p className="text-muted-foreground">
            Track your usage and manage your subscription
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PixelCard rarity={currentPlan === "free" ? "common" : currentPlan === "pro" ? "rare" : "legendary"}>
            <PixelCardHeader>
              <div className="flex items-center justify-between">
                <PixelCardTitle>Current Plan</PixelCardTitle>
                {getPlanIcon(currentPlan)}
              </div>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                <div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${getPlanColor(currentPlan)} bg-clip-text text-transparent capitalize`}>
                    {currentPlan}
                  </div>
                  <PixelBadge variant={isActive ? "default" : "destructive"} className="mt-2">
                    {isActive ? "Active" : "Inactive"}
                  </PixelBadge>
                </div>
                {currentPlan !== "free" && "currentPeriodEnd" in subscription && subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {currentPlan !== "free" ? (
                  <PixelButton
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </PixelButton>
                ) : (
                  <PixelButton
                    size="sm"
                    onClick={() => handleUpgrade("pro")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </PixelButton>
                )}
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard rarity="uncommon">
            <PixelCardHeader>
              <div className="flex items-center justify-between">
                <PixelCardTitle>Mind Maps</PixelCardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {usage.summary.mind_map_created}
                </div>
                <p className="text-sm text-muted-foreground">Created this month</p>
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard rarity="uncommon">
            <PixelCardHeader>
              <div className="flex items-center justify-between">
                <PixelCardTitle>AI Insights</PixelCardTitle>
                <Zap className="w-5 h-5 text-accent" />
              </div>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {usage.summary.ai_insight_generated}
                </div>
                <p className="text-sm text-muted-foreground">Generated this month</p>
              </div>
            </PixelCardContent>
          </PixelCard>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Usage Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle>Activity Summary</PixelCardTitle>
                <PixelCardDescription>
                  Your activity over the last 30 days
                </PixelCardDescription>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mind Maps Created</span>
                    <span className="font-semibold">{usage.summary.mind_map_created}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AI Insights Generated</span>
                    <span className="font-semibold">{usage.summary.ai_insight_generated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transcriptions Processed</span>
                    <span className="font-semibold">{usage.summary.transcription_processed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Collaborations</span>
                    <span className="font-semibold">{usage.summary.collaboration_invited}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Exports Performed</span>
                    <span className="font-semibold">{usage.summary.export_performed}</span>
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle>AI Token Usage</PixelCardTitle>
                <PixelCardDescription>
                  Total tokens consumed this month
                </PixelCardDescription>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-foreground">
                    {usage.summary.totalTokensUsed.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tokens used for AI-powered features
                  </p>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        </section>

        {currentPlan === "free" && (
          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Upgrade Your Plan</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <PixelCard rarity="rare">
                <PixelCardHeader>
                  <div className="flex items-center justify-between">
                    <PixelCardTitle>Pro Plan</PixelCardTitle>
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <PixelCardDescription>
                    Perfect for power users
                  </PixelCardDescription>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      ${(STRIPE_PLANS.pro.price / 100).toFixed(2)}
                      <span className="text-sm text-muted-foreground font-normal">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>50 mind maps per month</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>200 AI insights per month</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>100 transcriptions per month</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <PixelButton
                      onClick={() => handleUpgrade("pro")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Upgrade to Pro
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>

              <PixelCard rarity="legendary">
                <PixelCardHeader>
                  <div className="flex items-center justify-between">
                    <PixelCardTitle>Enterprise Plan</PixelCardTitle>
                    <Crown className="w-6 h-6 text-accent" />
                  </div>
                  <PixelCardDescription>
                    Unlimited power for teams
                  </PixelCardDescription>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      ${(STRIPE_PLANS.enterprise.price / 100).toFixed(2)}
                      <span className="text-sm text-muted-foreground font-normal">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Unlimited mind maps</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Unlimited AI insights</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Unlimited transcriptions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Dedicated support</span>
                      </li>
                    </ul>
                    <PixelButton
                      onClick={() => handleUpgrade("enterprise")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Upgrade to Enterprise
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
