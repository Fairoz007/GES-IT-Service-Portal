import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    credentialId: v.id("credentials"),
    expiresInHours: v.number(),
    viewLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const credential = await ctx.db.get(args.credentialId);
    if (!credential) {
      throw new Error("Credential not found");
    }
    
    // @ts-ignore - userId exists on credentials
    if (credential.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + args.expiresInHours);

    const shareId = await ctx.db.insert("vaultShares", {
      credentialId: args.credentialId,
      token,
      expiresAt: expiresAt.toISOString(),
      viewLimit: args.viewLimit,
      viewCount: 0,
      createdBy: identity.subject,
    });

    return token;
  },
});

export const getSharedCredential = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("vaultShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!share) return null;

    if (new Date(share.expiresAt) < new Date()) {
      return { error: "Link expired" };
    }

    if (share.viewLimit && share.viewCount >= share.viewLimit) {
      return { error: "View limit reached" };
    }

    const credential = await ctx.db.get(share.credentialId);
    if (!credential) return null;

    return {
      label: (credential as any).label,
      username: (credential as any).username,
      password: (credential as any).password,
      url: (credential as any).url,
      category: (credential as any).category,
      notes: (credential as any).notes,
    };
  },
});

export const incrementView = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("vaultShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (share) {
      await ctx.db.patch(share._id, {
        viewCount: share.viewCount + 1,
      });
    }
  },
});
