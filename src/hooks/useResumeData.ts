import { useState, useCallback } from "react";
import { resumeService, type ResumeMap } from "../services/resumeService";

/**
 * Fetches the { en, vi } resume rows on demand — the resume game is opt-in,
 * so this only loads (and pulls in the Supabase client) once the player
 * actually wins, rather than on every homepage visit.
 */
export function useResumeData() {
  const [resumes, setResumes] = useState<ResumeMap>({ en: null, vi: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resumeMap = await resumeService.getResumes();
      setResumes(resumeMap);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError(err instanceof Error ? err.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  return { resumes, loading, error, retry: fetchResumes, fetchResumes };
}
