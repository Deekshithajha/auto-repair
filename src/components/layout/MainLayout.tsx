import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/components/auth/Login';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export const MainLayout: React.FC = () => {
  const { user, profile, loading, signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login onSubmit={async (credentials) => {
      const { email, password } = credentials;
      const attempt = await signIn(email, password);
      if (attempt.error) {
        // Auto-provision demo users if sign-in fails
        const demoMap: Record<string, { name: string; role: 'user' | 'employee' | 'admin' } > = {
          'demo-customer@autorepair.com': { name: 'Demo Customer', role: 'user' },
          'demo-employee@autorepair.com': { name: 'Demo Employee', role: 'employee' },
          'demo-admin@autorepair.com': { name: 'Demo Admin', role: 'admin' },
        };
        const meta = demoMap[email.toLowerCase()];
        if (meta) {
          await signUp(email, password, meta.name);
          await signIn(email, password);
        }
      }
    }} />;
  }

  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b border-border bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="font-semibold text-foreground">AUTO REPAIR INC</h1>
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <Routes>
                {/* User Routes */}
                <Route path="/user/tickets" element={profile.role === 'user' ? <UserDashboard activeTab="tickets" /> : <Navigate to="/" />} />
                <Route path="/user/vehicles" element={profile.role === 'user' ? <UserDashboard activeTab="vehicles" /> : <Navigate to="/" />} />
                <Route path="/user/invoices" element={profile.role === 'user' ? <UserDashboard activeTab="invoices" /> : <Navigate to="/" />} />
                <Route path="/user/notifications" element={profile.role === 'user' ? <UserDashboard activeTab="notifications" /> : <Navigate to="/" />} />
                <Route path="/user/profile" element={profile.role === 'user' ? <UserDashboard activeTab="profile" /> : <Navigate to="/" />} />
                
                {/* Employee Routes */}
                <Route path="/employee/assignments" element={profile.role === 'employee' ? <EmployeeDashboard activeTab="assignments" /> : <Navigate to="/" />} />
                <Route path="/employee/worklog" element={profile.role === 'employee' ? <EmployeeDashboard activeTab="worklog" /> : <Navigate to="/" />} />
                <Route path="/employee/attendance" element={profile.role === 'employee' ? <EmployeeDashboard activeTab="attendance" /> : <Navigate to="/" />} />
                <Route path="/employee/profile" element={profile.role === 'employee' ? <EmployeeDashboard activeTab="profile" /> : <Navigate to="/" />} />
                <Route path="/employee/settings" element={profile.role === 'employee' ? <EmployeeDashboard activeTab="settings" /> : <Navigate to="/" />} />
                
                {/* Admin Routes */}
                <Route path="/admin/tickets" element={profile.role === 'admin' ? <AdminDashboard activeTab="tickets" /> : <Navigate to="/" />} />
                <Route path="/admin/employees" element={profile.role === 'admin' ? <AdminDashboard activeTab="employees" /> : <Navigate to="/" />} />
                <Route path="/admin/register" element={profile.role === 'admin' ? <AdminDashboard activeTab="register" /> : <Navigate to="/" />} />
                <Route path="/admin/monitor" element={profile.role === 'admin' ? <AdminDashboard activeTab="monitor" /> : <Navigate to="/" />} />
                <Route path="/admin/reports" element={profile.role === 'admin' ? <AdminDashboard activeTab="reports" /> : <Navigate to="/" />} />
                <Route path="/admin/audit" element={profile.role === 'admin' ? <AdminDashboard activeTab="audit" /> : <Navigate to="/" />} />
                <Route path="/admin/settings" element={profile.role === 'admin' ? <AdminDashboard activeTab="settings" /> : <Navigate to="/" />} />
                
                {/* Default redirects based on role */}
                <Route path="/" element={
                  <Navigate to={
                    profile.role === 'admin' ? '/admin/tickets' :
                    profile.role === 'employee' ? '/employee/assignments' :
                    '/user/tickets'
                  } replace />
                } />
              </Routes>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </Router>
  );
};