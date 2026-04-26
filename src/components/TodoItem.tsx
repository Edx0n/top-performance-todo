'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { makeSelectTodoById } from '@/lib/redux/selectors';
import {
  editTodo,
  removeTodo,
  setPriority,
  toggleTodo,
  type Priority,
} from '@/lib/redux/slices/todosSlice';

const PRIORITY_STYLE: Record<Priority, { dot: string; label: string }> = {
  low: { dot: 'bg-emerald-400', label: 'Low' },
  medium: { dot: 'bg-indigo-400', label: 'Medium' },
  high: { dot: 'bg-rose-400', label: 'High' },
};

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

function TodoItemImpl({ id }: { id: string }) {
  const selectTodoById = useMemo(makeSelectTodoById, []);
  const todo = useAppSelector((s) => selectTodoById(s, id));
  const dispatch = useAppDispatch();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo?.text ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const onToggle = useCallback(() => dispatch(toggleTodo(id)), [dispatch, id]);
  const onRemove = useCallback(() => dispatch(removeTodo(id)), [dispatch, id]);
  const onCommit = useCallback(() => {
    const text = draft.trim();
    if (text && todo && text !== todo.text) {
      dispatch(editTodo({ id, text }));
    }
    setEditing(false);
  }, [draft, dispatch, id, todo]);
  const cyclePriority = useCallback(() => {
    if (!todo) return;
    const order: Priority[] = ['low', 'medium', 'high'];
    const next = order[(order.indexOf(todo.priority) + 1) % order.length];
    dispatch(setPriority({ id, priority: next }));
  }, [dispatch, id, todo]);

  if (!todo) return null;

  const style = PRIORITY_STYLE[todo.priority];

  return (
    <li
      className={`group glass animate-slide-in relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition hover:bg-white/[0.04] ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        onClick={cyclePriority}
        title={`Priority: ${style.label} (click to change)`}
        className="shrink-0"
        aria-label={`Priority ${style.label}`}
      >
        <span className={`block h-2 w-2 rounded-full ${style.dot} shadow-[0_0_10px_currentColor]`} />
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          todo.completed
            ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
            : 'border-white/15 text-transparent hover:border-indigo-300 hover:bg-indigo-400/10'
        }`}
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={onCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommit();
              if (e.key === 'Escape') {
                setDraft(todo.text);
                setEditing(false);
              }
            }}
            className="w-full rounded-md bg-white/[0.04] px-2 py-1 text-sm text-white outline-none ring-1 ring-indigo-400/40"
            maxLength={280}
            aria-label="Edit task"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => {
              setDraft(todo.text);
              setEditing(true);
            }}
            className={`block truncate text-left text-sm ${
              todo.completed ? 'text-white/45 line-through' : 'text-white/90'
            }`}
            title="Double-click to edit"
          >
            {todo.text}
          </button>
        )}
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/30">
          <span>{formatRelative(todo.createdAt)}</span>
          {todo.completed && todo.completedAt && (
            <>
              <span aria-hidden>·</span>
              <span>done {formatRelative(todo.completedAt)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => {
            setDraft(todo.text);
            setEditing(true);
          }}
          className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
          aria-label="Edit task"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1.5 text-white/40 transition hover:bg-rose-400/10 hover:text-rose-300"
          aria-label="Delete task"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </li>
  );
}

export default memo(TodoItemImpl);
