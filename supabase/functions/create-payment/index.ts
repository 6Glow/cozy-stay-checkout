
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createMollieClient } from "npm:@mollie/api-client";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mollieClient = createMollieClient({ apiKey: Deno.env.get('MOLLIE_API_KEY') || '' });
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, orderId, description, redirectUrl, items, userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required to create a booking");
    }

    // Create webhook URL for this payment
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Create payment in Mollie
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2) // Mollie expects string amount like "10.00"
      },
      description,
      redirectUrl,
      webhookUrl,
      metadata: { orderId }
    });

    // Create booking records for each room in the order
    for (const item of items) {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          room_id: item.room.id,
          check_in: item.checkIn,
          check_out: item.checkOut,
          guests: item.guests,
          total_price: item.totalPrice,
          payment_id: payment.id,
          status: payment.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (bookingError) {
        console.error('Failed to create booking:', bookingError);
      }
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: payment.getCheckoutUrl(),
        paymentId: payment.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
