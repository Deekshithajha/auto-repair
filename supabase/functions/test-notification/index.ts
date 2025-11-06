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

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { ticket_id, channel, to_address } = await req.json();

    if (!ticket_id || !channel || !to_address) {
      throw new Error('Missing required fields: ticket_id, channel, to_address');
    }

    // Get ticket details
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: ticket } = await supabaseAdmin
      .from('tickets')
      .select('ticket_number, description')
      .eq('id', ticket_id)
      .single();

    // Send test message
    const testBody = `Test notification for ticket ${ticket?.ticket_number || ticket_id}`;
    let sent = false;
    let error: string | null = null;

    if (channel === 'email') {
      sent = await sendEmail(to_address, 'Test Notification', testBody);
      if (!sent) error = 'Email sending failed';
    } else if (channel === 'sms') {
      sent = await sendSMS(to_address, testBody);
      if (!sent) error = 'SMS sending failed';
    } else if (channel === 'whatsapp') {
      sent = await sendWhatsApp(to_address, testBody);
      if (!sent) error = 'WhatsApp sending failed';
    } else {
      throw new Error('Invalid channel');
    }

    return new Response(
      JSON.stringify({
        success: sent,
        message: sent ? 'Test notification sent successfully' : 'Failed to send test notification',
        error: error,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: sent ? 200 : 400,
      }
    );
  } catch (error: any) {
    console.error('Error in test-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
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



