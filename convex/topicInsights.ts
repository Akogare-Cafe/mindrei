import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const save = internalMutation({
  args: {
    mindMapId: v.id("mindMaps"),
    nodeId: v.id("nodes"),
    topic: v.string(),
    mainTopic: v.optional(v.string()),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    relatedConcepts: v.array(v.string()),
    sources: v.array(v.object({
      title: v.string(),
      url: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("topicInsights")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: args.summary,
        keyPoints: args.keyPoints,
        relatedConcepts: args.relatedConcepts,
        sources: args.sources,
      });
      return existing._id;
    }

    return await ctx.db.insert("topicInsights", {
      mindMapId: args.mindMapId,
      nodeId: args.nodeId,
      topic: args.topic,
      mainTopic: args.mainTopic,
      summary: args.summary,
      keyPoints: args.keyPoints,
      relatedConcepts: args.relatedConcepts,
      sources: args.sources,
      createdAt: Date.now(),
    });
  },
});

export const getByMindMap = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topicInsights")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .order("desc")
      .collect();
  },
});

export const getByNode = query({
  args: { nodeId: v.id("nodes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topicInsights")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .first();
  },
});
