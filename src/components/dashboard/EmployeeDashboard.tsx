import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';

interface EmployeeDashboardProps {
  activeTab?: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ activeTab = 'assignments' }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto text-xs sm:text-sm">
            <TabsTrigger value="assignments" className="flex items-center space-x-1 sm:space-x-2">
              <span>📋</span>
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-1 sm:space-x-2">
              <span>⏰</span>
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-1 sm:space-x-2">
              <span>👤</span>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2">
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">My Assignments</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Work on assigned repair tickets</p>
              </div>
              <CustomerRegistration />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Queue</CardTitle>
                <CardDescription>Your active repair assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">No assignments available</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>Clock in/out and view your attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏰</div>
                  <p className="text-muted-foreground">Attendance tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Employee Profile</CardTitle>
                <CardDescription>Manage your employee information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Name:</span> {profile?.name}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {profile?.role}
                  </div>
                  {profile?.employee_id && (
                    <div>
                      <span className="font-medium">Employee ID:</span> {profile.employee_id}
                    </div>
                  )}
                  {profile?.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {profile.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Employee preferences and settings</CardDescription>
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