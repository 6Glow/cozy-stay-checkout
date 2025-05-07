
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
    // Get the URL for debugging
    console.log(`Webhook received with URL: ${req.url}`);
    
    // Log all request headers for debugging
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Request headers:", JSON.stringify(headers));
    
    // Read request body as text first for proper parsing
    const bodyText = await req.text();
    console.log("Raw webhook body:", bodyText);
    
    // Mollie sends form-urlencoded data, not JSON
    const params = new URLSearchParams(bodyText);
    const paymentId = params.get('id');
    
    if (!paymentId) {
      console.error("No payment ID provided in webhook");
      throw new Error("No payment ID provided");
    }

    console.log(`Processing webhook for payment ID: ${paymentId}`);
    
    // Fetch payment details from Mollie
    const payment = await mollieClient.payments.get(paymentId);
    console.log(`Payment status: ${payment.status}`);
    
    // Extract userId from metadata
    const userId = payment.metadata?.userId;
    if (!userId) {
      console.log("No user ID in payment metadata, but continuing anyway");
    }
    
    // Update the booking status in the database
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: payment.status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);
      
    if (error) {
      console.error("Error updating booking:", error);
      throw error;
    }

    // If payment is paid, send confirmation email (can be implemented later)
    if (payment.status === 'paid') {
      console.log(`Payment ${paymentId} is now paid. Sending confirmation email would happen here.`);
      // Future enhancement: send confirmation email
    }
    
    console.log(`Successfully updated booking status to: ${payment.status}`);
    
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
