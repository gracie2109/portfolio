import { supabase } from "../lib/supabaseClient";

/**
 * Sends the public contact form via the Supabase Edge Function.
 *
 * @param {{ name: string, email: string, message: string }} data
 */
export const sendContact = async (data) => {
  const { error } = await supabase.functions.invoke("send-contact-email", {
    body: data,
  });

  if (error) throw error;
};

export const contactService = { sendContact };
