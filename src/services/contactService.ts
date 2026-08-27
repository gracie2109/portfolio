import { supabase } from "../lib/supabaseClient";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Sends the public contact form via the Supabase Edge Function.
 */
export const sendContact = async (data: ContactFormData) => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const { error } = await supabase.functions.invoke("send-contact-email", {
    body: data,
  });

  if (error) throw error;
};

export const contactService = { sendContact };
