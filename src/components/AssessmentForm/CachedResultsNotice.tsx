import { motion, AnimatePresence } from "motion/react";
import { m } from "@/paraglide/messages";

export function CachedResultsNotice({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cached-results"
          layout="position"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="bg-green-600 text-white rounded-md px-4 py-3 text-sm mt-2"
        >
          {m.cachedResultsNotice()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
