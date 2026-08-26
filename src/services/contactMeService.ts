import { supabase } from "../lib/supabaseClient";

interface GetAllOpts {
  searchText?: string;
}

const getAll = async ({ searchText }: GetAllOpts = {}) => {
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

interface ReplyEmailParams {
  contactId: string;
  email: string;
  subject: string;
  message: string;
  attachments?: File[];
}

/**
 * Reply to a contact email via the Supabase Edge Function.
 */
export const replyEmailService = async ({
  contactId,
  email,
  subject,
  message,
  attachments = [],
}: ReplyEmailParams) => {
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
