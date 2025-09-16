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
          { title: 'Ticket Inbox', url: '/admin/tickets', icon: '📧' },
          { title: 'Employee Management', url: '/admin/employees', icon: '👥' },
          { title: 'Live Monitor', url: '/admin/monitor', icon: '📊' },
          { title: 'Reports', url: '/admin/reports', icon: '📈' },
          { title: 'Audit Logs', url: '/admin/audit', icon: '🛡️' },
          { title: 'Settings', url: '/admin/settings', icon: '⚙️' },
        ];
      case 'employee':
        return [
          { title: 'My Assignments', url: '/employee/assignments', icon: '📋' },
          { title: 'Work Log', url: '/employee/worklog', icon: '📄' },
          { title: 'Attendance', url: '/employee/attendance', icon: '⏰' },
          { title: 'Profile', url: '/employee/profile', icon: '👤' },
          { title: 'Settings', url: '/employee/settings', icon: '⚙️' },
        ];
      default: // user
        return [
          { title: 'My Tickets', url: '/user/tickets', icon: '🎫' },
          { title: 'Vehicles', url: '/user/vehicles', icon: '🚗' },
          { title: 'Invoices', url: '/user/invoices', icon: '🧾' },
          { title: 'Notifications', url: '/user/notifications', icon: '🔔' },
          { title: 'Profile', url: '/user/profile', icon: '👤' },
        ];
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <span className="text-primary-foreground">🔧</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sidebar-foreground">97</h1>
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <span className="text-sm">{item.icon}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
          >
            <span className="text-sm">🚪</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}