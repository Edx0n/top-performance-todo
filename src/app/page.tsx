import dynamic from 'next/dynamic';
import Header from '@/components/Header';

const TodoApp = dynamic(() => import('@/components/TodoApp'), {
  ssr: false,
  loading: () => (
    <div className="glass mx-auto mt-10 h-[420px] w-full max-w-3xl animate-pulse rounded-3xl" />
  ),
});

export default function Page() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-24 pt-10 sm:pt-16">
      <Header />
      <TodoApp />
      <footer className="mt-12 text-center text-xs text-white/30">
        Built with Next.js 14 · React 18 · Redux Toolkit · Tailwind CSS
      </footer>
    </main>
  );
}
