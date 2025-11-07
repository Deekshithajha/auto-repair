import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current date (end of day)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find tickets with reschedule_date that was today and status is not completed
    // and vehicle is not in shop (customer didn't show up)
    const { data: missedTickets, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select(`
        id,
        ticket_number,
        reschedule_date,
        user_id,
        vehicle_id,
        status,
        vehicles:vehicle_id (
          id,
          make,
          model,
          year,
          reg_no
        ),
        profiles:user_id (
          id,
          name,
          phone,
          email
        )
      `)
      .not('reschedule_date', 'is', null)
      .gte('reschedule_date', today.toISOString())
      .lt('reschedule_date', tomorrow.toISOString())
      .neq('status', 'completed')
      .neq('status', 'ready_for_pickup');

    if (fetchError) {
      throw fetchError;
    }

    if (!missedTickets || missedTickets.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No missed appointments found', 
          processed: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const results = [];

    for (const ticket of missedTickets) {
      try {
        // Check if vehicle is in shop
        const { data: vehicle } = await supabaseAdmin
          .from('vehicles')
          .select('location_status')
          .eq('id', ticket.vehicle_id)
          .single();

        // Only auto-reschedule if vehicle is not in shop (customer didn't bring it)
        if (vehicle?.location_status !== 'in_shop') {
          // Calculate next day
          const rescheduleDate = new Date(ticket.reschedule_date);
          const nextDay = new Date(rescheduleDate);
          nextDay.setDate(nextDay.getDate() + 1);

          // Update ticket with new reschedule date
          const { error: updateError } = await supabaseAdmin
            .from('tickets')
            .update({
              reschedule_date: nextDay.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id);

          if (updateError) {
            console.error(`Error updating ticket ${ticket.id}:`, updateError);
            results.push({
              ticket_id: ticket.id,
              success: false,
              error: updateError.message
            });
            continue;
          }

          // Send notification to customer
          const vehicleData = Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles;
          const customerData = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles;

          const { error: notifError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: ticket.user_id,
              type: 'vehicle_reschedule_reminder',
              title: 'Vehicle Rescheduled',
              message: `Your vehicle ${vehicleData?.make} ${vehicleData?.model} has been automatically rescheduled to ${nextDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} as you did not arrive on the scheduled date.`,
              metadata: {
                ticket_id: ticket.id,
                ticket_number: ticket.ticket_number,
                reschedule_date: nextDay.toISOString(),
                reason: 'Customer did not show up on scheduled date'
              }
            });

          if (notifError) {
            console.error(`Error creating notification for ticket ${ticket.id}:`, notifError);
          }

          results.push({
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number,
            customer_name: customerData?.name,
            vehicle: `${vehicleData?.make} ${vehicleData?.model}`,
            old_date: ticket.reschedule_date,
            new_date: nextDay.toISOString(),
            success: true
          });
        } else {
          // Vehicle is in shop, so customer did show up
          results.push({
            ticket_id: ticket.id,
            success: false,
            reason: 'Vehicle is in shop - customer showed up'
          });
        }
      } catch (error: any) {
        console.error(`Error processing ticket ${ticket.id}:`, error);
        results.push({
          ticket_id: ticket.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${missedTickets.length} tickets`,
        processed: successCount,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in auto-reschedule function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

