import { useState, useCallback, useEffect } from "react";
import { resumeService } from "../services/resumeService";

/**
 * Fetches the { en, vi } resume rows. Client-only (browser fetch lifecycle).
 */
export function useResumeData() {
  const [resumes, setResumes] = useState({ en: null, vi: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resumeMap = await resumeService.getResumes();
      setResumes(resumeMap);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError(err.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return { resumes, loading, error, retry: fetchResumes };
}
