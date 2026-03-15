import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("assets").collect();
  },
});

export const getById = query({
  args: { assetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("assetId"), args.assetId))
      .unique();
  },
});

export const create = mutation({
  args: {
    assetType: v.string(),
    brand: v.string(),
    model: v.string(),
    serialNumber: v.string(),
    purchaseDate: v.string(),
    warrantyExpiry: v.string(),
    location: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assetId = `AST-${Date.now().toString(36).toUpperCase()}`;
    const assetCode = `AST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const id = await ctx.db.insert("assets", {
      ...args,
      assetId,
      assetCode,
      status: "Available",
      history: [{
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        action: "Asset Registered",
        user: "System",
        details: "Asset added to inventory",
      }],
    });
    return { id, assetId };
  },
});

export const patch = mutation({
  args: {
    id: v.id("assets"),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    department: v.optional(v.string()),
    history: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
