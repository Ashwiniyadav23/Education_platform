import React from 'react';

const LABELS = {
  attendance: 'Attendance',
  gradetrend: 'Grade Trend',
  gradeaverage: 'Grade Average',
  engagement: 'Engagement',
  submissionRate: 'Submission Rate',
};

export default function RiskFactorBar({ factor }) {
  const pct = Math.round((factor.contribution / (factor.weight * 100)) * 100);
  const barColor =
    pct >= 65 ? 'bg-red-500' : pct >= 35 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{LABELS[factor.name] || factor.name}</span>
        <span className="text-slate-500">weight {Math.round(factor.weight * 100)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${barColor}`} style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{factor.detail}</p>
    </div>
  );
}
