import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    parentId: v.optional(v.id("nodes")),
    label: v.string(),
    content: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
    color: v.optional(v.string()),
    level: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const nodeId = await ctx.db.insert("nodes", {
      mindMapId: args.mindMapId,
      parentId: args.parentId,
      label: args.label,
      content: args.content,
      positionX: args.positionX,
      positionY: args.positionY,
      color: args.color,
      level: args.level,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });

    if (args.parentId) {
      await ctx.db.insert("edges", {
        mindMapId: args.mindMapId,
        sourceId: args.parentId,
        targetId: nodeId,
        createdAt: now,
      });
    }

    await ctx.db.patch(args.mindMapId, { updatedAt: now });

    return nodeId;
  },
});

export const getByMindMap = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("nodes"),
    label: v.optional(v.string()),
    content: v.optional(v.string()),
    positionX: v.optional(v.number()),
    positionY: v.optional(v.number()),
    color: v.optional(v.string()),
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

export const remove = mutation({
  args: { id: v.id("nodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) throw new Error("Node not found");

    const childNodes = await ctx.db
      .query("nodes")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();
    
    for (const child of childNodes) {
      await ctx.db.patch(child._id, { parentId: node.parentId });
    }

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_source", (q) => q.eq("sourceId", args.id))
      .collect();
    
    for (const edge of edges) {
      await ctx.db.delete(edge._id);
    }

    const incomingEdges = await ctx.db
      .query("edges")
      .withIndex("by_target", (q) => q.eq("targetId", args.id))
      .collect();
    
    for (const edge of incomingEdges) {
      await ctx.db.delete(edge._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const createBulk = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    nodes: v.array(
      v.object({
        tempId: v.string(),
        parentTempId: v.optional(v.string()),
        label: v.string(),
        content: v.optional(v.string()),
        positionX: v.number(),
        positionY: v.number(),
        color: v.optional(v.string()),
        level: v.number(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tempIdToRealId: Record<string, Id<"nodes">> = {};

    const sortedNodes = [...args.nodes].sort((a, b) => a.level - b.level);

    for (const node of sortedNodes) {
      const parentId: Id<"nodes"> | undefined = node.parentTempId
        ? tempIdToRealId[node.parentTempId]
        : undefined;

      const nodeId = await ctx.db.insert("nodes", {
        mindMapId: args.mindMapId,
        parentId,
        label: node.label,
        content: node.content,
        positionX: node.positionX,
        positionY: node.positionY,
        color: node.color,
        level: node.level,
        order: node.order,
        createdAt: now,
        updatedAt: now,
      });

      tempIdToRealId[node.tempId] = nodeId;

      if (parentId) {
        await ctx.db.insert("edges", {
          mindMapId: args.mindMapId,
          sourceId: parentId,
          targetId: nodeId,
          createdAt: now,
        });
      }
    }

    await ctx.db.patch(args.mindMapId, { updatedAt: now });

    return tempIdToRealId;
  },
});
