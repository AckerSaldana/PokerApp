import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sheetVariants, backdropVariants } from '@/components/animations/variants';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Sheet({ isOpen, onClose, children, className }: SheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-[70]',
              'pb-safe max-h-[85vh] overflow-hidden',
              className
            )}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-2rem)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
