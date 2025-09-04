import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  userName: string;
  userEmail: string;
  userPhone: string;
  seatIds: string[];
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail, userPhone, seatIds, bookingId }: BookingNotificationRequest = await req.json();

    const seatDetails = seatIds.join(", ");

    const emailResponse = await resend.emails.send({
      from: "Theatre Booking <onboarding@resend.dev>",
      to: ["Lokahchandra58@gmail.com"],
      subject: "New Theatre Booking - Tickets Reserved",
      html: `
        <h1>New Theatre Booking Received!</h1>
        <p>A visitor has just reserved tickets on your theatre booking website.</p>
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Customer Name:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Phone:</strong> ${userPhone}</li>
          <li><strong>Reserved Seats:</strong> ${seatDetails}</li>
          <li><strong>Status:</strong> Held (awaiting confirmation)</li>
          <li><strong>Booking Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        
        <p>Please log into your admin panel to approve or refuse this booking.</p>
        
        <p>Best regards,<br>Theatre Booking System</p>
      `,
    });

    console.log("Booking notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);