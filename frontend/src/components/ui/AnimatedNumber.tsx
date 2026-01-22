import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  formatFn?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  className,
  duration = 0.8,
  formatFn = (v) => v.toLocaleString()
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);

      // Animate the number change
      const startValue = prevValue.current;
      const endValue = value;
      const diff = endValue - startValue;
      const startTime = Date.now();
      const animDuration = duration * 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animDuration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + diff * eased);

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
      prevValue.current = value;
    }
  }, [value, duration]);

  const formattedValue = formatFn(displayValue);
  const digits = formattedValue.split('');

  return (
    <span className={cn("inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="popLayout">
        {digits.map((digit, index) => (
          <motion.span
            key={`${index}-${digit}`}
            initial={{ y: 20, opacity: 0, rotateX: -90 }}
            animate={{
              y: 0,
              opacity: 1,
              rotateX: 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.02
              }
            }}
            exit={{
              y: -20,
              opacity: 0,
              rotateX: 90,
              transition: { duration: 0.15 }
            }}
            className="inline-block"
            style={{ transformOrigin: 'center bottom' }}
          >
            {digit}
          </motion.span>
        ))}
      </AnimatePresence>
      {isAnimating && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
          }}
        />
      )}
    </span>
  );
}

// Simpler version for large numbers with counting effect
interface CountingNumberProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatFn?: (value: number) => string;
}

export function CountingNumber({
  value,
  className,
  duration = 1,
  prefix = '',
  suffix = '',
  formatFn
}: CountingNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const diff = endValue - startValue;
    const startTime = Date.now();
    const animDuration = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animDuration, 1);

      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + diff * eased);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value, duration]);

  const formattedValue = formatFn ? formatFn(displayValue) : displayValue.toLocaleString();

  return (
    <motion.span
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.3 }}
      key={value}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}
