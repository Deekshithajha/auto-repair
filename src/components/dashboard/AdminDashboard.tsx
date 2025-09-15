import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Wrench, Car, Inbox, Users, BarChart3, Settings, Monitor } from 'lucide-react';

interface AdminDashboardProps {
  activeTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { profile } = useAuth();


  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <Inbox className="h-4 w-4" />
              <span>Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Live Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Ticket Inbox</h2>
              <p className="text-muted-foreground">Approve, decline, and assign repair tickets</p>
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
            <div>
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <p className="text-muted-foreground">Manage employees, attendance, and assignments</p>
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
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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