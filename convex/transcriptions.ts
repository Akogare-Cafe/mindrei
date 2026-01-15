import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    mindMapId: v.optional(v.id("mindMaps")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transcriptions", {
      userId: args.userId,
      mindMapId: args.mindMapId,
      text: args.text,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transcriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("transcriptions"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    mindMapId: v.optional(v.id("mindMaps")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    
    if (args.status === "completed") {
      updates.processedAt = Date.now();
    }
    
    if (args.mindMapId) {
      updates.mindMapId = args.mindMapId;
    }
    
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("transcriptions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(10);
  },
});
