import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  mindMaps: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    mainTopic: v.optional(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  collaborators: defineTable({
    mindMapId: v.id("mindMaps"),
    userId: v.id("users"),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.id("users"),
    invitedAt: v.number(),
  })
    .index("by_mind_map", ["mindMapId"])
    .index("by_user", ["userId"])
    .index("by_mind_map_user", ["mindMapId", "userId"]),

  invitations: defineTable({
    mindMapId: v.id("mindMaps"),
    email: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.id("users"),
    token: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_mind_map", ["mindMapId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  nodes: defineTable({
    mindMapId: v.id("mindMaps"),
    parentId: v.optional(v.id("nodes")),
    label: v.string(),
    content: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
    color: v.optional(v.string()),
    level: v.number(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_mind_map", ["mindMapId"])
    .index("by_parent", ["parentId"]),

  edges: defineTable({
    mindMapId: v.id("mindMaps"),
    sourceId: v.id("nodes"),
    targetId: v.id("nodes"),
    label: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_mind_map", ["mindMapId"])
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"]),

  topicInsights: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_mind_map", ["mindMapId"])
    .index("by_node", ["nodeId"]),

  transcriptions: defineTable({
    userId: v.id("users"),
    mindMapId: v.optional(v.id("mindMaps")),
    text: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_mind_map", ["mindMapId"])
    .index("by_status", ["status"]),

  // AI response cache to reduce API costs
  insightCache: defineTable({
    topicHash: v.string(),
    mainTopic: v.optional(v.string()),
    response: v.object({
      summary: v.string(),
      keyPoints: v.array(v.string()),
      relatedConcepts: v.array(v.string()),
      sources: v.array(v.object({ 
        title: v.string(), 
        url: v.optional(v.string()) 
      })),
    }),
    hitCount: v.number(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_hash", ["topicHash"])
    .index("by_expires", ["expiresAt"]),

  extractionCache: defineTable({
    textHash: v.string(),
    normalizedText: v.string(),
    mainTopic: v.optional(v.string()),
    result: v.object({
      topic: v.string(),
      speaker: v.union(v.string(), v.null()),
      confidence: v.number(),
    }),
    hitCount: v.number(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_hash", ["textHash"])
    .index("by_normalized", ["normalizedText"])
    .index("by_expires", ["expiresAt"]),

  // Rate limiting tracking
  rateLimits: defineTable({
    userId: v.id("users"),
    action: v.string(),
    windowStart: v.number(),
    count: v.number(),
  })
    .index("by_user_action", ["userId", "action"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("unpaid")
    ),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  usageTracking: defineTable({
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
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  usageLimits: defineTable({
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    action: v.string(),
    limit: v.number(),
    period: v.union(v.literal("daily"), v.literal("monthly"), v.literal("unlimited")),
  })
    .index("by_plan", ["plan"])
    .index("by_plan_action", ["plan", "action"]),
});
