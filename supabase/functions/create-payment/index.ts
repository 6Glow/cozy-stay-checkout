
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createMollieClient } from "npm:@mollie/api-client";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mollieClient = createMollieClient({ 
  apiKey: Deno.env.get('MOLLIE_API_KEY') || '',
  profileId: 'pfl_7BDUsW9geL' // Add profile ID
});
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
      console.log("No user ID provided in the request");
      throw new Error("User ID is required to create a booking");
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided for booking");
    }

    console.log("Creating payment with user ID:", userId);
    
    // Create webhook URL for this payment
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Create payment description with dates and room names
    const roomNames = items.map(item => item.room.name).join(', ');
    const enhancedDescription = `Booking for ${roomNames} - ${description || 'Room reservation'}`;

    // Create payment in Mollie
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2) // Mollie expects string amount like "10.00"
      },
      description: enhancedDescription,
      redirectUrl,
      webhookUrl,
      metadata: { orderId, userId, items: JSON.stringify(items.map(item => ({ 
        roomId: item.room.id,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        guests: item.guests
      }))) }
    });

    console.log("Payment created successfully:", payment.id);

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
        // We'll continue even if there's an error, so the user can still make payment
        // Webhook will handle updating the booking status
      } else {
        console.log(`Created booking for room ${item.room.id}`);
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
