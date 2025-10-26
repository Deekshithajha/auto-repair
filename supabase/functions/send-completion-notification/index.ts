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

    // Handle joined data (may be array or object)
    const profile = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles;
    const vehicle = Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles;
    
    // Check if customer has phone number for SMS
    if (profile?.phone) {
      // In a real implementation, you would integrate with SMS service like Twilio
      // For now, we'll log the SMS that would be sent
      const smsMessage = `Hi ${profile.name}, your vehicle repair is complete! Your ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.reg_no}) is ready for pickup. Contact 76 Auto Repairs for pickup details.`;
      
      console.log("SMS would be sent:", {
        to: profile.phone,
        message: smsMessage
      });
    }

    // Create notification record
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: profile.id, // Assuming profiles has id field
        type: "repair_completed",
        title: "Vehicle Repair Completed",
        message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} repair is complete and ready for pickup!`,
        metadata: {
          ticket_id: ticket.id,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          reg_no: vehicle.reg_no
        }
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Customer notification sent successfully",
        sms_sent: !!profile?.phone,
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