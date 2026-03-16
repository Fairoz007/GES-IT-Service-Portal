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
  Zap,
  Search,
  Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

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
  { label: 'Vault', icon: Lock, href: '/vault', badge: 'v2' },
  { label: 'Security', icon: Shield, href: '/aup' },
  { label: 'Reports', icon: FileText, href: '/reports' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col',
        'bg-card border-r border-border/40 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)]',
        collapsed ? 'w-24' : 'w-72'
      )}
    >
      {/* Brand & Quick Search */}
      <div className="flex flex-col pt-6 px-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-[1.25rem] shadow-lg shadow-primary/20 group cursor-pointer hover:rotate-12 transition-transform duration-500">
            <Zap className="h-6 w-6 text-primary-foreground fill-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="font-black text-xl tracking-tighter leading-none">GES IT</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 opacity-70">Service Portal</span>
            </div>
          )}
        </div>

        {!collapsed && (
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                <div className="h-11 w-full bg-secondary/30 rounded-xl border border-border/50 flex items-center pl-10 pr-3 cursor-pointer hover:bg-secondary/50 transition-all">
                    <span className="text-xs font-bold text-muted-foreground">Quick Search...</span>
                    <div className="ml-auto flex gap-1">
                        <kbd className="h-5 px-1.5 rounded bg-background border border-border/50 text-[10px] font-bold text-muted-foreground flex items-center justify-center">⌘</kbd>
                        <kbd className="h-5 px-1.5 rounded bg-background border border-border/50 text-[10px] font-bold text-muted-foreground flex items-center justify-center">K</kbd>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1 mt-2 scrollbar-none">
        <p className={cn(
            "text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-4 transition-opacity",
            collapsed && "opacity-0"
        )}>
            Navigation
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-[13px] font-bold transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02] z-10'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                collapsed && 'justify-center px-0 mx-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                isActive ? "text-primary-foreground stroke-[2.5px]" : "text-muted-foreground"
              )} />
              {!collapsed && (
                <>
                    <span className="flex-1 animate-in fade-in duration-700">{item.label}</span>
                    {item.badge && (
                        <Badge className="bg-primary-foreground/20 text-primary-foreground border-none text-[9px] font-black h-5 px-1.5 rounded-lg">
                            {item.badge}
                        </Badge>
                    )}
                </>
              )}
              
              {isActive && (
                <div className="absolute right-0 top-0 h-full w-1 bg-primary-foreground opacity-30" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 space-y-4">
        {!collapsed && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">System Health</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Stable Ops</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
            </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full h-12 rounded-xl hover:bg-secondary border border-border/20 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
        >
          {collapsed ? (
              <ChevronRight className="h-5 w-5" />
          ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>
              </>
          )}
        </Button>
      </div>
    </aside>
  );
}
