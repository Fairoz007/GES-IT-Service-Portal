import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("websiteChangeRequests").collect();
  },
});

export const create = mutation({
  args: {
    applicationName: v.string(),
    requester: v.string(),
    requesterId: v.string(),
    department: v.string(),
    changeType: v.string(),
    changeDescription: v.string(),
    priority: v.string(),
    impactedSystems: v.array(v.string()),
    requestedGoLiveDate: v.string(),
  },
  handler: async (ctx, args) => {
    const requestId = `WEB-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const id = await ctx.db.insert("websiteChangeRequests", {
      ...args,
      requestId,
      status: "Submitted",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { id, requestId };
  },
});

export const patch = mutation({
  args: {
    id: v.id("websiteChangeRequests"),
    status: v.optional(v.string()),
    deploymentDate: v.optional(v.string()),
    approval: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});
