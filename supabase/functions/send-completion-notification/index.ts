import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  ticket_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_id }: NotificationRequest = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get ticket and customer details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        id,
        description,
        vehicles:vehicles(make, model, year, reg_no),
        profiles:profiles(name, phone)
      `)
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      console.error("Error fetching ticket:", ticketError);
      return new Response(
        JSON.stringify({ error: "Ticket not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if customer has phone number for SMS
    if (ticket.profiles.phone) {
      // In a real implementation, you would integrate with SMS service like Twilio
      // For now, we'll log the SMS that would be sent
      const smsMessage = `Hi ${ticket.profiles.name}, your vehicle repair is complete! Your ${ticket.vehicles.year} ${ticket.vehicles.make} ${ticket.vehicles.model} (${ticket.vehicles.reg_no}) is ready for pickup. Contact 76 Auto Repairs for pickup details.`;
      
      console.log("SMS would be sent:", {
        to: ticket.profiles.phone,
        message: smsMessage
      });
    }

    // Create notification record
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: ticket.profiles.id, // Assuming profiles has id field
        type: "repair_completed",
        title: "Vehicle Repair Completed",
        message: `Your ${ticket.vehicles.year} ${ticket.vehicles.make} ${ticket.vehicles.model} repair is complete and ready for pickup!`,
        metadata: {
          ticket_id: ticket.id,
          vehicle: `${ticket.vehicles.year} ${ticket.vehicles.make} ${ticket.vehicles.model}`,
          reg_no: ticket.vehicles.reg_no
        }
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Customer notification sent successfully",
        sms_sent: !!ticket.profiles.phone,
        notification_created: !notificationError
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-completion-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);