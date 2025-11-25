import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Search, Calendar, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import { QuoteForm } from './QuoteForm';
import { QuoteDetail } from './QuoteDetail';

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  vehicle_id: string;
  ticket_id: string | null;
  status: 'open' | 'closed_converted' | 'closed_rejected' | 'expired';
  is_revised: boolean;
  original_quote_id: string | null;
  estimated_cost: number;
  total_amount: number;
  expiration_date: string | null;
  created_at: string;
  customer_name: string;
  vehicle_info: string;
  ticket_number: string | null;
}

export const QuoteList: React.FC = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          customer_id,
          vehicle_id,
          ticket_id,
          status,
          is_revised,
          original_quote_id,
          estimated_cost,
          total_amount,
          expiration_date,
          created_at,
          profiles:customer_id (
            name
          ),
          vehicles:vehicle_id (
            make,
            model,
            year,
            license_plate
          ),
          tickets:ticket_id (
            ticket_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotes = (data || []).map((quote: any) => {
        const profile = Array.isArray(quote.profiles) ? quote.profiles[0] : quote.profiles;
        const vehicle = Array.isArray(quote.vehicles) ? quote.vehicles[0] : quote.vehicles;
        const ticket = quote.tickets ? (Array.isArray(quote.tickets) ? quote.tickets[0] : quote.tickets) : null;

        return {
          id: quote.id,
          quote_number: quote.quote_number,
          customer_id: quote.customer_id,
          vehicle_id: quote.vehicle_id,
          ticket_id: quote.ticket_id,
          status: quote.status,
          is_revised: quote.is_revised,
          original_quote_id: quote.original_quote_id,
          estimated_cost: Number(quote.estimated_cost || 0),
          total_amount: Number(quote.total_amount || 0),
          expiration_date: quote.expiration_date,
          created_at: quote.created_at,
          customer_name: profile?.name || 'Unknown',
          vehicle_info: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate || 'N/A'})` : 'N/A',
          ticket_number: ticket?.ticket_number || null
        };
      });

      setQuotes(formattedQuotes);
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quotes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle_info.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-blue-500">Open</Badge>;
      case 'closed_converted':
        return <Badge variant="default" className="bg-green-500">Converted</Badge>;
      case 'closed_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetail(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowQuoteForm(true);
  };

  const handleQuoteFormClose = () => {
    setShowQuoteForm(false);
    setEditingQuote(null);
    fetchQuotes();
  };

  const handleQuoteDetailClose = () => {
    setShowQuoteDetail(false);
    setSelectedQuote(null);
    fetchQuotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading quotes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quotes & Estimates</h2>
          <p className="text-muted-foreground">Manage repair quotes and estimates</p>
        </div>
        <Button onClick={() => setShowQuoteForm(true)} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by quote number, customer, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed_converted">Converted</SelectItem>
                <SelectItem value="closed_rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first quote to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowQuoteForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quote
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{quote.quote_number}</CardTitle>
                      {quote.is_revised && (
                        <Badge variant="outline" className="text-xs">Revised</Badge>
                      )}
                    </div>
                    <CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                        <span>{quote.customer_name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{quote.vehicle_info}</span>
                        {quote.ticket_number && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>Ticket: {quote.ticket_number}</span>
                          </>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(quote.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Created: {new Date(quote.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {quote.expiration_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Expires: {new Date(quote.expiration_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="text-lg font-semibold">
                      ${quote.total_amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQuote(quote)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    {quote.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuote(quote)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Form Dialog */}
      {showQuoteForm && (
        <QuoteForm
          open={showQuoteForm}
          onClose={handleQuoteFormClose}
          quote={editingQuote || undefined}
        />
      )}

      {/* Quote Detail Dialog */}
      {showQuoteDetail && selectedQuote && (
        <QuoteDetail
          open={showQuoteDetail}
          onClose={handleQuoteDetailClose}
          quoteId={selectedQuote.id}
        />
      )}
    </div>
  );
};

