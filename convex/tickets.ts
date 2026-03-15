import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("tickets").order("desc").collect();
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("ticketId"), args.ticketId))
      .unique();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    department: v.string(),
    location: v.string(),
    category: v.string(),
    priority: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    
    const id = await ctx.db.insert("tickets", {
      ...args,
      ticketId,
      status: "Open",
      createdAt: timestamp,
      updatedAt: timestamp,
      slaDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
      activityLog: [{
        id: Math.random().toString(36).substring(2, 11),
        timestamp,
        user: args.userName,
        action: "Ticket Created",
        details: "Initial request submitted",
      }],
    });

    return { id, ticketId };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tickets"),
    status: v.string(),
    userName: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.id);
    if (!ticket) throw new Error("Ticket not found");

    const timestamp = new Date().toISOString();
    const activityLog = [...ticket.activityLog, {
      id: Math.random().toString(36).substring(2, 11),
      timestamp,
      user: args.userName,
      action: "Status Updated",
      details: args.details || `Status changed to ${args.status}`,
    }];

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: timestamp,
      activityLog,
      ...(args.status === "Closed" ? { closedAt: timestamp } : {}),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tickets"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    activityLog: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const ticket = await ctx.db.get(id);
    if (!ticket) throw new Error("Ticket not found");

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});
