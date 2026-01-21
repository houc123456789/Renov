import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'neutral';
  className?: string;
}

export default function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    green: 'bg-accent-green-dim text-accent-green border-accent-green/30',
    red: 'bg-accent-red-dim text-accent-red border-accent-red/30',
    neutral: 'bg-bg-tertiary text-text-secondary border-border',
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
