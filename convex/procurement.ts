import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("procurementRequests").collect();
  },
});

export const create = mutation({
  args: {
    requester: v.string(),
    requesterId: v.string(),
    department: v.string(),
    itemDescription: v.string(),
    quantity: v.number(),
    justification: v.string(),
    estimatedCost: v.number(),
    supplier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestId = `PRQ-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    
    const id = await ctx.db.insert("procurementRequests", {
      ...args,
      requestId,
      approvalStatus: "Pending Department Head",
      approvals: [
        { step: 1, role: "Department Head", status: "Pending" },
        { step: 2, role: "IT Head", status: "Pending" },
        { step: 3, role: "Management", status: "Pending" },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { id, requestId };
  },
});

export const approve = mutation({
  args: {
    requestId: v.string(),
    userName: v.string(),
    role: v.string(),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("procurementRequests")
      .filter((q) => q.eq(q.field("requestId"), args.requestId))
      .unique();
    
    if (!request) throw new Error("Request not found");

    const approvals = request.approvals.map(a => {
      if (a.role === args.role) {
        return { 
          ...a, 
          status: "Approved", 
          approver: args.userName, 
          timestamp: new Date().toISOString(),
          comments: args.comments 
        };
      }
      return a;
    });

    const allApproved = approvals.every(a => a.status === "Approved");
    let nextStatus = request.approvalStatus;
    if (args.role === "Department Head") nextStatus = "Pending IT Head";
    if (args.role === "IT Head") nextStatus = "Pending Management";
    if (args.role === "Management" || allApproved) nextStatus = "Approved";

    await ctx.db.patch(request._id, {
      approvals,
      approvalStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  },
});
