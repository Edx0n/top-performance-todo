'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addTodo, type Priority } from '@/lib/redux/slices/todosSlice';

const PRIORITIES: { key: Priority; label: string; ring: string }[] = [
  { key: 'low', label: 'Low', ring: 'ring-emerald-400/40 text-emerald-300' },
  { key: 'medium', label: 'Medium', ring: 'ring-indigo-400/40 text-indigo-300' },
  { key: 'high', label: 'High', ring: 'ring-rose-400/40 text-rose-300' },
];

function TodoInputImpl() {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text) return;
    dispatch(addTodo(text, priority));
    setValue('');
  }, [value, priority, dispatch]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/5 transition focus-within:bg-white/[0.06] focus-within:ring-indigo-400/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-white/30"
          aria-hidden
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') setValue('');
          }}
          placeholder="What needs to get done?"
          className="flex-1 bg-transparent text-base text-white placeholder:text-white/25 focus:outline-none"
          maxLength={280}
          aria-label="New task"
        />
        <kbd className="hidden rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/40 sm:inline-block">
          /
        </kbd>
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim()}
          className="bg-accent hover:bg-accent-glow shadow-glow flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none"
        >
          Add
          <kbd className="hidden rounded bg-white/15 px-1 text-[10px] sm:inline-block">⏎</kbd>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-1">
        <span className="text-xs uppercase tracking-wider text-white/30">Priority</span>
        {PRIORITIES.map((p) => {
          const active = p.key === priority;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPriority(p.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? `bg-white/[0.06] ${p.ring} ring-1`
                  : 'text-white/40 hover:text-white/70'
              }`}
              aria-pressed={active}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TodoInputImpl);
