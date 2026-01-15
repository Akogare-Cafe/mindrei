import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    mainTopic: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mindMaps", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      mainTopic: args.mainTopic,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mindMaps")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("mindMaps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("mindMaps"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    mainTopic: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

export const getWithData = query({
  args: { id: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.id);
    if (!mindMap) return null;

    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.id))
      .collect();

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.id))
      .collect();

    return {
      mindMap,
      nodes,
      edges,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.id))
      .collect();
    
    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.id))
      .collect();
    
    for (const edge of edges) {
      await ctx.db.delete(edge._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
