export interface ResumeRow {
  name: string;
  link: string;
  [key: string]: unknown;
}

export interface ResumeMap {
  en: ResumeRow | null;
  vi: ResumeRow | null;
}

/**
 * Fetches the resume rows and maps them into { en, vi } by row name.
 * Dynamically imports the Supabase client so it's only pulled into the
 * bundle when a resume is actually requested (the resume game is opt-in).
 */
const getResumes = async (): Promise<ResumeMap> => {
  const { supabase } = await import("../lib/supabaseClient");
  const { data, error } = await supabase.from("resume").select("*");
  if (error) throw error;

  const resumeMap: ResumeMap = { en: null, vi: null };
  data?.forEach((item) => {
    if (item.name === "en" || item.name === "vi") {
      resumeMap[item.name as "en" | "vi"] = item as ResumeRow;
    }
  });
  return resumeMap;
};

export const resumeService = { getResumes };
