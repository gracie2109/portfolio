import { supabase } from "../lib/supabaseClient";

const getAll = async ({ searchText } = {}) => {
  let query = supabase
    .from("contact-with-me")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchText) {
    query = query.or(`email.ilike.%${searchText}%,name.ilike.%${searchText}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
};

/**
 * Reply to a contact email via the Supabase Edge Function.
 *
 * @param {object} params
 * @param {string} params.contactId  — row id in "contact-with-me"
 * @param {string} params.email      — recipient email
 * @param {string} params.subject    — email subject
 * @param {string} params.message    — HTML body
 * @param {File[]} [params.attachments] — optional file attachments
 */
export const replyEmailService = async ({
  contactId,
  email,
  subject,
  message,
  attachments = [],
}) => {
  const formData = new FormData();
  formData.append("contactId", contactId);
  formData.append("email", email);
  formData.append("subject", subject);
  formData.append("message", message);
  attachments.forEach((file) => formData.append("attachments", file));

  const { data, error } = await supabase.functions.invoke("reply-contact", {
    body: formData,
  });

  if (error) throw error;

  return data;
};

export const contactWithMeService = {
  getAll,
  replyEmailService,
};