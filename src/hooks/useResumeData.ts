import { useState, useCallback, useEffect } from "react";
import { resumeService, type ResumeMap } from "../services/resumeService";

/**
 * Fetches the { en, vi } resume rows. Client-only (browser fetch lifecycle).
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

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return { resumes, loading, error, retry: fetchResumes };
}
