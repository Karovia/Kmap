import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface DocumentsFeedbackProps {
  error: string | null;
  success: string | null;
}

export function DocumentsFeedback({ error, success }: DocumentsFeedbackProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-4"
        >
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-4"
        >
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
