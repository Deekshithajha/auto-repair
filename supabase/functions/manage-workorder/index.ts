import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkorderRequest {
  action: 'create' | 'update' | 'assign' | 'add_parts' | 'calculate_total';
  workorder_id?: string;
  vehicle_id?: string;
  customer_id?: string;
  description?: string;
  primary_mechanic_id?: string;
  secondary_mechanic_id?: string;
  status?: string;
  parts?: Array<{
    name: string;
    part_code?: string;
    quantity: number;
    unit_price: number;
    tax_percentage: number;
  }>;
  labor_hours?: number;
  labor_rate?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check user role
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['admin', 'employee'].includes(userRole.role)) {
      throw new Error('Insufficient permissions');
    }

    const requestData: WorkorderRequest = await req.json();

    let response;

    switch (requestData.action) {
      case 'create':
        response = await createWorkorder(supabaseClient, user.id, requestData);
        break;
      
      case 'update':
        response = await updateWorkorder(supabaseClient, user.id, requestData);
        break;
      
      case 'assign':
        response = await assignMechanics(supabaseClient, user.id, requestData);
        break;
      
      case 'add_parts':
        response = await addParts(supabaseClient, user.id, requestData);
        break;
      
      case 'calculate_total':
        response = await calculateTotal(supabaseClient, requestData.workorder_id!);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in manage-workorder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 400,
      }
    );
  }
});

async function createWorkorder(supabase: any, userId: string, data: WorkorderRequest) {
  const { data: workorder, error } = await supabase
    .from('tickets')
    .insert({
      user_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      description: data.description,
      status: 'pending',
      primary_mechanic_id: data.primary_mechanic_id,
      secondary_mechanic_id: data.secondary_mechanic_id,
    })
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await supabase.rpc('create_audit_log', {
    actor_id: userId,
    action_type: 'create',
    table_name: 'tickets',
    record_id: workorder.id,
    new_data: workorder,
    log_details: 'Workorder created'
  });

  return { workorder, message: 'Workorder created successfully' };
}

async function updateWorkorder(supabase: any, userId: string, data: WorkorderRequest) {
  const { data: oldWorkorder } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', data.workorder_id)
    .single();

  const { data: workorder, error } = await supabase
    .from('tickets')
    .update({
      status: data.status,
      estimated_completion_date: data.estimated_completion_date,
      primary_mechanic_id: data.primary_mechanic_id,
      secondary_mechanic_id: data.secondary_mechanic_id,
      labor_hours: data.labor_hours,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.workorder_id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await supabase.rpc('create_audit_log', {
    actor_id: userId,
    action_type: 'update',
    table_name: 'tickets',
    record_id: workorder.id,
    old_data: oldWorkorder,
    new_data: workorder,
    log_details: 'Workorder updated'
  });

  return { workorder, message: 'Workorder updated successfully' };
}

async function assignMechanics(supabase: any, userId: string, data: WorkorderRequest) {
  // Check if admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (userRole.role !== 'admin') {
    throw new Error('Only admins can assign mechanics');
  }

  const { data: assignment, error } = await supabase
    .from('ticket_assignments')
    .insert({
      ticket_id: data.workorder_id,
      employee_id: data.primary_mechanic_id,
      admin_id: userId,
      is_auto_assigned: false,
    })
    .select()
    .single();

  if (error) throw error;

  // Update ticket status to assigned
  await supabase
    .from('tickets')
    .update({ status: 'assigned' })
    .eq('id', data.workorder_id);

  return { assignment, message: 'Mechanic assigned successfully' };
}

async function addParts(supabase: any, userId: string, data: WorkorderRequest) {
  const parts = data.parts!.map(part => ({
    ticket_id: data.workorder_id,
    name: part.name,
    part_code: part.part_code,
    quantity: part.quantity,
    unit_price: part.unit_price,
    tax_percentage: part.tax_percentage,
    uploaded_by: userId,
  }));

  const { data: insertedParts, error } = await supabase
    .from('parts')
    .insert(parts)
    .select();

  if (error) throw error;

  // Recalculate workorder total
  await calculateTotal(supabase, data.workorder_id!);

  return { parts: insertedParts, message: 'Parts added successfully' };
}

async function calculateTotal(supabase: any, workorderId: string) {
  // Get all parts for this workorder
  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .eq('ticket_id', workorderId);

  // Get workorder labor
  const { data: workorder } = await supabase
    .from('tickets')
    .select('labor_hours, labor_cost')
    .eq('id', workorderId)
    .single();

  // Calculate parts total (with tax)
  let partsSubtotal = 0;
  let partsTax = 0;
  
  parts?.forEach(part => {
    const partTotal = part.quantity * part.unit_price;
    partsSubtotal += partTotal;
    partsTax += partTotal * (part.tax_percentage / 100);
  });

  const partsCost = partsSubtotal + partsTax;

  // Labor is not taxed
  const laborCost = workorder?.labor_cost || 0;

  // Total
  const totalAmount = partsCost + laborCost;

  // Update workorder
  const { data: updated, error } = await supabase
    .from('tickets')
    .update({
      parts_cost: partsCost,
      labor_cost: laborCost,
      tax_amount: partsTax,
      total_amount: totalAmount,
    })
    .eq('id', workorderId)
    .select()
    .single();

  if (error) throw error;

  return {
    workorder: updated,
    breakdown: {
      parts_subtotal: partsSubtotal,
      parts_tax: partsTax,
      parts_total: partsCost,
      labor_total: laborCost,
      total: totalAmount,
    },
  };
}
