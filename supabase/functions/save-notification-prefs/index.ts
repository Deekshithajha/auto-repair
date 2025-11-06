import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPrefsRequest {
  ticket_id: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  primary: 'email' | 'sms' | 'whatsapp';
  comms_opt_in: boolean;
  language?: string;
  timezone?: string;
  preferred_pickup_at: string; // ISO8601
  email?: string;
  phone?: string;
  whatsapp_number?: string;
}

serve(async (req) => {
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: NotificationPrefsRequest = await req.json();

    // Validate required fields
    if (!requestData.ticket_id || !requestData.channels || !requestData.primary || 
        !requestData.preferred_pickup_at) {
      throw new Error('Missing required fields');
    }

    if (!requestData.channels.includes(requestData.primary)) {
      throw new Error('Primary channel must be in selected channels');
    }

    // Get ticket and customer info
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tickets')
      .select('*, user_id, vehicle_id')
      .eq('id', requestData.ticket_id)
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found');
    }

    // Get or create customer profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', ticket.user_id)
      .single();

    // Upsert customer_profiles
    const customerProfileData: any = {
      user_id: ticket.user_id,
      profile_id: ticket.user_id,
      full_name: profile?.name || '',
      email: requestData.email || profile?.email || '',
      phone: requestData.phone || profile?.phone || '',
      timezone: requestData.timezone || 'Asia/Kolkata',
      language: requestData.language || 'en',
      comms_opt_in: requestData.comms_opt_in,
      preferred_channel: requestData.primary,
      whatsapp_number: requestData.whatsapp_number || null,
    };

    const { data: customerProfile, error: cpError } = await supabaseClient
      .from('customer_profiles')
      .upsert(customerProfileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (cpError) {
      // Try insert if upsert fails
      const { data: cpData, error: cpInsertError } = await supabaseClient
        .from('customer_profiles')
        .insert(customerProfileData)
        .select()
        .single();

      if (cpInsertError) {
        console.error('Error creating customer profile:', cpInsertError);
        // Continue anyway - might already exist
      }
    }

    // Update ticket with notification prefs and preferred_pickup_at
    const notificationPrefs = {
      channels: requestData.channels,
      primary: requestData.primary,
      language: requestData.language || 'en',
      timezone: requestData.timezone || 'Asia/Kolkata',
      comms_opt_in: requestData.comms_opt_in,
    };

    const { error: ticketUpdateError } = await supabaseClient
      .from('tickets')
      .update({
        notification_prefs: notificationPrefs,
        preferred_pickup_at: requestData.preferred_pickup_at,
      })
      .eq('id', requestData.ticket_id);

    if (ticketUpdateError) {
      throw ticketUpdateError;
    }

    // Create confirmation notification (send now)
    const confirmationNotification = {
      ticket_id: requestData.ticket_id,
      customer_id: customerProfile?.id || null,
      channel: requestData.primary,
      type: 'confirm',
      status: requestData.comms_opt_in ? 'queued' : 'skipped',
      to_address: requestData.primary === 'email' 
        ? (requestData.email || profile?.email || '')
        : (requestData.primary === 'sms' 
          ? (requestData.phone || profile?.phone || '')
          : (requestData.whatsapp_number || profile?.phone || '')),
      subject: `Your ticket ${ticket.ticket_number || requestData.ticket_id} — preferences confirmed`,
      body: '', // Will be filled by template
      send_at: new Date().toISOString(),
    };

    const { data: confirmNotif, error: confirmError } = await supabaseClient
      .from('notifications')
      .insert(confirmationNotification)
      .select()
      .single();

    // Create reminder notification (2 hours before pickup)
    const pickupDate = new Date(requestData.preferred_pickup_at);
    const reminderDate = new Date(pickupDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

    const reminderNotification = {
      ticket_id: requestData.ticket_id,
      customer_id: customerProfile?.id || null,
      channel: requestData.primary,
      type: 'reminder',
      status: requestData.comms_opt_in && reminderDate > new Date() ? 'queued' : 'skipped',
      to_address: confirmationNotification.to_address,
      subject: `Reminder: Pickup at ${pickupDate.toLocaleString()} for ticket ${ticket.ticket_number || requestData.ticket_id}`,
      body: '',
      send_at: reminderDate.toISOString(),
    };

    const { error: reminderError } = await supabaseClient
      .from('notifications')
      .insert(reminderNotification);

    if (reminderError) {
      console.error('Error creating reminder notification:', reminderError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification preferences saved',
        customer_profile: customerProfile,
        confirmation_notification: confirmNotif,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in save-notification-prefs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 403 : 400,
      }
    );
  }
});



