'use client';

import { memo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectFilter, selectTodoIds, selectTodoStats } from '@/lib/redux/selectors';
import TodoItem from './TodoItem';

function EmptyState({ filter, total }: { filter: string; total: number }) {
  const message =
    total === 0
      ? 'No tasks yet — press / and start typing to add your first one.'
      : filter === 'active'
        ? 'Nothing active. You’re all caught up.'
        : filter === 'completed'
          ? 'No completed tasks yet. Get to work.'
          : 'No tasks here.';

  return (
    <div className="glass animate-fade-in flex flex-col items-center gap-2 rounded-3xl p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      <p className="text-sm text-white/40">{message}</p>
    </div>
  );
}

function TodoListImpl() {
  const ids = useAppSelector(selectTodoIds);
  const filter = useAppSelector(selectFilter);
  const { total } = useAppSelector(selectTodoStats);

  if (ids.length === 0) return <EmptyState filter={filter} total={total} />;

  return (
    <ul
      className="scrollbar-thin flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1"
      role="list"
    >
      {ids.map((id) => (
        <TodoItem key={id} id={id} />
      ))}
    </ul>
  );
}

export default memo(TodoListImpl);
