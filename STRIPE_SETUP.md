# Stripe Integration Setup Guide

This guide will help you set up Stripe for subscription management and payments in MindRei.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- MindRei project set up with Convex and Clerk

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 2: Create Products and Prices

### Create Pro Plan

1. Go to **Products** in your Stripe Dashboard
2. Click **Add product**
3. Fill in:
   - **Name**: MindRei Pro
   - **Description**: Perfect for power users
   - **Pricing**: Recurring, $19.99/month
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)
6. Add to `.env.local`:

```env
STRIPE_PRO_PRICE_ID=price_...
```

### Create Enterprise Plan

1. Repeat the process for Enterprise:
   - **Name**: MindRei Enterprise
   - **Description**: Unlimited power for teams
   - **Pricing**: Recurring, $99.99/month
2. Copy the **Price ID**
3. Add to `.env.local`:

```env
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## Step 3: Set Up Webhook

### Local Development (using Stripe CLI)

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Log in to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production (Stripe Dashboard)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret**
7. Add to your production environment variables

## Step 4: Initialize Usage Limits

Run this command to set up usage limits for each plan:

```bash
npx convex run usage:initializeUsageLimits
```

This creates the following limits:

### Free Plan
- 3 mind maps/month
- 10 AI insights/month
- 5 transcriptions/month
- 2 collaborations/month
- 5 exports/month

### Pro Plan
- 50 mind maps/month
- 200 AI insights/month
- 100 transcriptions/month
- 20 collaborations/month
- 100 exports/month

### Enterprise Plan
- Unlimited everything

## Step 5: Test the Integration

### Test Checkout Flow

1. Navigate to `/app/usage` in your app
2. Click **Upgrade to Pro** or **Upgrade to Enterprise**
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete the checkout

### Test Webhook Events

1. In Stripe Dashboard, go to **Developers** → **Events**
2. You should see events being logged
3. Check your Convex dashboard to verify subscription data is being saved

### Test Customer Portal

1. After subscribing, click **Manage Subscription**
2. You should be redirected to Stripe Customer Portal
3. Test canceling and updating the subscription

## Usage Tracking

The app automatically tracks usage for:

- **Mind Maps Created**: Tracked when a new mind map is created
- **AI Insights Generated**: Tracked when AI generates insights for nodes
- **Transcriptions Processed**: Tracked when voice recordings are transcribed
- **Collaborations**: Tracked when users are invited to collaborate
- **Exports**: Tracked when mind maps are exported

To track usage in your code:

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const trackUsage = useMutation(api.usage.trackUsage);

// Track an action
await trackUsage({
  userId: currentUser._id,
  action: "mind_map_created",
  metadata: {
    mindMapId: newMindMap._id,
  },
});
```

## Troubleshooting

### Webhook not receiving events

- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure webhook endpoint is publicly accessible (for production)
- Check Stripe Dashboard → Developers → Events for delivery status

### Subscription not updating

- Check Convex logs for errors
- Verify user email matches between Clerk and Stripe
- Ensure price IDs in `.env.local` match Stripe Dashboard

### Usage limits not working

- Run `npx convex run usage:initializeUsageLimits` again
- Check Convex dashboard for `usageLimits` table data
- Verify plan names match: "free", "pro", "enterprise"

## Security Notes

- Never commit `.env.local` to version control
- Use test mode keys for development
- Rotate keys if they are ever exposed
- Validate webhook signatures to prevent fraud
- Use HTTPS in production

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
