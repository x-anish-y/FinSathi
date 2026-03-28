'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  distance = 30,
  duration = 0.6,
  className,
  once = true,
  spring = true,
}) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: { x: 0, y: 0 },
  };

  const hiddenState = {
    opacity: 0,
    ...directions[direction],
  };

  const visibleState = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  const transition = spring
    ? {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        mass: 0.8,
        delay,
        duration: undefined, // Let spring physics handle duration
      }
    : {
        type: 'tween',
        ease: [0.22, 1, 0.36, 1],
        duration,
        delay,
      };

  return (
    <motion.div
      initial={hiddenState}
      whileInView={visibleState}
      viewport={{ once, margin: '-50px' }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
