import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`glass-card p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 text-white transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
export default Card;
