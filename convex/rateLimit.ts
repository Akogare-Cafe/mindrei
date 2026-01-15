import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Rate limit configurations
const RATE_LIMITS = {
  "ai:extractTopic": { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  "ai:searchTopic": { maxRequests: 20, windowMs: 60 * 1000 },  // 20 per minute
  "ai:generateMindMap": { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  "ai:expandNode": { maxRequests: 15, windowMs: 60 * 1000 }, // 15 per minute
} as const;

type RateLimitAction = keyof typeof RATE_LIMITS;

export const checkRateLimit = query({
  args: {
    userId: v.id("users"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const config = RATE_LIMITS[args.action as RateLimitAction];
    if (!config) {
      return { allowed: true, remaining: Infinity, resetAt: 0 };
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;

    const record = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action", (q) => 
        q.eq("userId", args.userId).eq("action", args.action)
      )
      .first();

    if (!record || record.windowStart < windowStart) {
      return { 
        allowed: true, 
        remaining: config.maxRequests, 
        resetAt: now + config.windowMs 
      };
    }

    const remaining = Math.max(0, config.maxRequests - record.count);
    return {
      allowed: remaining > 0,
      remaining,
      resetAt: record.windowStart + config.windowMs,
    };
  },
});

export const incrementRateLimit = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const config = RATE_LIMITS[args.action as RateLimitAction];
    if (!config) return { success: true };

    const now = Date.now();
    const windowStart = now - config.windowMs;

    const record = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action", (q) => 
        q.eq("userId", args.userId).eq("action", args.action)
      )
      .first();

    if (!record || record.windowStart < windowStart) {
      // Start new window
      if (record) {
        await ctx.db.patch(record._id, {
          windowStart: now,
          count: 1,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          userId: args.userId,
          action: args.action,
          windowStart: now,
          count: 1,
        });
      }
      return { success: true };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      return { 
        success: false, 
        error: "Rate limit exceeded",
        resetAt: record.windowStart + config.windowMs,
      };
    }

    // Increment count
    await ctx.db.patch(record._id, {
      count: record.count + 1,
    });

    return { success: true };
  },
});
