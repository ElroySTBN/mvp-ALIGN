import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', gradient = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-white/5 
      backdrop-blur-xl transition-all duration-300
      ${gradient ? 'bg-gradient-to-br from-slate-900/80 to-slate-900/40' : 'bg-slate-900/50'}
      hover:border-white/10 hover:shadow-2xl hover:shadow-violet-900/10
      ${className}
    `}>
      {gradient && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-50" />
      )}
      {children}
    </div>
  );
};