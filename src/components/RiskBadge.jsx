import React from 'react';

const STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  High: 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function RiskBadge({ level, score }) {
  const style = STYLES[level] || STYLES.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level} {typeof score === 'number' ? `· ${score}` : ''}
    </span>
  );
}
