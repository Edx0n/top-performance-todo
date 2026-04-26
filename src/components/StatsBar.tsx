'use client';

import { memo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectTodoStats } from '@/lib/redux/selectors';

function StatsBarImpl() {
  const { total, completed, active, completionRate } = useAppSelector(selectTodoStats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Total" value={total} />
      <Stat label="Active" value={active} accent="text-indigo-300" />
      <Stat label="Completed" value={completed} accent="text-emerald-300" />
      <div className="glass relative overflow-hidden rounded-2xl px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-white/40">Progress</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-semibold text-white">{completionRate}</span>
          <span className="text-xs text-white/40">%</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 transition-[width] duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = 'text-white',
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

export default memo(StatsBarImpl);
