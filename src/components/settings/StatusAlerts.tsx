import { CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface StatusAlertsProps {
  error: string | null;
  success: string | null;
}

export function StatusAlerts({ error, success }: StatusAlertsProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700"
        >
          <XCircle className="size-5 text-red-500 shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700"
        >
          <CheckCircle2 className="size-5 text-green-500 shrink-0" />
          <p className="text-sm">{success}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
