import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:-translate-y-1 hover:border-accent-green/50 hover:shadow-xl hover:shadow-accent-green/10' : '';

  return (
    <div
      className={`bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-200 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
