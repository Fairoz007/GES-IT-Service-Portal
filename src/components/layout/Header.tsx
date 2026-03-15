import { useNavigate } from 'react-router-dom';
import { UserButton, Show, useUser } from "@clerk/react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Search, Bell, Settings, Command } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 transition-all duration-300',
        'bg-background/80 backdrop-blur-xl border-b border-border/50',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar - Modern Look */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 h-10 pl-10 pr-10 rounded-xl text-sm transition-all outline-none border"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 group-focus-within:opacity-100 transition-opacity">
              <Command className="h-3 w-3" />
              <span className="text-[10px] font-bold">K</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 rounded-xl">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background ring-offset-background" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/5 rounded-xl"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="h-8 w-[1px] bg-border/50 mx-2" />

          {/* Clerk User Button */}
          <Show when="signed-in">
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-semibold">{user?.fullName}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">IT Operations</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-xl border-2 border-primary/10",
                  }
                }}
              />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
