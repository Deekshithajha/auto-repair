import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';

interface AdminDashboardProps {
  activeTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:w-auto text-xs sm:text-sm">
            <TabsTrigger value="tickets" className="flex items-center space-x-1 sm:space-x-2">
              <span>📧</span>
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-1 sm:space-x-2">
              <span>👥</span>
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center space-x-1 sm:space-x-2">
              <span>📊</span>
              <span className="hidden sm:inline">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-1 sm:space-x-2">
              <span>📈</span>
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2">
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Ticket Inbox</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Approve, decline, and assign repair tickets</p>
              </div>
              <CustomerRegistration />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>New tickets awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">No pending tickets</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Employee Management</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage employees, attendance, and assignments</p>
              </div>
              <CustomerRegistration />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>View and manage your team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">No employees registered</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Monitor Tab */}
          <TabsContent value="monitor">
            <div>
              <h2 className="text-2xl font-bold">Real-time Monitor</h2>
              <p className="text-muted-foreground">See who's working on what in real-time</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Work</CardTitle>
                <CardDescription>Current employee assignments and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-muted-foreground">No active work sessions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Business insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📈</div>
                  <p className="text-muted-foreground">Reports coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure application settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Settings panel coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};