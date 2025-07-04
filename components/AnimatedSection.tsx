'use client';

import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  duration?: number;
}

export default function AnimatedSection({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 600
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  const animations = {
    fadeIn: {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    slideUp: {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    slideLeft: {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    slideRight: {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    scaleIn: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    }
  };

  const selectedAnimation = animations[animation];
  
  return (
    <div
      ref={ref}
      className={`
        transition-all ease-out
        ${isVisible ? selectedAnimation.animate : selectedAnimation.initial}
        ${className}
      `}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
