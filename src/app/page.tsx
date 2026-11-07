import PageShell from "@/components/layout/PageShell";
import Navbar from "@/components/sections/Navbar";
import Hero, { type HeroLink } from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Resume from "@/components/sections/Resume";
import Footer from "@/components/sections/Footer";
import StructuredData from "@/components/seo/StructuredData";
import { getPublicData } from "@/services/publicDataServer";
import { getExperienceYears, type ExperienceRange } from "@/utils/experienceYears";

interface ContactLink {
  id: string;
  href: string;
  label: string;
  data_type?: string;
  icon?: string;
  name?: string;
}

interface ExperienceRow extends ExperienceRange {
  company?: string;
}

/* Contact rows shown as quick links under the hero CTA, in this order. */
const HERO_LINK_KEYS = ["linkedin", "github", "email"];

const contactKey = (link: ContactLink) => (link.label ?? link.name ?? "").toLowerCase();

export default async function Home() {
  const [contactLinks, experiences, projects] = await Promise.all([
    getPublicData<ContactLink>("contacts"),
    getPublicData<ExperienceRow>("experiences", { orderBy: "start_time", ascending: false }),
    getPublicData<{ id: string }>("projects"),
  ]);
  const hasProjects = projects.length > 0;
  const experienceYears = getExperienceYears(experiences);

  const heroLinks: HeroLink[] = HERO_LINK_KEYS.flatMap((key) => {
    const link = contactLinks.find((item) => contactKey(item) === key);
    return link ? [{ href: link.href, label: link.label }] : [];
  });

  const currentJob = experiences.find((exp) => !exp.end_time);

  return (
    <PageShell>
      <StructuredData
        sameAs={contactLinks.map((link) => link.href).filter((href) => href.startsWith("http"))}
        email={contactLinks.find((link) => link.href.startsWith("mailto:"))?.href.replace("mailto:", "")}
        currentCompany={currentJob?.company}
      />
      <Navbar showProjects={hasProjects} />
      <main>
        <Hero experienceYears={experienceYears} links={heroLinks} />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact contactLinks={contactLinks} />
        <Resume />
      </main>
      <Footer />
    </PageShell>
  );
}
