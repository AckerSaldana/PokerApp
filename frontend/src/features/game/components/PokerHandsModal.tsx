import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PixelCard } from '@/components/effects/PixelCard';
import type { Suit, Value } from '@/components/effects/pixelCardTexture';

interface PokerHandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HandCard {
  suit: Suit;
  value: Value;
}

const HANDS: { name: string; description: string; cards: HandCard[] }[] = [
  {
    name: 'Royal Flush',
    description: 'A, K, Q, J, 10 of the same suit',
    cards: [
      { suit: 'spades', value: 'A' },
      { suit: 'spades', value: 'K' },
      { suit: 'spades', value: 'Q' },
      { suit: 'spades', value: 'J' },
      { suit: 'spades', value: '10' },
    ],
  },
  {
    name: 'Straight Flush',
    description: 'Five consecutive cards of the same suit',
    cards: [
      { suit: 'hearts', value: '9' },
      { suit: 'hearts', value: '8' },
      { suit: 'hearts', value: '7' },
      { suit: 'hearts', value: '6' },
      { suit: 'hearts', value: '5' },
    ],
  },
  {
    name: 'Four of a Kind',
    description: 'Four cards of the same rank',
    cards: [
      { suit: 'spades', value: 'K' },
      { suit: 'hearts', value: 'K' },
      { suit: 'diamonds', value: 'K' },
      { suit: 'clubs', value: 'K' },
      { suit: 'spades', value: '2' },
    ],
  },
  {
    name: 'Full House',
    description: 'Three of a kind plus a pair',
    cards: [
      { suit: 'spades', value: 'J' },
      { suit: 'hearts', value: 'J' },
      { suit: 'diamonds', value: 'J' },
      { suit: 'clubs', value: '8' },
      { suit: 'spades', value: '8' },
    ],
  },
  {
    name: 'Flush',
    description: 'Five cards of the same suit',
    cards: [
      { suit: 'diamonds', value: 'A' },
      { suit: 'diamonds', value: 'J' },
      { suit: 'diamonds', value: '8' },
      { suit: 'diamonds', value: '6' },
      { suit: 'diamonds', value: '2' },
    ],
  },
  {
    name: 'Straight',
    description: 'Five consecutive cards of any suit',
    cards: [
      { suit: 'spades', value: '10' },
      { suit: 'hearts', value: '9' },
      { suit: 'diamonds', value: '8' },
      { suit: 'clubs', value: '7' },
      { suit: 'spades', value: '6' },
    ],
  },
  {
    name: 'Three of a Kind',
    description: 'Three cards of the same rank',
    cards: [
      { suit: 'spades', value: 'Q' },
      { suit: 'hearts', value: 'Q' },
      { suit: 'diamonds', value: 'Q' },
      { suit: 'clubs', value: '7' },
      { suit: 'spades', value: '3' },
    ],
  },
  {
    name: 'Two Pair',
    description: 'Two different pairs',
    cards: [
      { suit: 'spades', value: '10' },
      { suit: 'hearts', value: '10' },
      { suit: 'diamonds', value: '5' },
      { suit: 'clubs', value: '5' },
      { suit: 'spades', value: 'A' },
    ],
  },
  {
    name: 'One Pair',
    description: 'Two cards of the same rank',
    cards: [
      { suit: 'spades', value: '9' },
      { suit: 'hearts', value: '9' },
      { suit: 'diamonds', value: 'A' },
      { suit: 'clubs', value: '7' },
      { suit: 'spades', value: '4' },
    ],
  },
  {
    name: 'High Card',
    description: 'No combination, highest card wins',
    cards: [
      { suit: 'spades', value: 'A' },
      { suit: 'hearts', value: 'J' },
      { suit: 'diamonds', value: '8' },
      { suit: 'clubs', value: '5' },
      { suit: 'spades', value: '2' },
    ],
  },
];

const FAN_ANGLES = [-8, -4, 0, 4, 8];

export function PokerHandsModal({ isOpen, onClose }: PokerHandsModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transform-gpu"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] transform-gpu bg-zinc-900 rounded-t-3xl border-t border-zinc-800 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 shrink-0">
              <h2 className="text-xl font-bold text-white">Poker Hands</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 pb-28 space-y-4">
              {HANDS.map((hand, index) => (
                <div
                  key={hand.name}
                  className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-md bg-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-zinc-300">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{hand.name}</p>
                      <p className="text-zinc-500 text-xs">{hand.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-center items-end gap-0 py-2" style={{ perspective: 400 }}>
                    {hand.cards.map((card, i) => (
                      <div key={i} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                        <PixelCard
                          suit={card.suit}
                          value={card.value}
                          rotateZ={FAN_ANGLES[i]}
                          size={38}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
