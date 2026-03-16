import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'Admin' | 'IT Staff' | 'Department Head' | 'Employee'
    department: v.string(),
    employeeCode: v.string(),
    phone: v.optional(v.string()),
    status: v.string(), // 'Active' | 'Inactive' | 'Suspended'
    avatar: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  tickets: defineTable({
    ticketId: v.string(),
    userId: v.string(), // clerkId
    userName: v.string(),
    department: v.string(),
    location: v.string(),
    category: v.string(),
    priority: v.string(),
    description: v.string(),
    attachment: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    status: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    closedAt: v.optional(v.string()),
    slaDeadline: v.string(),
    internalNotes: v.optional(v.array(v.string())),
    activityLog: v.array(v.object({
      id: v.string(),
      timestamp: v.string(),
      user: v.string(),
      action: v.string(),
      details: v.optional(v.string()),
    })),
  }).index("by_userId", ["userId"]),

  assets: defineTable({
    assetId: v.string(),
    assetCode: v.string(),
    assetType: v.string(),
    brand: v.string(),
    model: v.string(),
    serialNumber: v.string(),
    purchaseDate: v.string(),
    warrantyExpiry: v.string(),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    history: v.array(v.object({
      id: v.string(),
      timestamp: v.string(),
      action: v.string(),
      user: v.string(),
      details: v.string(),
    })),
    qrCode: v.optional(v.string()),
  }),

  procurementRequests: defineTable({
    requestId: v.string(),
    requester: v.string(),
    requesterId: v.string(),
    department: v.string(),
    itemDescription: v.string(),
    quantity: v.number(),
    justification: v.string(),
    estimatedCost: v.number(),
    supplier: v.optional(v.string()),
    approvalStatus: v.string(),
    approvals: v.array(v.object({
      step: v.number(),
      role: v.string(),
      approver: v.optional(v.string()),
      status: v.string(),
      timestamp: v.optional(v.string()),
      comments: v.optional(v.string()),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_requesterId", ["requesterId"]),

  networkAccessRequests: defineTable({
    requestId: v.string(),
    userId: v.string(),
    userName: v.string(),
    department: v.string(),
    deviceType: v.string(),
    macAddress: v.string(),
    deviceOwnership: v.string(),
    internetType: v.string(),
    accessLevel: v.string(),
    reason: v.string(),
    status: v.string(),
    requestedAt: v.string(),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  websiteChangeRequests: defineTable({
    requestId: v.string(),
    applicationName: v.string(),
    requester: v.string(),
    requesterId: v.string(),
    department: v.string(),
    changeType: v.string(),
    changeDescription: v.string(),
    priority: v.string(),
    impactedSystems: v.array(v.string()),
    requestedGoLiveDate: v.string(),
    status: v.string(),
    deploymentDate: v.optional(v.string()),
    approval: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_requesterId", ["requesterId"]),

  preventiveMaintenance: defineTable({
    device: v.string(),
    assetId: v.optional(v.string()),
    location: v.string(),
    maintenanceDate: v.string(),
    status: v.string(),
    remarks: v.optional(v.string()),
    technician: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  }),

  breakdownReports: defineTable({
    device: v.string(),
    assetId: v.optional(v.string()),
    issueDescription: v.string(),
    sparePartsUsed: v.array(v.string()),
    repairDetails: v.string(),
    repairCost: v.number(),
    technician: v.string(),
    reportDate: v.string(),
    repairDate: v.string(),
    status: v.string(),
  }),

  aupSignatures: defineTable({
    userId: v.string(),
    userName: v.string(),
    department: v.string(),
    employeeCode: v.optional(v.string()),
    signature: v.string(),
    ipAddress: v.string(),
    userAgent: v.string(),
    signedAt: v.string(),
    version: v.string(),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),
  }).index("by_employeeId", ["employeeCode"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.string(),
    link: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  credentials: defineTable({
    label: v.string(),
    username: v.string(),
    password: v.string(), // Encrypted string
    url: v.optional(v.string()),
    notes: v.optional(v.string()),
    category: v.string(), // e.g., 'Server', 'Application', 'Cloud', 'Social'
    userId: v.string(), // clerkId of the owner
    tags: v.array(v.string()),
    isFavorite: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.string(),
    lastAccessed: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  vaultShares: defineTable({
    credentialId: v.id("credentials"),
    token: v.string(),
    expiresAt: v.string(), // ISO date
    viewLimit: v.optional(v.number()),
    viewCount: v.number(),
    createdBy: v.string(), // clerkId
  }).index("by_token", ["token"]),
});
