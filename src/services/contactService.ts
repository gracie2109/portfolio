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
  const { error } = await supabase.functions.invoke("send-contact-email", {
    body: data,
  });

  if (error) throw error;
};

export const contactService = { sendContact };
