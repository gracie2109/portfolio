import PageShell from "@/components/layout/PageShell";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import Resume from "@/components/sections/Resume";
import Footer from "@/components/sections/Footer";
import { getPublicData } from "@/services/publicDataServer";

interface ContactLink {
  id: string;
  href: string;
  label: string;
  data_type?: string;
  icon?: string;
  name?: string;
}

export default async function Home() {
  const contactLinks = await getPublicData<ContactLink>("contacts");

  return (
    <PageShell>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Contact contactLinks={contactLinks} />
        <Resume />
      </main>
      <Footer />
    </PageShell>
  );
}
