import { supabase } from "../lib/supabaseClient";

interface GetAllOpts {
  searchText?: string;
}

const getAll = async ({ searchText }: GetAllOpts = {}) => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  let query = supabase
    .from("contact-with-me")
    .select("*, contact_replies(count)")
    .order("created_at", { ascending: false });

  if (searchText) {
    query = query.or(`email.ilike.%${searchText}%,name.ilike.%${searchText}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    reply_count: row.contact_replies?.[0]?.count ?? 0,
  }));
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

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const { data, error } = await supabase.functions.invoke("reply-contact", {
    body: formData,
  });

  if (error) throw error;

  return data;
};

interface ContactReply {
  id: string;
  contact_id: string;
  subject: string;
  message: string;
  attachment_names: string[];
  sent_at: string;
}

const getReplies = async (contactId: string): Promise<ContactReply[]> => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const { data, error } = await supabase
    .from("contact_replies")
    .select("*")
    .eq("contact_id", contactId)
    .order("sent_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const contactWithMeService = {
  getAll,
  replyEmailService,
  getReplies,
};
