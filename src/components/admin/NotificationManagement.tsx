import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Notification {
  id: string;
  ticket_id: string;
  customer_id: string | null;
  channel: 'email' | 'sms' | 'whatsapp';
  type: 'confirm' | 'reminder' | 'update';
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  to_address: string;
  subject: string | null;
  body: string | null;
  send_at: string;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string | null;
  description: string;
}

export const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'queued' | 'sent' | 'failed' | 'skipped',
    channel: 'all' as 'all' | 'email' | 'sms' | 'whatsapp',
    ticket_id: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.channel !== 'all') {
        query = query.eq('channel', filters.channel);
      }
      if (filters.ticket_id) {
        query = query.eq('ticket_id', filters.ticket_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (notificationId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = 'https://vlelbfqrszjzyuplrogx.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/dispatch-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to dispatch notifications');
      }

      toast({ title: 'Success', description: 'Notifications dispatched' });
      fetchNotifications();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notificationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'queued', error: null })
        .eq('id', notificationId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Notification queued for retry' });
      fetchNotifications();
    } catch (error: any) {
      console.error('Error retrying notification:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (notificationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'skipped' })
        .eq('id', notificationId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Notification cancelled' });
      fetchNotifications();
    } catch (error: any) {
      console.error('Error cancelling notification:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    const ticketId = filters.ticket_id;
    if (!ticketId) {
      toast({ title: 'Error', description: 'Please enter a ticket ID for testing', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = 'https://vlelbfqrszjzyuplrogx.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/test-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          channel: filters.channel !== 'all' ? filters.channel : 'sms',
          to_address: prompt('Enter recipient address (email or phone):') || '',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test notification');
      }

      toast({ title: 'Success', description: 'Test notification sent' });
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      queued: 'secondary',
      sent: 'default',
      failed: 'destructive',
      skipped: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications Management</CardTitle>
          <CardDescription>View, manage, and test customer notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-filter">Channel</Label>
              <Select
                value={filters.channel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value as any }))}
              >
                <SelectTrigger id="channel-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-id">Ticket ID</Label>
              <Input
                id="ticket-id"
                value={filters.ticket_id}
                onChange={(e) => setFilters(prev => ({ ...prev, ticket_id: e.target.value }))}
                placeholder="Filter by ticket ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
              <div className="flex items-end gap-2">
              <Button onClick={handleTestNotification} variant="outline">
                Test Notification
              </Button>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Send At</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                  </TableRow>
                )}
                {!loading && notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No notifications found
                    </TableCell>
                  </TableRow>
                )}
                {!loading && notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="capitalize">{notif.type}</TableCell>
                    <TableCell className="uppercase">{notif.channel}</TableCell>
                    <TableCell className="text-sm">{notif.to_address}</TableCell>
                    <TableCell className="text-sm font-mono">{notif.ticket_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(notif.send_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {notif.sent_at ? format(new Date(notif.sent_at), 'MMM dd, yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(notif.status)}</TableCell>
                    <TableCell className="text-sm text-destructive max-w-xs truncate">
                      {notif.error || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {notif.status === 'queued' && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleSendNow(notif.id)}>
                              Send Now
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancel(notif.id)}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {notif.status === 'failed' && (
                          <Button size="sm" variant="outline" onClick={() => handleRetry(notif.id)}>
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

