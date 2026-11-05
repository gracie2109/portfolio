import { CORE_SKILLS, PERSON, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * schema.org JSON-LD (ProfilePage + Person + WebSite) so search engines can
 * show a rich result for the owner's name.
 */
export default function StructuredData({
  sameAs,
  email,
  currentCompany,
}: {
  sameAs: string[];
  email?: string;
  currentCompany?: string;
}) {
  const personId = `${SITE_URL}/#person`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: PERSON.name,
        alternateName: [PERSON.alternateName, PERSON.nameAscii],
        jobTitle: PERSON.jobTitle,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        ...(email ? { email: `mailto:${email}` } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(currentCompany ? { worksFor: { "@type": "Organization", name: currentCompany } } : {}),
        knowsAbout: CORE_SKILLS,
        knowsLanguage: ["vi", "en"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "vi-VN",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "vi-VN",
        mainEntity: { "@id": personId },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: escape "<" so no "</script>" breakout.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
