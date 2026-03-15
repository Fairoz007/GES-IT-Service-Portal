import React, { createContext, useContext, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import type { User, UserRole } from '@/types';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: User | null;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'view_dashboard' | 'view_all_tickets' | 'view_own_tickets' | 'create_ticket'
  | 'assign_ticket' | 'resolve_ticket' | 'delete_ticket' | 'view_all_assets'
  | 'create_asset' | 'edit_asset' | 'delete_asset' | 'assign_asset'
  | 'view_procurement' | 'create_procurement' | 'approve_procurement'
  | 'view_network_access' | 'approve_network_access' | 'view_website_requests'
  | 'create_website_request' | 'approve_website_request' | 'view_maintenance'
  | 'create_maintenance' | 'view_aup' | 'sign_aup' | 'verify_aup'
  | 'view_reports' | 'export_reports' | 'manage_users' | 'view_settings' | 'manage_settings';

const rolePermissions: Record<UserRole, Permission[]> = {
  'Admin': [
    'view_dashboard', 'view_all_tickets', 'view_own_tickets', 'create_ticket', 'assign_ticket', 
    'resolve_ticket', 'delete_ticket', 'view_all_assets', 'create_asset', 'edit_asset', 
    'delete_asset', 'assign_asset', 'view_procurement', 'create_procurement', 'approve_procurement',
    'view_network_access', 'approve_network_access', 'view_website_requests', 'create_website_request',
    'approve_website_request', 'view_maintenance', 'create_maintenance', 'view_aup', 'sign_aup',
    'verify_aup', 'view_reports', 'export_reports', 'manage_users', 'view_settings', 'manage_settings'
  ],
  'IT Staff': [
    'view_dashboard', 'view_all_tickets', 'view_own_tickets', 'create_ticket', 'assign_ticket',
    'resolve_ticket', 'view_all_assets', 'create_asset', 'edit_asset', 'assign_asset',
    'view_procurement', 'create_procurement', 'view_network_access', 'approve_network_access',
    'view_website_requests', 'create_website_request', 'view_maintenance', 'create_maintenance',
    'view_aup', 'sign_aup', 'view_reports', 'view_settings'
  ],
  'Department Head': [
    'view_dashboard', 'view_own_tickets', 'create_ticket', 'view_all_assets',
    'view_procurement', 'create_procurement', 'approve_procurement', 'view_network_access',
    'view_website_requests', 'create_website_request', 'approve_website_request',
    'view_maintenance', 'view_aup', 'sign_aup', 'view_reports'
  ],
  'Employee': [
    'view_dashboard', 'view_own_tickets', 'create_ticket', 'view_all_assets',
    'view_procurement', 'create_procurement', 'view_network_access', 'view_website_requests',
    'create_website_request', 'view_aup', 'sign_aup'
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  
  // Get extra user data from Convex (role, department, etc.)
  const convexUser = useQuery(api.users.getByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.username || "User",
    email: clerkUser.primaryEmailAddress?.emailAddress || "",
    role: (convexUser?.role as UserRole) || 'Employee',
    department: (convexUser?.department as string) || 'General',
    employeeCode: (convexUser?.employeeCode as string) || 'EMP-XXXX',
    status: 'Active',
    createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
    avatar: clerkUser.imageUrl,
  } : null;

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  }, [user]);

  const value: AuthContextType = {
    isSignedIn: !!isSignedIn,
    isLoaded: clerkLoaded,
    user,
    signOut: clerkSignOut,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
