import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfToday, subDays, subMonths, startOfMonth, parseISO } from 'date-fns';

interface DailyFinance {
  date: string;
  revenue: number;
  cogs: number;
  margin: number;
  invoice_count: number;
}

interface MonthlyFinance {
  year: number;
  month: number;
  revenue: number;
  cogs: number;
  margin: number;
  invoice_count: number;
}

interface FinanceFilters {
  dateFrom: string;
  dateTo: string;
  mechanicId: string | null;
  serviceType: string | null;
  paymentMethod: string | null;
}

export const RevenueTracker: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyFinance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinance[]>([]);
  const [detailData, setDetailData] = useState<DailyFinance[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  
  // KPI State
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayCOGS, setTodayCOGS] = useState(0);
  const [todayMargin, setTodayMargin] = useState(0);
  const [mtdRevenue, setMtdRevenue] = useState(0);
  const [mtdCOGS, setMtdCOGS] = useState(0);
  const [mtdMargin, setMtdMargin] = useState(0);

  // Filters
  const [filters, setFilters] = useState<FinanceFilters>({
    dateFrom: format(subDays(startOfToday(), 30), 'yyyy-MM-dd'),
    dateTo: format(startOfToday(), 'yyyy-MM-dd'),
    mechanicId: null,
    serviceType: null,
    paymentMethod: null,
  });

  useEffect(() => {
    fetchEmployees();
    fetchAllData();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          profiles:user_id(id, name)
        `)
        .eq('employment_status', 'active');

      if (error) throw error;

      const empList = (data || [])
        .map((emp: any) => {
          const profile = Array.isArray(emp.profiles) ? emp.profiles[0] : emp.profiles;
          return profile ? { id: profile.id, name: profile.name || 'Unknown' } : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string }>;

      setEmployees(empList);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's metrics
      await fetchTodayMetrics();
      
      // Fetch MTD metrics
      await fetchMTDMetrics();
      
      // Fetch daily data (last 30 days)
      await fetchDailyData();
      
      // Fetch monthly data (last 12 months)
      await fetchMonthlyData();
      
      // Fetch detailed table data
      await fetchDetailData();
    } catch (error: any) {
      console.error('Error fetching revenue data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch revenue data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMetrics = async () => {
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(startOfToday().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Revenue: sum of invoices.total_amount where payment_status = 'paid' and created_at is today
    const { data: invoices, error: invError } = await (supabase as any)
      .from('invoices')
      .select('id, total_amount, ticket_id, payment_status, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', today)
      .lt('created_at', tomorrow);

    if (invError) throw invError;
    
    // Filter to only invoices created today
    const todayInvoices = ((invoices as any) || []).filter((inv: any) => {
      const createdDate = inv.created_at;
      if (!createdDate) return false;
      const createdDateStr = format(parseISO(createdDate), 'yyyy-MM-dd');
      return createdDateStr === today;
    });
    
    return processTodayMetrics(todayInvoices);
  };

  const processTodayMetrics = async (invoices: any[]) => {
    const revenue = (invoices || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // COGS: sum of parts.quantity * parts.unit_price for tickets with invoices paid today
    const ticketIds = [...new Set((invoices || []).map(inv => inv.ticket_id).filter(Boolean))];
    let cogs = 0;

    if (ticketIds.length > 0) {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('ticket_id, quantity, unit_price')
        .in('ticket_id', ticketIds);

      if (partsError) {
        console.warn('Error fetching parts for COGS:', partsError);
        // Don't throw, just use 0 for COGS if we can't fetch parts
      } else {
        cogs = (parts || []).reduce((sum, part) => {
          const qty = part.quantity || 0;
          const price = part.unit_price || 0;
          return sum + (qty * price);
        }, 0);
      }
    }

    const margin = revenue - cogs;

    setTodayRevenue(revenue);
    setTodayCOGS(cogs);
    setTodayMargin(margin);
  };

  const fetchMTDMetrics = async () => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const today = format(startOfToday(), 'yyyy-MM-dd');

    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('id, total_amount, ticket_id, status, created_at')
      .eq('status', 'paid') as any;

    if (invError) throw invError;

    const inRangeInvoices = (invoices || []).filter((inv: any) => {
      const paidDate = inv.created_at;
      if (!paidDate) return false;
      const paidStr = format(parseISO(paidDate), 'yyyy-MM-dd');
      return paidStr >= monthStart && paidStr <= today;
    });

    const revenue = inRangeInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

    // COGS: sum of parts.quantity * parts.unit_price for tickets with invoices paid this month
    const ticketIds = inRangeInvoices.map((inv: any) => inv.ticket_id).filter(Boolean);
    let cogs = 0;

    if (ticketIds.length > 0) {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('quantity, unit_price')
        .in('ticket_id', ticketIds);

      if (partsError) throw partsError;
      cogs = (parts || []).reduce((sum, part) => sum + ((part.quantity || 0) * (part.unit_price || 0)), 0);
    }

    const margin = revenue - cogs;

    setMtdRevenue(revenue);
    setMtdCOGS(cogs);
    setMtdMargin(margin);
  };

  const fetchDailyData = async () => {
    const startDate = format(subDays(startOfToday(), 30), 'yyyy-MM-dd');
    const endDate = format(startOfToday(), 'yyyy-MM-dd');

    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('id, total_amount, ticket_id, status, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: true }) as any;

    if (invError) throw invError;

    // Group by date
    const dailyMap = new Map<string, DailyFinance>();

    for (const inv of invoices || []) {
      const paidDate = inv.created_at;
      if (!paidDate) continue;
      const dateStr = format(parseISO(paidDate), 'yyyy-MM-dd');
      if (dateStr < startDate || dateStr > endDate) continue;
      const dateKey = dateStr;
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          cogs: 0,
          margin: 0,
          invoice_count: 0,
        });
      }
      
      const dayData = dailyMap.get(dateKey)!;
      dayData.revenue += (inv as any).total_amount || 0;
      dayData.invoice_count += 1;
    }

    // Fetch COGS for all ticket_ids
    const allTicketIds = [...new Set((invoices || []).map((inv: any) => inv.ticket_id).filter(Boolean))];
    if (allTicketIds.length > 0) {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('ticket_id, quantity, unit_price');

      if (partsError) throw partsError;

      // Group parts by ticket_id
      const partsByTicket = new Map<string, number>();
      (parts || []).forEach(part => {
        const cost = (partsByTicket.get(part.ticket_id) || 0) + (part.quantity * part.unit_price);
        partsByTicket.set(part.ticket_id, cost);
      });

      // Assign COGS to dates
      (invoices || []).forEach((inv: any) => {
        const paidDate = inv.created_at;
        if (!paidDate) return;
        const dateKey = format(parseISO(paidDate), 'yyyy-MM-dd');
        const dayData = dailyMap.get(dateKey);
        if (dayData) {
          dayData.cogs += partsByTicket.get(inv.ticket_id) || 0;
          dayData.margin = dayData.revenue - dayData.cogs;
        }
      });
    }

    // Fill missing dates with zeros
    const result: DailyFinance[] = [];
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(startOfToday(), 29 - i), 'yyyy-MM-dd');
      const dayData = dailyMap.get(date) || {
        date,
        revenue: 0,
        cogs: 0,
        margin: 0,
        invoice_count: 0,
      };
      result.push(dayData);
    }

    setDailyData(result);
  };

  const fetchMonthlyData = async () => {
    const startMonth = subMonths(new Date(), 12);
    
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('id, total_amount, ticket_id, status, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: true }) as any;

    if (invError) throw invError;

    // Group by year-month
    const monthlyMap = new Map<string, MonthlyFinance>();

    for (const inv of invoices || []) {
      const paidDate = inv.created_at;
      if (!paidDate) continue;
      const date = parseISO(paidDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          revenue: 0,
          cogs: 0,
          margin: 0,
          invoice_count: 0,
        });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.revenue += (inv as any).total_amount || 0;
      monthData.invoice_count += 1;
    }

    // Fetch COGS
    const allTicketIds = [...new Set((invoices || []).map((inv: any) => inv.ticket_id).filter(Boolean))];
    if (allTicketIds.length > 0) {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('ticket_id, quantity, unit_price');

      if (partsError) throw partsError;

      const partsByTicket = new Map<string, number>();
      (parts || []).forEach(part => {
        const cost = (partsByTicket.get(part.ticket_id) || 0) + (part.quantity * part.unit_price);
        partsByTicket.set(part.ticket_id, cost);
      });

      (invoices || []).forEach((inv: any) => {
        const paidDate = inv.created_at;
        if (!paidDate) return;
        const date = parseISO(paidDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyMap.get(monthKey);
        if (monthData) {
          monthData.cogs += partsByTicket.get(inv.ticket_id) || 0;
          monthData.margin = monthData.revenue - monthData.cogs;
        }
      });
    }

    const result = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    setMonthlyData(result);
  };

  const fetchDetailData = async () => {
    // Fetch detailed data based on filters
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('id, total_amount, ticket_id, status, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: false }) as any;

    if (invError) throw invError;

    // Apply date range and additional filters client-side
    let filteredInvoices = (invoices || []).filter((inv: any) => {
      const paidDate = inv.created_at;
      if (!paidDate) return false;
      const dateStr = format(parseISO(paidDate), 'yyyy-MM-dd');
      return dateStr >= filters.dateFrom && dateStr <= filters.dateTo;
    });

    // Payment method filter removed as column doesn't exist

    // Group by date
    const dailyMap = new Map<string, DailyFinance>();

    for (const inv of filteredInvoices as any[]) {
      const paidDate = inv.created_at;
      if (!paidDate) continue;
      const dateKey = format(parseISO(paidDate), 'yyyy-MM-dd');
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          cogs: 0,
          margin: 0,
          invoice_count: 0,
        });
      }
      
      const dayData = dailyMap.get(dateKey)!;
      dayData.revenue += inv.total_amount || 0;
      dayData.invoice_count += 1;
    }

    // Fetch COGS
    const allTicketIds = [...new Set(filteredInvoices.map(inv => inv.ticket_id))] as string[];
    if (allTicketIds.length > 0) {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('ticket_id, quantity, unit_price')
        .in('ticket_id', allTicketIds);

      if (partsError) throw partsError;

      const partsByTicket = new Map<string, number>();
      (parts || []).forEach(part => {
        const cost = (partsByTicket.get(part.ticket_id) || 0) + (part.quantity * part.unit_price);
        partsByTicket.set(part.ticket_id, cost);
      });

      filteredInvoices.forEach(inv => {
        if (!inv.created_at) return;
        const dateKey = format(parseISO(inv.created_at), 'yyyy-MM-dd');
        const dayData = dailyMap.get(dateKey);
        if (dayData) {
          dayData.cogs += partsByTicket.get(inv.ticket_id) || 0;
          dayData.margin = dayData.revenue - dayData.cogs;
        }
      });
    }

    const result = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    setDetailData(result);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  const marginPercent = (revenue: number, margin: number) => {
    return revenue > 0 ? ((margin / revenue) * 100).toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Tracker</h2>
          <p className="text-muted-foreground">Daily and monthly financial performance metrics</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPI Cards - Today */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{format(startOfToday(), 'MMM dd, yyyy')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Today's COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayCOGS)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost of goods sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Today's Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marginPercent(todayRevenue, todayMargin)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Month to Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              MTD Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mtdRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Month to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              MTD COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mtdCOGS)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost of goods sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" />
              MTD Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mtdMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marginPercent(mtdRevenue, mtdMargin)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
            <CardDescription>Revenue and COGS trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    try {
                      return format(parseISO(value), 'MMM dd');
                    } catch {
                      return value;
                    }
                  }}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="cogs" stroke="#ef4444" strokeWidth={2} name="COGS" />
                <Line type="monotone" dataKey="margin" stroke="#3b82f6" strokeWidth={2} name="Margin" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (Last 12 Months)</CardTitle>
            <CardDescription>Revenue and COGS by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value, index) => {
                    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthName[value - 1] || value;
                  }}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload as MonthlyFinance;
                      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${monthName[data.month - 1]} ${data.year}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
                <Bar dataKey="margin" fill="#3b82f6" name="Margin" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mechanic">Mechanic</Label>
              <Select value={filters.mechanicId || 'all'} onValueChange={(val) => setFilters(prev => ({ ...prev, mechanicId: val === 'all' ? null : val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All mechanics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mechanics</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={filters.serviceType || 'all'} onValueChange={(val) => setFilters(prev => ({ ...prev, serviceType: val === 'all' ? null : val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="non_standard">Non-Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={filters.paymentMethod || 'all'} onValueChange={(val) => setFilters(prev => ({ ...prev, paymentMethod: val === 'all' ? null : val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters({
                dateFrom: format(subDays(startOfToday(), 30), 'yyyy-MM-dd'),
                dateTo: format(startOfToday(), 'yyyy-MM-dd'),
                mechanicId: null,
                serviceType: null,
                paymentMethod: null,
              })}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Revenue Breakdown</CardTitle>
          <CardDescription>Daily financial summary with drilldown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-right p-2 font-medium">Invoice Count</th>
                  <th className="text-right p-2 font-medium">Revenue</th>
                  <th className="text-right p-2 font-medium">COGS</th>
                  <th className="text-right p-2 font-medium">Gross Margin</th>
                  <th className="text-right p-2 font-medium">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {detailData.length > 0 ? (
                  detailData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{formatDate(row.date)}</td>
                      <td className="p-2 text-right">{row.invoice_count}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(row.revenue)}</td>
                      <td className="p-2 text-right">{formatCurrency(row.cogs)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(row.margin)}</td>
                      <td className="p-2 text-right">
                        <span className={row.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {marginPercent(row.revenue, row.margin)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No data available for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

