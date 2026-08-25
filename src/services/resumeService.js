import { supabase } from "../lib/supabaseClient";

/**
 * Fetches the resume rows and maps them into { en, vi } by row name.
 */
const getResumes = async () => {
  const { data, error } = await supabase.from("resume").select("*");
  if (error) throw error;

  const resumeMap = { en: null, vi: null };
  data?.forEach((item) => {
    if (item.name === "en" || item.name === "vi") {
      resumeMap[item.name] = item;
    }
  });
  return resumeMap;
};

export const resumeService = { getResumes };
