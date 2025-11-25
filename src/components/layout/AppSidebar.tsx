import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, Users, Calendar, BarChart3, DollarSign, 
  TrendingUp, Shield, Bell, Settings, ClipboardList,
  UserPlus, FileText, Clock, User, LogOut, Car
} from 'lucide-react';
import lakewoodLogo from '@/assets/lakewood-logo.png';

export function AppSidebar() {
  const { user, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const collapsed = state === 'collapsed';

  // Navigation items for different roles
  const getNavItems = () => {
    switch (profile?.role) {
      case 'admin':
        return [
          { title: 'Ticket Inbox', url: '/admin/tickets', icon: Mail },
          { title: 'Quotes', url: '/admin/quotes', icon: FileText },
          { title: 'Customers', url: '/admin/customers', icon: Users },
          { title: 'Employee Management', url: '/admin/employees', icon: Users },
          { title: 'Rescheduled Vehicles', url: '/admin/rescheduled', icon: Calendar },
          { title: 'Live Monitor', url: '/admin/monitor', icon: BarChart3 },
          { title: 'Revenue Tracker', url: '/admin/revenue', icon: DollarSign },
          { title: 'Reports', url: '/admin/reports', icon: TrendingUp },
          { title: 'Audit Logs', url: '/admin/audit', icon: Shield },
          { title: 'Notifications', url: '/admin/notifications', icon: Bell },
          { title: 'Settings', url: '/admin/settings', icon: Settings },
        ];
      case 'employee':
        return [
          { title: 'My Assignments', url: '/employee/assignments', icon: ClipboardList },
          { title: 'Register Customer', url: '/employee/register', icon: UserPlus },
          { title: 'Customers', url: '/employee/customers', icon: Users },
          { title: 'Rescheduled Vehicles', url: '/employee/rescheduled', icon: Calendar },
          { title: 'Work Log', url: '/employee/worklog', icon: FileText },
          { title: 'Attendance', url: '/employee/attendance', icon: Clock },
          { title: 'Profile', url: '/employee/profile', icon: User },
          { title: 'Settings', url: '/employee/settings', icon: Settings },
        ];
      default: // user
        return [
          { title: 'My Tickets', url: '/user/tickets', icon: Mail },
          { title: 'My Vehicles', url: '/user/vehicles', icon: Car },
          { title: 'Vehicle Status', url: '/user/vehicle-status', icon: BarChart3 },
          { title: 'Rescheduled Vehicles', url: '/user/rescheduled', icon: Calendar },
          { title: 'Invoices', url: '/user/invoices', icon: FileText },
          { title: 'Notifications', url: '/user/notifications', icon: Bell },
          { title: 'Profile', url: '/user/profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <img 
            src={lakewoodLogo} 
            alt="Lakewood 76 Auto Repair" 
            className={collapsed ? "w-8 h-8 object-contain" : "h-12 object-contain"}
          />
          {!collapsed && (
            <div>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role} Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}