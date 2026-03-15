import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listPreventive = query({
  handler: async (ctx) => {
    return await ctx.db.query("preventiveMaintenance").collect();
  },
});

export const listBreakdowns = query({
  handler: async (ctx) => {
    return await ctx.db.query("breakdownReports").collect();
  },
});

export const createPreventive = mutation({
  args: {
    device: v.string(),
    location: v.string(),
    maintenanceDate: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("preventiveMaintenance", {
      ...args,
      status: "Scheduled",
    });
  },
});

export const createBreakdown = mutation({
  args: {
    device: v.string(),
    issueDescription: v.string(),
    sparePartsUsed: v.array(v.string()),
    repairDetails: v.string(),
    repairCost: v.number(),
    technician: v.string(),
    repairDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("breakdownReports", {
      ...args,
      status: "Fixed",
      reportDate: new Date().toISOString(),
    });
  },
});

export const patchPreventive = mutation({
  args: {
    id: v.id("preventiveMaintenance"),
    status: v.string(),
    completedAt: v.optional(v.string()),
    technician: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
