import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await convex.query(api.users.getCurrentUser, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const subscription = await convex.query(api.subscriptions.getUserSubscription, {
      userId: user._id,
    });

    if (!subscription || subscription.plan === "free" || !("stripeCustomerId" in subscription) || !subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const session = await createCustomerPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/app/usage`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
