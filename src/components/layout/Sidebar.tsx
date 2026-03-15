import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  Package,
  ShoppingCart,
  Wrench,
  Wifi,
  Globe,
  FileText,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Box,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Helpdesk', icon: Ticket, href: '/helpdesk' },
  { label: 'Inventory', icon: Box, href: '/assets' },
  { label: 'Orders', icon: ShoppingCart, href: '/procurement' },
  { label: 'Maintenance', icon: Wrench, href: '/maintenance' },
  { label: 'Network', icon: Wifi, href: '/network' },
  { label: 'Digital', icon: Globe, href: '/website' },
  { label: 'Vault', icon: Lock, href: '/vault' },
  { label: 'Security', icon: Shield, href: '/aup' },
  { label: 'Reports', icon: FileText, href: '/reports' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
        'bg-card border-r border-border/50 shadow-xl',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
            <Box className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">GES IT</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Service Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform group-active:scale-95",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )} />
              {!collapsed && (
                <span className="flex-1 animate-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50">
        {!collapsed && (
          <div className="bg-secondary/30 rounded-2xl p-4 mb-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Storage</p>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full w-[65%]" />
            </div>
            <p className="text-[10px] text-muted-foreground">Using 12.4 GB of 20 GB</p>
          </div>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="w-full h-10 rounded-xl hover:bg-secondary border-border/50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
