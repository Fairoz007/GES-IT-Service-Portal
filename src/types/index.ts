// User Roles
export type UserRole = 'Admin' | 'IT Staff' | 'Department Head' | 'Employee';

// User Status
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

// User Interface
export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  employeeCode: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
}

// Ticket Priority
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

// Ticket Status
export type TicketStatus = 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

// Ticket Category
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Printer' | 'Email' | 'Other';

// Ticket Interface
export interface Ticket {
  _id: string;
  ticketId: string;
  userId: string;
  userName: string;
  department: string;
  location: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  attachment?: string;
  assignedTo?: string;
  assignedToName?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  slaDeadline: string;
  internalNotes?: string[];
  activityLog: ActivityLog[];
}

// Activity Log
export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

// Asset Status
export type AssetStatus = 'Available' | 'Assigned' | 'In Maintenance' | 'Retired' | 'Disposed';

// Asset Type
export type AssetType = 'Laptop' | 'Desktop' | 'Monitor' | 'Printer' | 'Server' | 'Network Equipment' | 'Mobile Device' | 'Other';

// Asset Interface
export interface Asset {
  _id: string;
  assetId: string;
  assetCode: string;
  assetType: AssetType;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  assignedTo?: string;
  assignedToName?: string;
  department?: string;
  location: string;
  status: AssetStatus;
  notes?: string;
  history: AssetHistory[];
  qrCode?: string;
}

// Asset History
export interface AssetHistory {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

// Procurement Status
export type ProcurementStatus = 'Draft' | 'Pending Department Head' | 'Pending IT Head' | 'Pending Management' | 'Approved' | 'Rejected' | 'Ordered' | 'Received';

// Procurement Request
export interface ProcurementRequest {
  _id: string;
  requestId: string;
  requester: string;
  requesterId: string;
  department: string;
  itemDescription: string;
  quantity: number;
  justification: string;
  estimatedCost: number;
  supplier?: string;
  approvalStatus: ProcurementStatus;
  approvals: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

// Approval Step
export interface ApprovalStep {
  step: number;
  role: string;
  approver?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
  comments?: string;
}

// Network Access Request
export interface NetworkAccessRequest {
  _id: string;
  requestId: string;
  userId: string;
  userName: string;
  department: string;
  deviceType: string;
  macAddress: string;
  deviceOwnership: 'Company' | 'Personal';
  internetType: 'Wired' | 'Wireless';
  accessLevel: 'Limited' | 'Corporate' | 'Unlimited';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

// Website Change Request (RFC)
export type ChangeType = 'New Content' | 'Edit Content' | 'Bug Fix' | 'Feature Enhancement';
export type RFCStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Scheduled' | 'Deployed';

export interface WebsiteChangeRequest {
  _id: string;
  requestId: string;
  applicationName: string;
  requester: string;
  requesterId: string;
  department: string;
  changeType: ChangeType;
  changeDescription: string;
  priority: TicketPriority;
  impactedSystems: string[];
  requestedGoLiveDate: string;
  status: RFCStatus;
  approval?: string;
  deploymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance Type
export type MaintenanceType = 'Preventive' | 'Breakdown';

// Maintenance Status
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';

// Preventive Maintenance
export interface PreventiveMaintenance {
  _id: string;
  id: string;
  device: string;
  assetId?: string;
  location: string;
  maintenanceDate: string;
  status: MaintenanceStatus;
  remarks?: string;
  technician?: string;
  completedAt?: string;
}

// Breakdown Report
export interface BreakdownReport {
  _id: string;
  id: string;
  device: string;
  assetId?: string;
  issueDescription: string;
  sparePartsUsed: string[];
  repairDetails: string;
  repairCost: number;
  technician: string;
  reportDate: string;
  repairDate: string;
  status: 'Reported' | 'In Repair' | 'Fixed' | 'Cannot Repair';
}

// AUP Signature
export interface AUPSignature {
  _id: string;
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  signedDate: string;
  signature: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// Notification Type
export type NotificationType = 'Ticket' | 'Approval' | 'Maintenance' | 'Asset' | 'System';

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  totalAssets: number;
  pendingApprovals: number;
  maintenanceAlerts: number;
  ticketsByStatus: { name: string; value: number }[];
  ticketsByDepartment: { name: string; value: number }[];
  assetsByType: { name: string; value: number }[];
  monthlyRequests: { month: string; tickets: number; requests: number }[];
}

// Report Types
export type ReportType = 'Tickets' | 'Assets' | 'Maintenance' | 'Procurement' | 'Network';

// Theme
export type Theme = 'light' | 'dark';
