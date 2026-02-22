import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedName({ text, delay = 0.5 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3, margin: "-40px" });
  const letters = text.split("");

  const container = {
    hidden: {
      transition: { staggerChildren: 0.02, staggerDirection: -1 },
    },
    visible: {
      transition: { staggerChildren: 0.04, delayChildren: delay },
    },
  };

  const child = {
    hidden: {
      y: 80,
      opacity: 0,
      rotateX: -90,
      scale: 0.5,
      filter: "blur(10px)",
      transition: { duration: 0.3, ease: "easeIn" },
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 150, damping: 12, mass: 0.8 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="hero-name"
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", perspective: "800px" }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={child}
          className="hero-letter"
          whileHover={{
            scale: 1.2,
            color: "#9382ff",
            textShadow: "0 0 40px rgba(147, 130, 255, 0.8), 0 0 80px rgba(147, 130, 255, 0.4)",
            transition: { duration: 0.2 },
          }}
          style={{ display: "inline-block", whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
