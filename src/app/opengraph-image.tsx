import { ImageResponse } from "next/og";
import { PERSON } from "@/lib/site";

export const alt = `${PERSON.nameAscii} (${PERSON.alternateName}) — ${PERSON.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKILLS = ["React", "Next.js", "Vue", "TypeScript", "Node.js"];

// ASCII-only copy: the default OG font has no Vietnamese diacritics.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(147,130,255,0.45), transparent 45%), radial-gradient(circle at 10% 90%, rgba(78,205,196,0.25), transparent 40%)",
          color: "#e8e6f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#4ecdc4" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#4ecdc4" }} />
          Open to new opportunities
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2, color: "#ffffff" }}>
            {PERSON.nameAscii}
          </div>
          <div style={{ fontSize: 44, marginTop: 8, color: "#9382ff" }}>
            {`${PERSON.jobTitle} · aka ${PERSON.alternateName}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {SKILLS.map((skill) => (
            <div
              key={skill}
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                border: "1px solid rgba(147,130,255,0.5)",
                background: "rgba(147,130,255,0.12)",
                fontSize: 26,
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
