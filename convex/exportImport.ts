import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const exportMindMap = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.mindMapId);
    if (!mindMap) throw new Error("Mind map not found");

    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    const edges = await ctx.db
      .query("edges")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    const topicInsights = await ctx.db
      .query("topicInsights")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    const nodeIdMap: Record<string, string> = {};
    nodes.forEach((node, index) => {
      nodeIdMap[node._id] = `node_${index}`;
    });

    const exportedNodes = nodes.map((node) => ({
      exportId: nodeIdMap[node._id],
      parentExportId: node.parentId ? nodeIdMap[node.parentId] : undefined,
      label: node.label,
      content: node.content,
      positionX: node.positionX,
      positionY: node.positionY,
      color: node.color,
      level: node.level,
      order: node.order,
    }));

    const exportedEdges = edges.map((edge) => ({
      sourceExportId: nodeIdMap[edge.sourceId],
      targetExportId: nodeIdMap[edge.targetId],
      label: edge.label,
    }));

    const exportedInsights = topicInsights.map((insight) => ({
      nodeExportId: nodeIdMap[insight.nodeId],
      topic: insight.topic,
      mainTopic: insight.mainTopic,
      summary: insight.summary,
      keyPoints: insight.keyPoints,
      relatedConcepts: insight.relatedConcepts,
      sources: insight.sources,
    }));

    return {
      version: "1.0",
      exportedAt: Date.now(),
      mindMap: {
        title: mindMap.title,
        description: mindMap.description,
        mainTopic: mindMap.mainTopic,
      },
      nodes: exportedNodes,
      edges: exportedEdges,
      topicInsights: exportedInsights,
    };
  },
});

export const importMindMap = mutation({
  args: {
    userId: v.id("users"),
    data: v.object({
      version: v.string(),
      exportedAt: v.number(),
      mindMap: v.object({
        title: v.string(),
        description: v.optional(v.string()),
        mainTopic: v.optional(v.string()),
      }),
      nodes: v.array(
        v.object({
          exportId: v.string(),
          parentExportId: v.optional(v.string()),
          label: v.string(),
          content: v.optional(v.string()),
          positionX: v.number(),
          positionY: v.number(),
          color: v.optional(v.string()),
          level: v.number(),
          order: v.number(),
        })
      ),
      edges: v.array(
        v.object({
          sourceExportId: v.string(),
          targetExportId: v.string(),
          label: v.optional(v.string()),
        })
      ),
      topicInsights: v.optional(
        v.array(
          v.object({
            nodeExportId: v.string(),
            topic: v.string(),
            mainTopic: v.optional(v.string()),
            summary: v.string(),
            keyPoints: v.array(v.string()),
            relatedConcepts: v.array(v.string()),
            sources: v.array(
              v.object({
                title: v.string(),
                url: v.optional(v.string()),
              })
            ),
          })
        )
      ),
    }),
    newTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { data, userId, newTitle } = args;

    const mindMapId = await ctx.db.insert("mindMaps", {
      userId,
      title: newTitle || `${data.mindMap.title} (Imported)`,
      description: data.mindMap.description,
      mainTopic: data.mindMap.mainTopic,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    });

    const exportIdToRealId: Record<string, string> = {};

    const sortedNodes = [...data.nodes].sort((a, b) => a.level - b.level);

    for (const node of sortedNodes) {
      const parentId = node.parentExportId
        ? (exportIdToRealId[node.parentExportId] as unknown as typeof mindMapId)
        : undefined;

      const nodeId = await ctx.db.insert("nodes", {
        mindMapId,
        parentId: parentId as unknown as undefined,
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

      exportIdToRealId[node.exportId] = nodeId;
    }

    for (const edge of data.edges) {
      const sourceId = exportIdToRealId[edge.sourceExportId];
      const targetId = exportIdToRealId[edge.targetExportId];

      if (sourceId && targetId) {
        await ctx.db.insert("edges", {
          mindMapId,
          sourceId: sourceId as Id<"nodes">,
          targetId: targetId as Id<"nodes">,
          label: edge.label,
          createdAt: now,
        });
      }
    }

    if (data.topicInsights) {
      for (const insight of data.topicInsights) {
        const nodeId = exportIdToRealId[insight.nodeExportId];
        if (nodeId) {
          await ctx.db.insert("topicInsights", {
            mindMapId,
            nodeId: nodeId as Id<"nodes">,
            topic: insight.topic,
            mainTopic: insight.mainTopic,
            summary: insight.summary,
            keyPoints: insight.keyPoints,
            relatedConcepts: insight.relatedConcepts,
            sources: insight.sources,
            createdAt: now,
          });
        }
      }
    }

    return mindMapId;
  },
});
