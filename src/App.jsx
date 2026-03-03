import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "./App.css";

import CustomCursor from "./components/ui/CustomCursor";
import ParticleField from "./components/animation/ParticleField";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import MarqueeText from "./components/ui/MarqueeText";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Experience from "./components/sections/Experience";
import Contact from "./components/sections/Contact";
import Footer from "./components/sections/Footer";
import Resume from "./components/sections/Resume";

export default function App() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="app">
      <CustomCursor />
      <ParticleField />

      {/* Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} />

      <Navbar />
      <Hero />
      {/* <MarqueeText /> */}
      <About />
      <Skills />
      {/* <Projects /> */}
      <Experience />
      <Contact />
      <Resume />
      <Footer />
    </div>
  );
}
