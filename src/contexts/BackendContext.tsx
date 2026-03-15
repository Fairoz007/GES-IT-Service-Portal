import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type {
  Ticket, Asset, ProcurementRequest, NetworkAccessRequest,
  WebsiteChangeRequest, PreventiveMaintenance, BreakdownReport,
  AUPSignature, Notification, DashboardStats, User
} from '@/types';

interface BackendContextType {
  tickets: Ticket[];
  getTicketById: (ticketId: string) => Ticket | undefined;
  createTicket: (data: any) => Promise<any>;
  updateTicket: (id: string, data: any) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  
  assets: Asset[];
  getAssetById: (assetId: string) => Asset | undefined;
  createAsset: (data: any) => Promise<any>;
  updateAsset: (id: string, data: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  procurementRequests: ProcurementRequest[];
  createProcurementRequest: (data: any) => Promise<any>;
  approveProcurement: (id: string, user: string, role: string, comments: string) => Promise<void>;

  preventiveMaintenance: PreventiveMaintenance[];
  breakdownReports: BreakdownReport[];
  createPreventiveMaintenance: (data: any) => Promise<any>;
  updatePreventiveMaintenance: (id: string, data: any) => Promise<void>;
  createBreakdownReport: (data: any) => Promise<any>;

  networkAccessRequests: NetworkAccessRequest[];
  createNetworkAccessRequest: (data: any) => Promise<any>;
  approveNetworkAccess: (id: string, approvedBy: string) => Promise<void>;
  rejectNetworkAccess: (id: string, approvedBy: string) => Promise<void>;

  websiteChangeRequests: WebsiteChangeRequest[];
  createWebsiteChangeRequest: (data: any) => Promise<any>;
  updateWebsiteChangeRequest: (id: string, data: any) => Promise<void>;

  aupSignatures: AUPSignature[];
  createAUPSignature: (data: any) => Promise<any>;
  verifyAUPSignature: (id: string, verifiedBy: string) => Promise<void>;

  users: User[];
  notifications: Notification[];
  createNotification: (data: any) => Promise<void>;
  
  getDashboardStats: () => DashboardStats;
  liveStats: any;
  isLoading: boolean;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const tickets = useQuery(api.tickets?.list || (null as any)) || [];
  const createTicketMutation = useMutation(api.tickets?.create || (null as any));
  const updateTicketStatusMutation = useMutation(api.tickets?.updateStatus || (null as any));
  const updateTicketMutation = useMutation(api.tickets?.update || (null as any));

  const assets = useQuery(api.assets.list) || [];
  const liveStats = useQuery(api.stats.getDashboardStats) || null;
  const createAssetMutation = useMutation(api.assets?.create || (null as any));
  const updateAssetMutation = useMutation(api.assets?.patch || (null as any));

  const procurementRequests = useQuery(api.procurement?.list || (null as any)) || [];
  const createProcurementMutation = useMutation(api.procurement?.create || (null as any));
  const approveProcurementMutation = useMutation(api.procurement?.approve || (null as any));

  const preventiveMaintenance = useQuery(api.maintenance?.listPreventive || (null as any)) || [];
  const breakdownReports = useQuery(api.maintenance?.listBreakdowns || (null as any)) || [];
  const createPreventiveMutation = useMutation(api.maintenance?.createPreventive || (null as any));
  const createBreakdownMutation = useMutation(api.maintenance?.createBreakdown || (null as any));
  const updatePreventiveMutation = useMutation(api.maintenance?.patchPreventive || (null as any));

  const networkAccessRequests = useQuery(api.network?.list || (null as any)) || [];
  const createNetworkAccessMutation = useMutation(api.network?.create || (null as any));
  const approveNetworkAccessMutation = useMutation(api.network?.approve || (null as any));
  const rejectNetworkAccessMutation = useMutation(api.network?.reject || (null as any));

  const websiteChangeRequests = useQuery(api.website?.list || (null as any)) || [];
  const createWebsiteRequestMutation = useMutation(api.website?.create || (null as any));
  const updateWebsiteRequestMutation = useMutation(api.website?.patch || (null as any));

  const aupSignatures = useQuery(api.aup?.list || (null as any)) || [];
  const createAUPSignatureMutation = useMutation(api.aup?.create || (null as any));
  const verifyAUPSignatureMutation = useMutation(api.aup?.verify || (null as any));

  const users = useQuery(api.users.list) || [];
  const notifications = useQuery(api.notifications?.list || (null as any), { userId: 'default' }) || [];
  const createNotificationMutation = useMutation(api.notifications?.create || (null as any));

  const getTicketById = (ticketId: string) => {
    return (tickets as any[]).find(t => t.ticketId === ticketId);
  };

  const getAssetById = (assetId: string) => {
    return (assets as any[]).find(a => a.assetId === assetId);
  };

  const createTicket = async (data: any) => {
    if (!createTicketMutation) return;
    return await createTicketMutation(data);
  };

  const updateTicket = async (id: string, data: any) => {
    if (!updateTicketMutation) return;
    const ticket = (tickets as any[]).find(t => t.ticketId === id || t._id === id);
    const targetId = ticket ? ticket._id : id;
    await updateTicketMutation({ id: targetId, ...data });
  };

  const deleteTicket = async (id: string) => {
    console.log("Delete not implemented", id);
  };

  const createAsset = async (data: any) => {
    if (!createAssetMutation) return;
    return await createAssetMutation(data);
  };

  const updateAsset = async (id: string, data: any) => {
    if (!updateAssetMutation) return;
    const asset = (assets as any[]).find(a => a.assetId === id);
    const targetId = asset ? asset._id : id;
    await updateAssetMutation({ id: targetId, ...data });
  };

  const deleteAsset = async (id: string) => {
    console.log("Delete not implemented", id);
  };

  const createProcurementRequest = async (data: any) => {
    if (!createProcurementMutation) return;
    return await createProcurementMutation(data);
  };

  const approveProcurement = async (requestId: string, user: string, role: string, comments: string) => {
    if (!approveProcurementMutation) return;
    await approveProcurementMutation({ requestId, userName: user, role, comments });
  };

  const createPreventiveMaintenance = async (data: any) => {
    if (!createPreventiveMutation) return;
    return await createPreventiveMutation(data);
  };

  const updatePreventiveMaintenance = async (id: string, data: any) => {
    if (!updatePreventiveMutation) return;
    await updatePreventiveMutation({ id, ...data });
  };

  const createBreakdownReport = async (data: any) => {
    if (!createBreakdownMutation) return;
    return await createBreakdownMutation(data);
  };

  const createNetworkAccessRequest = async (data: any) => {
    if (!createNetworkAccessMutation) return;
    return await createNetworkAccessMutation(data);
  };

  const approveNetworkAccess = async (requestId: string, approvedBy: string) => {
    if (!approveNetworkAccessMutation) return;
    await approveNetworkAccessMutation({ requestId, approvedBy });
  };

  const rejectNetworkAccess = async (requestId: string, approvedBy: string) => {
    if (!rejectNetworkAccessMutation) return;
    await rejectNetworkAccessMutation({ requestId, approvedBy });
  };

  const createWebsiteChangeRequest = async (data: any) => {
    if (!createWebsiteRequestMutation) return;
    return await createWebsiteRequestMutation(data);
  };

  const updateWebsiteChangeRequest = async (id: string, data: any) => {
    if (!updateWebsiteRequestMutation) return;
    const request = (websiteChangeRequests as any[]).find(r => r.requestId === id);
    const targetId = request ? request._id : id;
    await updateWebsiteRequestMutation({ id: targetId, ...data });
  };

  const createAUPSignature = async (data: any) => {
    if (!createAUPSignatureMutation) return;
    return await createAUPSignatureMutation(data);
  };

  const verifyAUPSignature = async (id: string, verifiedBy: string) => {
    if (!verifyAUPSignatureMutation) return;
    await verifyAUPSignatureMutation({ id: id as any, verifiedBy });
  };

  const createNotification = async (data: any) => {
    if (!createNotificationMutation) return;
    await createNotificationMutation(data);
  };

  const getDashboardStats = (): DashboardStats => {
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter((t: any) => t.status !== 'Closed').length,
      closedTickets: tickets.filter((t: any) => t.status === 'Closed').length,
      totalAssets: assets.length,
      pendingApprovals: procurementRequests.filter((r: any) => r.approvalStatus.includes('Pending')).length,
      maintenanceAlerts: preventiveMaintenance.filter((m: any) => m.status === 'Scheduled' && new Date(m.maintenanceDate) < new Date()).length,
      ticketsByStatus: [],
      ticketsByDepartment: [],
      assetsByType: [],
      monthlyRequests: [],
    };
  };

  const value: BackendContextType = {
    tickets: tickets as any[],
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    assets: assets as any[],
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    procurementRequests: procurementRequests as any[],
    createProcurementRequest,
    approveProcurement,
    preventiveMaintenance: preventiveMaintenance as any[],
    breakdownReports: breakdownReports as any[],
    createPreventiveMaintenance,
    updatePreventiveMaintenance,
    createBreakdownReport,
    networkAccessRequests: networkAccessRequests as any[],
    createNetworkAccessRequest,
    approveNetworkAccess,
    rejectNetworkAccess,
    websiteChangeRequests: websiteChangeRequests as any[],
    createWebsiteChangeRequest,
    updateWebsiteChangeRequest,
    aupSignatures: aupSignatures as any[],
    createAUPSignature,
    verifyAUPSignature,
    users: users as any[],
    notifications: notifications as any[],
    createNotification,
    getDashboardStats,
    liveStats,
    isLoading: false,
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
}
