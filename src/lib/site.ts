/**
 * Single source of truth for site-wide SEO facts (canonical URL, owner
 * identity, keywords). Imported by layout metadata, robots, sitemap,
 * the OG image and the JSON-LD block so they never drift apart.
 */

const PRODUCTION_FALLBACK_URL = "https://gracie-phuong-thao.vercel.app";

const resolveSiteUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Set automatically by Vercel for every deployment.
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;

  return PRODUCTION_FALLBACK_URL;
};

export const SITE_URL = resolveSiteUrl();

export const PERSON = {
  name: "Trịnh Phương Thảo",
  nameAscii: "Trinh Phuong Thao",
  alternateName: "Grace",
  jobTitle: "Frontend Developer",
};

export const SITE_NAME = `${PERSON.name} (${PERSON.alternateName}) — Portfolio`;

export const SITE_TITLE = `${PERSON.name} (${PERSON.alternateName}) — ${PERSON.jobTitle} | React, Next.js, Vue`;

export const SITE_DESCRIPTION =
  "Portfolio của Trịnh Phương Thảo (Grace) — Frontend Developer với hơn 4 năm kinh nghiệm React, Next.js, Vue, TypeScript và Node.js. Xem kinh nghiệm, kỹ năng, tải CV và liên hệ tuyển dụng.";

export const SITE_KEYWORDS = [
  "Trịnh Phương Thảo",
  "Phuong Thao Trinh",
  "Grace",
  "Frontend Developer",
  "Lập trình viên Frontend",
  "Fullstack Developer",
  "React Developer",
  "Next.js Developer",
  "Vue Developer",
  "TypeScript",
  "Portfolio",
  "Tuyển dụng Frontend",
  "Việt Nam",
];

export const CORE_SKILLS = [
  "React",
  "Next.js",
  "Vue.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "Supabase",
  "React Native",
];
