import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();
    const assets = await ctx.db.query("assets").collect();
    const procurement = await ctx.db.query("procurementRequests").collect();
    const network = await ctx.db.query("networkAccessRequests").collect();
    const website = await ctx.db.query("websiteChangeRequests").collect();
    const credentials = await ctx.db.query("credentials").collect();

    const openTickets = tickets.filter(t => t.status !== "Closed" && t.status !== "Resolved").length;
    const pendingProcurement = procurement.filter(p => p.approvalStatus.includes("Pending")).length;
    const pendingNetwork = network.filter(n => n.status === "Pending").length;
    const pendingWebsite = website.filter(w => w.status !== "Deployed" && w.status !== "Rejected").length;

    const credentialsCount = credentials.length;

    // For trends, we would need historical data or compare with a previous period
    // For now we'll just return counts and some placeholder trends

    return {
      activeTickets: openTickets,
      assetsTracked: assets.length,
      pendingRequests: pendingProcurement + pendingNetwork + pendingWebsite,
      vaultItems: credentialsCount,
      
      // Breakdown for charts
      ticketsByStatus: [
        { name: "Open", value: tickets.filter(t => t.status === "Open").length },
        { name: "In Progress", value: tickets.filter(t => t.status === "In Progress").length },
        { name: "On Hold", value: tickets.filter(t => t.status === "On Hold").length },
        { name: "Resolved", value: tickets.filter(t => t.status === "Resolved").length },
        { name: "Closed", value: tickets.filter(t => t.status === "Closed").length },
      ],
      assetsByType: [
        { name: "Laptop", value: assets.filter(a => a.assetType === "Laptop").length },
        { name: "Desktop", value: assets.filter(a => a.assetType === "Desktop").length },
        { name: "Monitor", value: assets.filter(a => a.assetType === "Monitor").length },
        { name: "Other", value: assets.filter(a => !["Laptop", "Desktop", "Monitor"].includes(a.assetType)).length },
      ]
    };
  },
});
