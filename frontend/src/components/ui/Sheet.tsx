import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sheetVariants, backdropVariants } from '@/components/animations/variants';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Sheet({ isOpen, onClose, children, className }: SheetProps) {
  const y = useMotionValue(0);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transform-gpu"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-[9999] transform-gpu',
              'pb-safe max-h-[85vh] overflow-hidden flex flex-col',
              className
            )}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ y }}
          >
            {/* Drag Handle Area - only this area triggers drag-to-close */}
            <motion.div
              className="flex-shrink-0 cursor-grab active:cursor-grabbing px-4 pt-3 pb-4"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ y }}
            >
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto" />
            </motion.div>

            {/* Scrollable Content Area - no drag interference */}
            <div
              className="flex-1 px-4 pb-4 overflow-y-auto"
              style={{
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
