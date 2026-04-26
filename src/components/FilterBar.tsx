'use client';

import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { selectFilter, selectTodoStats } from '@/lib/redux/selectors';
import { clearCompleted, setFilter, type Filter } from '@/lib/redux/slices/todosSlice';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function FilterBarImpl() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectFilter);
  const { active, completed } = useAppSelector(selectTodoStats);

  const onClear = useCallback(() => dispatch(clearCompleted()), [dispatch]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/5">
        {FILTERS.map((f) => {
          const isActive = f.key === filter;
          const count = f.key === 'active' ? active : f.key === 'completed' ? completed : null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => dispatch(setFilter(f.key))}
              className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/50 hover:text-white/80'
              }`}
              aria-pressed={isActive}
            >
              {f.label}
              {count !== null && (
                <span className="ml-1.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={completed === 0}
        className="text-xs font-medium text-white/40 transition hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/40"
      >
        Clear completed{completed > 0 ? ` (${completed})` : ''}
      </button>
    </div>
  );
}

export default memo(FilterBarImpl);
