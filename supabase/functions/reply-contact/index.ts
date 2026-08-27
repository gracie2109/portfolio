import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    console.log("ENV:", Deno.env.get("RESEND_API_KEY"));
    if (!RESEND_API_KEY) {
      return jsonResponse({ error: "RESEND_API_KEY is not configured" }, 500);
    } 

    const formData = await req.formData();

    const contactId = formData.get("contactId") as string;
    const email = formData.get("email") as string;
    const subject = (formData.get("subject") as string) || "Reply from Grace";
    const message = formData.get("message") as string;

    if (!email || !message || !contactId) {
      return jsonResponse(
        { error: "Missing required fields: contactId, email, message" },
        400
      );
    }

    // Collect file attachments
    const attachments: { filename: string; content: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "attachments" && value instanceof File) {
        const buffer = await value.arrayBuffer();
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        );
        attachments.push({
          filename: value.name,
          content: base64,
        });
      }
    }

    // Send email via Resend
    const resendPayload: Record<string, unknown> = {
      from: "Grace <noreply@yourdomain.com>",
      to: email,
      subject,
      html: message,
    };
    if (attachments.length > 0) {
      resendPayload.attachments = attachments;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await res.json();

    if (!res.ok) {
      return jsonResponse(
        { error: resendData?.message || "Failed to send email" },
        res.status
      );
    }

    // Update replied_at in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase
      .from("contact-with-me")
      .update({ replied_at: new Date().toISOString() })
      .eq("id", contactId);

    if (dbError) {
      console.error("DB update error:", dbError.message);
    }

    return jsonResponse({ success: true, id: resendData.id });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});