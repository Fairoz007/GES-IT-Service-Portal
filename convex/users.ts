import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    employeeCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
      role: args.role ?? "Employee",
      department: args.department ?? "General",
      employeeCode: args.employeeCode ?? `EMP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: "Active",
      createdAt: new Date().toISOString(),
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
