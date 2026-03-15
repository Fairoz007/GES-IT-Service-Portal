import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("aupSignatures").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    department: v.string(),
    employeeCode: v.optional(v.string()),
    signature: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, userName, department, employeeCode, signature, ipAddress, userAgent } = args;
    return await ctx.db.insert("aupSignatures", {
      userId,
      userName,
      department,
      employeeCode,
      signature,
      ipAddress: ipAddress ?? "Unknown",
      userAgent: userAgent ?? "Unknown",
      signedAt: new Date().toISOString(),
      version: "1.0",
    });
  },
});

export const verify = mutation({
  args: { id: v.id("aupSignatures"), verifiedBy: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verifiedBy: args.verifiedBy,
      verifiedAt: new Date().toISOString(),
    });
  },
});
