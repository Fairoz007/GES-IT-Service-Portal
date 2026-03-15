import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BackendProvider } from '@/contexts/BackendContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { TicketList } from '@/pages/helpdesk/TicketList';
import { TicketDetail } from '@/pages/helpdesk/TicketDetail';
import { AssetList } from '@/pages/assets/AssetList';
import { AssetDetail } from '@/pages/assets/AssetDetail';
import { ProcurementList } from '@/pages/procurement/ProcurementList';
import { NetworkAccessList } from '@/pages/network/NetworkAccessList';
import { MaintenanceList } from '@/pages/maintenance/MaintenanceList';
import { WebsiteRequestList } from '@/pages/website/WebsiteRequestList';
import { AUPList } from '@/pages/aup/AUPList';
import { Reports } from '@/pages/reports/Reports';
import { Settings } from '@/pages/settings/Settings';
import { Vault } from '@/pages/vault/Vault';
import { ShareView } from '@/pages/vault/ShareView';
import { Toaster } from 'sonner';


import type { UserRole } from '@/types';

// Protected Route component
function ProtectedRoute({ 
  children, 
  roles 
}: { 
  children: React.ReactNode; 
  roles?: UserRole[];
}) {
  const { isSignedIn, isLoaded, hasRole } = useAuth();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route - redirects to dashboard if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/vault/share/:token"
        element={<ShareView />}
      />
      {/* Protected Routes */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - All roles */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Helpdesk - All roles */}
        <Route path="helpdesk" element={<TicketList />} />
        <Route path="helpdesk/:ticketId" element={<TicketDetail />} />
        <Route path="helpdesk/new" element={<TicketList />} />

        {/* Assets - All roles */}
        <Route path="assets" element={<AssetList />} />
        <Route path="assets/:assetId" element={<AssetDetail />} />

        {/* Procurement - All roles */}
        <Route path="procurement" element={<ProcurementList />} />
        <Route path="procurement/:requestId" element={<ProcurementList />} />

        {/* Maintenance - All roles */}
        <Route path="maintenance" element={<MaintenanceList />} />

        {/* Network Access - All roles */}
        <Route path="network" element={<NetworkAccessList />} />

        {/* Website Requests - All roles */}
        <Route path="website" element={<WebsiteRequestList />} />

        {/* AUP - All roles */}
        <Route path="aup" element={<AUPList />} />

        {/* Vault - All roles */}
        <Route path="vault" element={<Vault />} />

        {/* Reports - Admin, IT Staff, Department Heads */}
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={['Admin', 'IT Staff', 'Department Head']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Users - Admin only */}
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['Admin']}>
              <div className="p-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground mt-2">Manage users and permissions</p>
                <div className="mt-6 p-8 text-center text-muted-foreground bg-muted rounded-lg">
                  User management module coming soon
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Settings - Admin and IT Staff */}
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={['Admin', 'IT Staff']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="notifications"
          element={
            <div className="p-6">
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground mt-2">View all your notifications</p>
              <div className="mt-6 p-8 text-center text-muted-foreground bg-muted rounded-lg">
                Notifications module coming soon
              </div>
            </div>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <div className="p-6">
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your profile</p>
              <div className="mt-6 p-8 text-center text-muted-foreground bg-muted rounded-lg">
                Profile module coming soon
              </div>
            </div>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BackendProvider>
          <Toaster position="top-right" richColors />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </BackendProvider>

      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
