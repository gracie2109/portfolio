import PageShell from "@/components/layout/PageShell";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import Resume from "@/components/sections/Resume";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <PageShell>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Contact />
      <Resume />
      <Footer />
    </PageShell>
  );
}
