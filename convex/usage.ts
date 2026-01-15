import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackUsage = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(
      v.literal("mind_map_created"),
      v.literal("ai_insight_generated"),
      v.literal("transcription_processed"),
      v.literal("collaboration_invited"),
      v.literal("export_performed")
    ),
    metadata: v.optional(v.object({
      mindMapId: v.optional(v.id("mindMaps")),
      nodeId: v.optional(v.id("nodes")),
      tokensUsed: v.optional(v.number()),
      duration: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usageTracking", {
      userId: args.userId,
      action: args.action,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const getUserUsage = query({
  args: { 
    userId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate || Date.now();

    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_timestamp", (q) => 
        q.eq("userId", args.userId)
          .gte("timestamp", startDate)
          .lte("timestamp", endDate)
      )
      .collect();

    const summary = {
      mind_map_created: 0,
      ai_insight_generated: 0,
      transcription_processed: 0,
      collaboration_invited: 0,
      export_performed: 0,
      totalTokensUsed: 0,
    };

    usage.forEach((record) => {
      summary[record.action]++;
      if (record.metadata?.tokensUsed) {
        summary.totalTokensUsed += record.metadata.tokensUsed;
      }
    });

    return {
      summary,
      details: usage,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  },
});

export const getUsageByAction = query({
  args: {
    userId: v.id("users"),
    action: v.union(
      v.literal("mind_map_created"),
      v.literal("ai_insight_generated"),
      v.literal("transcription_processed"),
      v.literal("collaboration_invited"),
      v.literal("export_performed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("action"), args.action))
      .order("desc")
      .take(limit);

    return usage;
  },
});

export const checkUsageLimit = query({
  args: {
    userId: v.id("users"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const plan = subscription?.plan || "free";

    const limit = await ctx.db
      .query("usageLimits")
      .withIndex("by_plan_action", (q) => 
        q.eq("plan", plan).eq("action", args.action)
      )
      .first();

    if (!limit) {
      return { allowed: true, limit: null, current: 0 };
    }

    if (limit.period === "unlimited") {
      return { allowed: true, limit: null, current: 0 };
    }

    const now = Date.now();
    const periodStart = limit.period === "daily" 
      ? now - 24 * 60 * 60 * 1000
      : now - 30 * 24 * 60 * 60 * 1000;

    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_timestamp", (q) => 
        q.eq("userId", args.userId).gte("timestamp", periodStart)
      )
      .filter((q) => q.eq(q.field("action"), args.action))
      .collect();

    const current = usage.length;
    const allowed = current < limit.limit;

    return {
      allowed,
      limit: limit.limit,
      current,
      period: limit.period,
    };
  },
});

export const initializeUsageLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const limits = [
      { plan: "free" as const, action: "mind_map_created", limit: 3, period: "monthly" as const },
      { plan: "free" as const, action: "ai_insight_generated", limit: 10, period: "monthly" as const },
      { plan: "free" as const, action: "transcription_processed", limit: 5, period: "monthly" as const },
      { plan: "free" as const, action: "collaboration_invited", limit: 2, period: "monthly" as const },
      { plan: "free" as const, action: "export_performed", limit: 5, period: "monthly" as const },
      
      { plan: "pro" as const, action: "mind_map_created", limit: 50, period: "monthly" as const },
      { plan: "pro" as const, action: "ai_insight_generated", limit: 200, period: "monthly" as const },
      { plan: "pro" as const, action: "transcription_processed", limit: 100, period: "monthly" as const },
      { plan: "pro" as const, action: "collaboration_invited", limit: 20, period: "monthly" as const },
      { plan: "pro" as const, action: "export_performed", limit: 100, period: "monthly" as const },
      
      { plan: "enterprise" as const, action: "mind_map_created", limit: 999999, period: "unlimited" as const },
      { plan: "enterprise" as const, action: "ai_insight_generated", limit: 999999, period: "unlimited" as const },
      { plan: "enterprise" as const, action: "transcription_processed", limit: 999999, period: "unlimited" as const },
      { plan: "enterprise" as const, action: "collaboration_invited", limit: 999999, period: "unlimited" as const },
      { plan: "enterprise" as const, action: "export_performed", limit: 999999, period: "unlimited" as const },
    ];

    for (const limit of limits) {
      const existing = await ctx.db
        .query("usageLimits")
        .withIndex("by_plan_action", (q) => 
          q.eq("plan", limit.plan).eq("action", limit.action)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("usageLimits", limit);
      }
    }

    return { initialized: limits.length };
  },
});
