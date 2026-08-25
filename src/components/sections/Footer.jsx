import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <motion.div
        className="footer-inner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3, margin: "-30px" }}
        transition={{ duration: 1 }}
      >
        <p>{t("footer.line1")}</p>
        <p className="footer-year">© {new Date().getFullYear()}</p>
      </motion.div>
    </footer>
  );
}
