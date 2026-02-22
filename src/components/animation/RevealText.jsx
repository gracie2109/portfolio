import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function RevealText({ children, className, delay = 0, alwaysAnimate = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3, margin: "-40px" });
  const shouldAnimate = alwaysAnimate || isInView;

  return (
    <div ref={ref} className="reveal-wrap">
      <motion.div
        className={className}
        initial={{ y: "110%", opacity: 0 }}
        animate={shouldAnimate ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
        transition={
          shouldAnimate
            ? { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.4, delay: 0, ease: "easeIn" }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
