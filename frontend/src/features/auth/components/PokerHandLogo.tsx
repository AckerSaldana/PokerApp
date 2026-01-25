import { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { PixelCard } from '@/components/effects/PixelCard';
import type { Suit, Value } from '@/components/effects/pixelCardTexture';

const CARDS = [
  { suit: 'spades' as Suit, value: '10' as Value, rotate: -24, targetX: -40 },
  { suit: 'spades' as Suit, value: 'J' as Value, rotate: -12, targetX: -20 },
  { suit: 'spades' as Suit, value: 'Q' as Value, rotate: 0, targetX: 0 },
  { suit: 'spades' as Suit, value: 'K' as Value, rotate: 12, targetX: 20 },
  { suit: 'spades' as Suit, value: 'A' as Value, rotate: 24, targetX: 40 },
];

const DEAL_STAGGER = 0.13;
const SETTLE_PAUSE = 400;
const IDLE_DURATION = 5;
const EXPO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function PokerHandLogo() {
  const [scope, animate] = useAnimate();
  const idleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function sequence() {
      // Phase 1: Deal each card from stacked center to fan position
      const dealPromises = CARDS.map((card, i) =>
        animate(
          `.deal-card-${i}`,
          {
            x: card.targetX,
            y: [20, -8, 0],
            opacity: 1,
            scale: 1,
          },
          {
            duration: 0.6,
            ease: EXPO_EASE,
            delay: 0.3 + i * DEAL_STAGGER,
          }
        )
      );

      // Wait for the last card to finish dealing
      await dealPromises[dealPromises.length - 1];
      if (cancelled) return;

      // Phase 2: Settle pause
      await new Promise(resolve => setTimeout(resolve, SETTLE_PAUSE));
      if (cancelled) return;

      // Phase 3: Idle sway on the container
      if (idleRef.current) {
        animate(
          idleRef.current,
          {
            y: [0, -2.5, 0, 2, 0],
            rotate: [0, -1.2, 0, 1, 0],
          },
          {
            duration: IDLE_DURATION,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 0.75, 1],
          }
        );
      }
    }

    sequence();

    return () => { cancelled = true; };
  }, [animate]);

  const glowDelay = 0.3 + (CARDS.length - 1) * DEAL_STAGGER + 0.2;

  return (
    <div className="relative flex items-end justify-center h-28 mb-6">
      {/* Glow effect - fades in as last cards land */}
      <motion.div
        className="absolute bottom-0 w-40 h-12 bg-[var(--color-gold-500)]/20 blur-xl rounded-full"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 0.8, delay: glowDelay, ease: EXPO_EASE }}
      />

      {/* Idle wrapper - sways as a unit */}
      <motion.div
        ref={idleRef}
        className="relative"
        style={{ width: 140, height: 70 }}
      >
        {/* Deal scope - useAnimate targets children */}
        <div ref={scope} className="absolute inset-0">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              className={`deal-card-${i} absolute`}
              style={{ left: '50%', bottom: 0, marginLeft: -20 }}
              initial={{ x: 0, y: 20, opacity: 0, scale: 0.85 }}
            >
              <PixelCard suit={card.suit} value={card.value} rotateZ={card.rotate} size={40} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
