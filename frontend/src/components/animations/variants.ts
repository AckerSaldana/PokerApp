export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 },
  },
} as any;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
} as any;

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as any;

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
} as any;

export const chipPulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
} as any;

export const numberChange = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
} as any;

export const sheetVariants = {
  initial: { y: '100%' },
  animate: {
    y: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.2 },
  },
} as any;

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as any;

// ========================================
// PREMIUM ANIMATIONS
// ========================================

// Chip toss animation for balance changes
export const chipToss = {
  initial: {
    y: -50,
    opacity: 0,
    rotateX: 180,
    scale: 0.5
  },
  animate: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      mass: 1,
    },
  },
} as any;

// Glow pulse for premium elements
export const glowPulse = {
  initial: {
    boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
  },
  animate: {
    boxShadow: [
      '0 0 20px rgba(16, 185, 129, 0.2)',
      '0 0 40px rgba(16, 185, 129, 0.4)',
      '0 0 20px rgba(16, 185, 129, 0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    },
  },
} as any;

// Card reveal for leaderboard items (3D flip)
export const cardReveal = {
  initial: {
    rotateY: 90,
    opacity: 0,
    scale: 0.8
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    },
  },
} as any;

// Trophy bounce for rankings
export const trophyBounce = {
  initial: { y: 0 },
  animate: {
    y: [-5, 0, -5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    },
  },
} as any;

// Stagger with depth (3D cascade effect)
export const staggerDepth = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
} as any;

export const staggerDepthItem = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
} as any;

// Hero entrance with blur
export const heroEntrance = {
  initial: {
    opacity: 0,
    y: 30,
    filter: 'blur(10px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
} as any;

// Number blur transition
export const numberBlur = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(8px)',
    transition: { duration: 0.2 },
  },
} as any;

// Podium reveal for top 3
export const podiumReveal = {
  initial: {
    y: 100,
    opacity: 0,
    scale: 0.8
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
} as any;

// Float with rotation (for decorative elements)
export const floatRotate = {
  initial: {
    y: 0,
    rotate: 0
  },
  animate: {
    y: [-10, 10, -10],
    rotate: [-5, 5, -5],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
} as any;

// Tab pill animation
export const tabPill = {
  initial: false,
  animate: {
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
} as any;

// Success celebration
export const successPop = {
  initial: {
    scale: 0,
    rotate: -180
  },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
} as any;

// Particle fall (for confetti/chips)
export const particleFall = (delay: number, startX: number) => ({
  initial: {
    x: startX,
    y: -20,
    rotate: 0,
    opacity: 1
  },
  animate: {
    y: '100vh',
    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
    opacity: 0,
    transition: {
      duration: 2 + Math.random(),
      delay,
      ease: 'easeIn',
    },
  },
});

// Hover lift effect
export const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },
  whileTap: {
    scale: 0.98,
    y: 0
  },
} as any;

// Button press
export const buttonPress = {
  whileHover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },
  whileTap: {
    scale: 0.98,
    y: 0
  },
} as any;
