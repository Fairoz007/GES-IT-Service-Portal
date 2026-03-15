import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("networkAccessRequests").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    department: v.string(),
    deviceType: v.string(),
    macAddress: v.string(),
    deviceOwnership: v.string(),
    internetType: v.string(),
    accessLevel: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const requestId = `NET-${Date.now().toString(36).toUpperCase()}`;
    const id = await ctx.db.insert("networkAccessRequests", {
      ...args,
      requestId,
      status: "Pending",
      requestedAt: new Date().toISOString(),
    });
    return { id, requestId };
  },
});

export const approve = mutation({
  args: { requestId: v.string(), approvedBy: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("networkAccessRequests")
      .filter((q) => q.eq(q.field("requestId"), args.requestId))
      .unique();
    if (!request) throw new Error("Request not found");
    await ctx.db.patch(request._id, {
      status: "Approved",
      approvedBy: args.approvedBy,
      approvedAt: new Date().toISOString(),
    });
  },
});

export const reject = mutation({
  args: { requestId: v.string(), approvedBy: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("networkAccessRequests")
      .filter((q) => q.eq(q.field("requestId"), args.requestId))
      .unique();
    if (!request) throw new Error("Request not found");
    await ctx.db.patch(request._id, {
      status: "Rejected",
      approvedBy: args.approvedBy,
      approvedAt: new Date().toISOString(),
    });
  },
});
