import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ReportsAnalytics: React.FC = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    completedTickets: 0,
    totalRevenue: 0,
    avgCompletionTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Fetch ticket statistics
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, status, created_at, work_completed_at');

      if (ticketsError) throw ticketsError;

      // Fetch invoice totals
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total_amount');

      if (invoicesError) throw invoicesError;

      const completedTickets = tickets?.filter(t => t.status === 'completed') || [];
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      
      // Calculate average completion time
      const completionTimes = completedTickets
        .filter(t => t.created_at && t.work_completed_at)
        .map(t => {
          const start = new Date(t.created_at).getTime();
          const end = new Date(t.work_completed_at!).getTime();
          return (end - start) / (1000 * 60 * 60); // Hours
        });

      const avgTime = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      setStats({
        totalTickets: tickets?.length || 0,
        completedTickets: completedTickets.length,
        totalRevenue,
        avgCompletionTime: avgTime
      });
    } catch (error: any) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">Business insights and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-3xl">{stats.totalTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.completedTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalTickets > 0 ? Math.round((stats.completedTickets / stats.totalTickets) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              ${stats.totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Completion</CardDescription>
            <CardTitle className="text-3xl">{stats.avgCompletionTime.toFixed(1)}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Average repair time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Reports</CardTitle>
          <CardDescription>More detailed analytics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              📊 Monthly Performance Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              👥 Employee Productivity Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              💰 Revenue Breakdown by Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              😊 Customer Satisfaction Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
