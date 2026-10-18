import React from 'react';

export type StatusType = 'done' | 'in-process' | 'in_process' | 'warning' | 'error' | 'canceled' | 'failed' | 'success';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const normStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
  const isDone = normStatus === 'done' || normStatus === 'converti' || normStatus === 'pret' || normStatus === 'success';
  const isError = normStatus === 'error' || normStatus === 'canceled' || normStatus === 'failed' || normStatus === 'echec';
  const isWarning = normStatus === 'warning' || normStatus === 'partial' || normStatus === 'partiel' || normStatus === 'attention';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-card text-xs font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none shrink-0 ${className}`}
    >
      {isDone ? (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#02b282] text-white shrink-0">
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
            <path 
              d="M2.5 6.2L4.6 8.3L9.5 3.5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : isError ? (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-600 text-white shrink-0">
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
            <path 
              d="M3 3L9 9M9 3L3 9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </span>
      ) : isWarning ? (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-500 text-white shrink-0">
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
            <path 
              d="M6 3.5V6.5M6 8.5V9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </span>
      ) : (
        <svg 
          className="w-3.5 h-3.5 text-foreground shrink-0" 
          viewBox="0 0 16 16" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.6" 
          strokeLinecap="round"
        >
          <line x1="8" y1="2" x2="8" y2="4.2" />
          <line x1="8" y1="11.8" x2="8" y2="14" />
          <line x1="2" y1="8" x2="4.2" y2="8" />
          <line x1="11.8" y1="8" x2="14" y2="8" />
          <line x1="3.75" y1="3.75" x2="5.3" y2="5.3" />
          <line x1="10.7" y1="10.7" x2="12.25" y2="12.25" />
          <line x1="3.75" y1="12.25" x2="5.3" y2="10.7" />
          <line x1="10.7" y1="5.3" x2="12.25" y2="3.75" />
        </svg>
      )}
      <span>{label || (isDone ? 'Converti' : isError ? 'Erreur' : isWarning ? 'Partiel' : 'En cours')}</span>
    </span>
  );
}
