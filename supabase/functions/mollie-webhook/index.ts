
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createMollieClient } from "npm:@mollie/api-client";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const mollieClient = createMollieClient({ 
  apiKey: Deno.env.get('MOLLIE_API_KEY') || '',
  profileId: 'pfl_7BDUsW9geL' // Add profile ID
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the payment ID from the request
    const { id } = await req.json();
    
    if (!id) {
      throw new Error("No payment ID provided");
    }

    console.log(`Processing webhook for payment ID: ${id}`);
    
    // Fetch payment details from Mollie
    const payment = await mollieClient.payments.get(id);
    console.log(`Payment status: ${payment.status}`);
    
    // Extract orderId from metadata
    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      throw new Error("No order ID in payment metadata");
    }
    
    // Update the booking status in the database
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: payment.status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', id);
      
    if (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
