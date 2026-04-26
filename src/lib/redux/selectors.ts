import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { Todo } from './slices/todosSlice';

const selectItems = (state: RootState) => state.todos.items;
export const selectFilter = (state: RootState) => state.todos.filter;

export const selectVisibleTodos = createSelector(
  [selectItems, selectFilter],
  (items, filter): Todo[] => {
    if (filter === 'active') return items.filter((t) => !t.completed);
    if (filter === 'completed') return items.filter((t) => t.completed);
    return items;
  },
);

export const selectTodoStats = createSelector([selectItems], (items) => {
  const total = items.length;
  const completed = items.reduce((acc, t) => (t.completed ? acc + 1 : acc), 0);
  return {
    total,
    completed,
    active: total - completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
});

export const selectTodoIds = createSelector([selectVisibleTodos], (todos) =>
  todos.map((t) => t.id),
);

export const makeSelectTodoById = () =>
  createSelector(
    [selectItems, (_: RootState, id: string) => id],
    (items, id) => items.find((t) => t.id === id),
  );
