import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Wrench, Car, Clipboard, Timer, Settings } from 'lucide-react';

interface EmployeeDashboardProps {
  activeTab?: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ activeTab = 'assignments' }) => {
  const { profile } = useAuth();


  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="assignments" className="flex items-center space-x-2">
              <Clipboard className="h-4 w-4" />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Timer className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">My Assignments</h2>
              <p className="text-muted-foreground">Work on assigned repair tickets</p>
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
                  <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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