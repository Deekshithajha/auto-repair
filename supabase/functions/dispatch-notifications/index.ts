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
    // Service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get due notifications
    const { data: notifications, error: fetchError } = await supabaseAdmin
      .from('notifications_due')
      .select('*')
      .limit(100); // Process in batches

    if (fetchError) {
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to process', processed: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const results = [];
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:5173';

    for (const notif of notifications) {
      try {
        // Get ticket details for template
        const { data: ticket } = await supabaseAdmin
          .from('tickets')
          .select('ticket_number, description, preferred_pickup_at, notification_prefs')
          .eq('id', notif.ticket_id)
          .single();

        // Get customer profile for contact info
        const { data: customerProfile } = await supabaseAdmin
          .from('customer_profiles')
          .select('*')
          .eq('id', notif.customer_id)
          .single();

        // Skip if customer opted out
        if (customerProfile && !customerProfile.comms_opt_in) {
          await supabaseAdmin
            .from('notifications')
            .update({ status: 'skipped', error: 'Customer opted out' })
            .eq('id', notif.id);
          results.push({ id: notif.id, status: 'skipped', reason: 'opted_out' });
          continue;
        }

        // Generate message body based on type
        let body = '';
        let subject = notif.subject || '';

        if (notif.type === 'confirm') {
          const pickupTime = ticket?.preferred_pickup_at 
            ? new Date(ticket.preferred_pickup_at).toLocaleString(customerProfile?.language || 'en', {
                timeZone: customerProfile?.timezone || 'Asia/Kolkata',
              })
            : 'TBD';
          
          body = `Hello ${customerProfile?.full_name || 'Customer'},

Your service ticket ${ticket?.ticket_number || notif.ticket_id} has been confirmed.

Selected Services: ${ticket?.description || 'N/A'}
Estimated Pickup Time: ${pickupTime}

Track your ticket progress: ${appBaseUrl}/tickets/${notif.ticket_id}

Thank you for choosing our service!`;
        } else if (notif.type === 'reminder') {
          const pickupTime = ticket?.preferred_pickup_at 
            ? new Date(ticket.preferred_pickup_at).toLocaleString(customerProfile?.language || 'en', {
                timeZone: customerProfile?.timezone || 'Asia/Kolkata',
              })
            : 'TBD';
          
          body = `Reminder: Your vehicle is ready for pickup!

Ticket: ${ticket?.ticket_number || notif.ticket_id}
Pickup Time: ${pickupTime}

Visit us to collect your vehicle.
${appBaseUrl}/tickets/${notif.ticket_id}`;
        }

        // Send notification based on channel
        let sent = false;
        let error: string | null = null;

        if (notif.channel === 'email') {
          sent = await sendEmail(notif.to_address || '', subject, body);
          if (!sent) error = 'Email sending failed';
        } else if (notif.channel === 'sms') {
          sent = await sendSMS(notif.to_address || '', body);
          if (!sent) error = 'SMS sending failed';
        } else if (notif.channel === 'whatsapp') {
          sent = await sendWhatsApp(notif.to_address || '', body);
          if (!sent) error = 'WhatsApp sending failed';
        }

        // Update notification status
        await supabaseAdmin
          .from('notifications')
          .update({
            status: sent ? 'sent' : 'failed',
            sent_at: sent ? new Date().toISOString() : null,
            error: error,
            body: body,
          })
          .eq('id', notif.id);

        results.push({ id: notif.id, status: sent ? 'sent' : 'failed', error });
      } catch (err: any) {
        console.error(`Error processing notification ${notif.id}:`, err);
        await supabaseAdmin
          .from('notifications')
          .update({ status: 'failed', error: err.message })
          .eq('id', notif.id);
        results.push({ id: notif.id, status: 'failed', error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        processed: notifications.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in dispatch-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AutoRepair <noreply@autorepair.com>',
        to: [to],
        subject: subject,
        html: body.replace(/\n/g, '<br>'),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_SMS_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams({
      From: fromNumber,
      To: to,
      Body: body,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const whatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

  if (!accountSid || !authToken || !whatsappNumber) {
    console.error('Twilio WhatsApp credentials not configured');
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams({
      From: whatsappNumber,
      To: `whatsapp:${to}`,
      Body: body,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

