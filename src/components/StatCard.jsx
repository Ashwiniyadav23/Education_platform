import React from 'react';

export default function StatCard({ label, value, sublabel, accent = 'indigo' }) {
  const accents = {
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>
      {sublabel && (
        <p className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${accents[accent]}`}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
