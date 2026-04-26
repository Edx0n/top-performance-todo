import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type Priority = 'low' | 'medium' | 'high';
export type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  completedAt: number | null;
}

export interface TodosState {
  items: Todo[];
  filter: Filter;
}

const initialState: TodosState = {
  items: [],
  filter: 'all',
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.items.unshift(action.payload);
      },
      prepare(text: string, priority: Priority = 'medium') {
        return {
          payload: {
            id: nanoid(),
            text: text.trim(),
            completed: false,
            priority,
            createdAt: Date.now(),
            completedAt: null,
          } satisfies Todo,
        };
      },
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? Date.now() : null;
      }
    },
    editTodo(state, action: PayloadAction<{ id: string; text: string }>) {
      const todo = state.items.find((t) => t.id === action.payload.id);
      if (todo) todo.text = action.payload.text.trim();
    },
    setPriority(state, action: PayloadAction<{ id: string; priority: Priority }>) {
      const todo = state.items.find((t) => t.id === action.payload.id);
      if (todo) todo.priority = action.payload.priority;
    },
    removeTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    clearCompleted(state) {
      state.items = state.items.filter((t) => !t.completed);
    },
    setFilter(state, action: PayloadAction<Filter>) {
      state.filter = action.payload;
    },
    reorder(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const [moved] = state.items.splice(from, 1);
      state.items.splice(to, 0, moved);
    },
  },
});

export const {
  addTodo,
  toggleTodo,
  editTodo,
  setPriority,
  removeTodo,
  clearCompleted,
  setFilter,
  reorder,
} = todosSlice.actions;

export default todosSlice.reducer;
