import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByMindMap = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
  },
});

export const create = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    sourceId: v.id("nodes"),
    targetId: v.id("nodes"),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("edges", {
      mindMapId: args.mindMapId,
      sourceId: args.sourceId,
      targetId: args.targetId,
      label: args.label,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("edges") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
