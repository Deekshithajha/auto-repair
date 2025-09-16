import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { VehicleManagement } from '@/components/vehicles/VehicleManagement';
import { toast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  status: string;
  description: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
  };
}

interface UserDashboardProps {
  activeTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          description,
          created_at,
          vehicles (
            make,
            model,
            year
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    fetchTickets();
    setShowCreateTicket(false);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Tickets</h2>
                <p className="text-muted-foreground">Track your repair requests</p>
              </div>
              <Button 
                onClick={() => setShowCreateTicket(true)}
                className="bg-gradient-primary"
              >
                <span className="mr-2">➕</span>
                Raise Ticket
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold mb-2">No repair tickets yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first ticket to get started</p>
                  <Button 
                    onClick={() => setShowCreateTicket(true)}
                    className="bg-gradient-primary"
                  >
                    <span className="mr-2">➕</span>
                    Create First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}
                        </CardTitle>
                        <StatusBadge status={ticket.status as any} />
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <span className="mr-1">📅</span>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {ticket.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <VehicleManagement />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-muted-foreground">View your repair invoices</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>All your repair invoices and receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-muted-foreground">No invoices available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground">Stay updated on your repairs</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                  <CardDescription>Important notifications about your vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔔</div>
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Profile</h2>
                <p className="text-muted-foreground">Manage your account information</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Name:</span> {profile?.name}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span> 
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {profile?.role}
                      </Badge>
                    </div>
                    {profile?.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {profile.phone}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Ticket Dialog */}
        <CreateTicketDialog 
          open={showCreateTicket}
          onOpenChange={setShowCreateTicket}
          onTicketCreated={handleTicketCreated}
        />
      </div>
    </div>
  );
};