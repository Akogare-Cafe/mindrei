import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const inviteByEmail = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    email: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.mindMapId);
    if (!mindMap) throw new Error("Mind map not found");
    if (mindMap.userId !== args.invitedBy) {
      const collab = await ctx.db
        .query("collaborators")
        .withIndex("by_mind_map_user", (q) =>
          q.eq("mindMapId", args.mindMapId).eq("userId", args.invitedBy)
        )
        .first();
      if (!collab || collab.role !== "editor") {
        throw new Error("Not authorized to invite");
      }
    }

    const existingInvite = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("mindMapId"), args.mindMapId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invitation already sent to this email");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      const existingCollab = await ctx.db
        .query("collaborators")
        .withIndex("by_mind_map_user", (q) =>
          q.eq("mindMapId", args.mindMapId).eq("userId", existingUser._id)
        )
        .first();
      if (existingCollab) {
        throw new Error("User is already a collaborator");
      }
    }

    const now = Date.now();
    const token = generateToken();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("invitations", {
      mindMapId: args.mindMapId,
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      token,
      status: "pending",
      createdAt: now,
      expiresAt,
    });
  },
});

export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation already used");
    if (invitation.expiresAt < Date.now()) throw new Error("Invitation expired");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.email !== invitation.email) {
      throw new Error("This invitation was sent to a different email");
    }

    await ctx.db.patch(invitation._id, { status: "accepted" });

    return await ctx.db.insert("collaborators", {
      mindMapId: invitation.mindMapId,
      userId: args.userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      invitedAt: Date.now(),
    });
  },
});

export const declineInvitation = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation already processed");

    await ctx.db.patch(invitation._id, { status: "declined" });
    return invitation._id;
  },
});

export const getCollaborators = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const collaborators = await ctx.db
      .query("collaborators")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .collect();

    const collaboratorsWithUsers = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        return { ...collab, user };
      })
    );

    return collaboratorsWithUsers;
  },
});

export const getPendingInvitations = query({
  args: { mindMapId: v.id("mindMaps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_mind_map", (q) => q.eq("mindMapId", args.mindMapId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const getMyInvitations = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitationsWithDetails = await Promise.all(
      invitations.map(async (inv) => {
        const mindMap = await ctx.db.get(inv.mindMapId);
        const inviter = await ctx.db.get(inv.invitedBy);
        return { ...inv, mindMap, inviter };
      })
    );

    return invitationsWithDetails;
  },
});

export const getSharedMindMaps = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const collaborations = await ctx.db
      .query("collaborators")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const mindMaps = await Promise.all(
      collaborations.map(async (collab) => {
        const mindMap = await ctx.db.get(collab.mindMapId);
        const owner = mindMap ? await ctx.db.get(mindMap.userId) : null;
        return { ...mindMap, role: collab.role, owner };
      })
    );

    return mindMaps.filter((m) => m !== null);
  },
});

export const removeCollaborator = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    userId: v.id("users"),
    requestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.mindMapId);
    if (!mindMap) throw new Error("Mind map not found");

    if (mindMap.userId !== args.requestedBy && args.userId !== args.requestedBy) {
      throw new Error("Not authorized to remove collaborator");
    }

    const collab = await ctx.db
      .query("collaborators")
      .withIndex("by_mind_map_user", (q) =>
        q.eq("mindMapId", args.mindMapId).eq("userId", args.userId)
      )
      .first();

    if (!collab) throw new Error("Collaborator not found");

    await ctx.db.delete(collab._id);
    return collab._id;
  },
});

export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    requestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    const mindMap = await ctx.db.get(invitation.mindMapId);
    if (!mindMap) throw new Error("Mind map not found");

    if (mindMap.userId !== args.requestedBy) {
      throw new Error("Not authorized to cancel invitation");
    }

    await ctx.db.delete(args.invitationId);
    return args.invitationId;
  },
});

export const generateShareLink = mutation({
  args: {
    mindMapId: v.id("mindMaps"),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mindMap = await ctx.db.get(args.mindMapId);
    if (!mindMap) throw new Error("Mind map not found");
    if (mindMap.userId !== args.invitedBy) {
      throw new Error("Not authorized to generate share link");
    }

    const now = Date.now();
    const token = generateToken();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("invitations", {
      mindMapId: args.mindMapId,
      email: "",
      role: args.role,
      invitedBy: args.invitedBy,
      token,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    return token;
  },
});

export const acceptShareLink = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invalid share link");
    if (invitation.status !== "pending") throw new Error("Share link already used");
    if (invitation.expiresAt < Date.now()) throw new Error("Share link expired");

    const existingCollab = await ctx.db
      .query("collaborators")
      .withIndex("by_mind_map_user", (q) =>
        q.eq("mindMapId", invitation.mindMapId).eq("userId", args.userId)
      )
      .first();

    if (existingCollab) {
      return { mindMapId: invitation.mindMapId, alreadyCollaborator: true };
    }

    const mindMap = await ctx.db.get(invitation.mindMapId);
    if (mindMap?.userId === args.userId) {
      return { mindMapId: invitation.mindMapId, isOwner: true };
    }

    await ctx.db.insert("collaborators", {
      mindMapId: invitation.mindMapId,
      userId: args.userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      invitedAt: Date.now(),
    });

    return { mindMapId: invitation.mindMapId, success: true };
  },
});
