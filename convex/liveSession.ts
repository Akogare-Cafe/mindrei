import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
    mainTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const mindMapId = await ctx.db.insert("mindMaps", {
      userId: args.userId,
      title: args.title || "Live Session",
      description: "Created from live voice session",
      mainTopic: args.mainTopic,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    });

    const rootNodeId = await ctx.db.insert("nodes", {
      mindMapId,
      label: args.mainTopic || args.title || "Main Topic",
      positionX: 0,
      positionY: 0,
      level: 0,
      order: 0,
      color: "#c4b5fd",
      createdAt: now,
      updatedAt: now,
    });

    return { mindMapId, rootNodeId };
  },
});

const FILLER_TOPICS = [
  "conversation", "filler", "greeting", "transition", "pause",
  "um", "uh", "like", "yeah", "okay", "so", "well", "right",
  "you know", "i mean", "basically", "actually", "literally",
];

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

function isFillerTopic(label: string): boolean {
  const normalized = normalizeLabel(label);
  return FILLER_TOPICS.some(filler => 
    normalized === filler || 
    normalized.split(" ").every(word => FILLER_TOPICS.includes(word))
  );
}

export const addLiveNode = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    parentId: v.id("nodes"),
    label: v.string(),
    content: v.optional(v.string()),
    level: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    if (isFillerTopic(args.label)) {
      return null;
    }
    
    const allNodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    const normalizedNewLabel = normalizeLabel(args.label);
    const existingNode = allNodes.find(node => 
      normalizeLabel(node.label) === normalizedNewLabel
    );
    
    if (existingNode) {
      return existingNode._id;
    }
    
    const siblings = await ctx.db
      .query("nodes")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
    
    const parent = await ctx.db.get(args.parentId);
    if (!parent) throw new Error("Parent node not found");

    const colors = ["#e9d5ff", "#ccfbf1", "#fef3c7", "#fce7f3", "#dbeafe", "#dcfce7"];
    const color = colors[args.level % colors.length];

    const angleStep = 40;
    const baseAngle = -60;
    const angle = baseAngle + siblings.length * angleStep;
    const radius = 180 + args.level * 30;
    
    const radians = (angle * Math.PI) / 180;
    const positionX = parent.positionX + Math.cos(radians) * radius;
    const positionY = parent.positionY + Math.sin(radians) * radius;

    const nodeId = await ctx.db.insert("nodes", {
      mindMapId: args.mindMapId,
      parentId: args.parentId,
      label: args.label,
      content: args.content,
      positionX,
      positionY,
      level: args.level,
      order: siblings.length,
      color,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("edges", {
      mindMapId: args.mindMapId,
      sourceId: args.parentId,
      targetId: nodeId,
      createdAt: now,
    });

    await ctx.db.patch(args.mindMapId, { updatedAt: now });

    return nodeId;
  },
});

export const getLiveData = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.mindMapId);
    if (!mindMap) return null;

    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    return { mindMap, nodes, edges };
  },
});

export const updateNodeLabel = mutation({
  args: {
    nodeId: v.id("nodes"),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, {
      label: args.label,
      updatedAt: Date.now(),
    });
    return args.nodeId;
  },
});

export const getRootNode = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    return nodes.find((n) => n.level === 0) || null;
  },
});

export const getLastNode = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    if (nodes.length === 0) return null;
    
    return nodes.reduce((latest, node) => 
      node.createdAt > latest.createdAt ? node : latest
    );
  },
});

// Incremental query - only fetch nodes created after a certain timestamp
// This reduces data transfer for large mind maps during live sessions
export const getNewNodes = query({
  args: { 
    mindMapId: v.id("mindMaps"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    // Filter nodes created after the timestamp
    const newNodes = nodes.filter(n => n.createdAt > args.since);
    
    return newNodes;
  },
});

// Incremental query for edges
export const getNewEdges = query({
  args: { 
    mindMapId: v.id("mindMaps"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const edges = await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    // Filter edges created after the timestamp
    const newEdges = edges.filter(e => e.createdAt > args.since);
    
    return newEdges;
  },
});

// Get node count for a mind map (useful for pagination decisions)
export const getNodeCount = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    return nodes.length;
  },
});

export const expandNodeWithChildren = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    parentNodeId: v.id("nodes"),
    childLabels: v.array(v.object({
      label: v.string(),
      content: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const parent = await ctx.db.get(args.parentNodeId);
    if (!parent) throw new Error("Parent node not found");
    
    const allNodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();
    
    const existingSiblings = await ctx.db
      .query("nodes")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentNodeId))
      .collect();
    
    const colors = ["#e9d5ff", "#ccfbf1", "#fef3c7", "#fce7f3", "#dbeafe", "#dcfce7"];
    const childLevel = parent.level + 1;
    const color = colors[childLevel % colors.length];
    
    const createdNodeIds: string[] = [];
    let siblingCount = existingSiblings.length;
    
    for (const child of args.childLabels) {
      const normalizedLabel = child.label.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
      const isDuplicate = allNodes.some(node => 
        node.label.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "") === normalizedLabel
      );
      
      if (isDuplicate || isFillerTopic(child.label)) {
        continue;
      }
      
      const angleStep = 40;
      const baseAngle = -60;
      const angle = baseAngle + siblingCount * angleStep;
      const radius = 180 + childLevel * 30;
      
      const radians = (angle * Math.PI) / 180;
      const positionX = parent.positionX + Math.cos(radians) * radius;
      const positionY = parent.positionY + Math.sin(radians) * radius;
      
      const nodeId = await ctx.db.insert("nodes", {
        mindMapId: args.mindMapId,
        parentId: args.parentNodeId,
        label: child.label.slice(0, 25),
        content: child.content,
        positionX,
        positionY,
        level: childLevel,
        order: siblingCount,
        color,
        createdAt: now,
        updatedAt: now,
      });
      
      await ctx.db.insert("edges", {
        mindMapId: args.mindMapId,
        sourceId: args.parentNodeId,
        targetId: nodeId,
        createdAt: now,
      });
      
      createdNodeIds.push(nodeId);
      siblingCount++;
    }
    
    await ctx.db.patch(args.mindMapId, { updatedAt: now });
    
    return createdNodeIds;
  },
});
