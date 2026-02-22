import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/useLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <motion.div
        className="footer-inner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3, margin: "-30px" }}
        transition={{ duration: 1 }}
      >
        <p>{t.footer.line1}</p>
        <p className="footer-year">© {new Date().getFullYear()}</p>
      </motion.div>
    </footer>
  );
}
