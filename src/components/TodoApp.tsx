'use client';

import { useEffect } from 'react';
import TodoInput from './TodoInput';
import FilterBar from './FilterBar';
import StatsBar from './StatsBar';
import TodoList from './TodoList';
import { useAppDispatch } from '@/lib/redux/hooks';
import { clearCompleted } from '@/lib/redux/slices/todosSlice';

export default function TodoApp() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing) return;
      if (e.key.toLowerCase() === 'c' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        dispatch(clearCompleted());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  return (
    <section className="animate-scale-in mt-10 flex flex-col gap-5">
      <div className="glass shadow-card rounded-3xl p-5 sm:p-6">
        <TodoInput />
        <div className="mt-5 border-t border-white/5 pt-5">
          <FilterBar />
        </div>
      </div>

      <StatsBar />
      <TodoList />
    </section>
  );
}
