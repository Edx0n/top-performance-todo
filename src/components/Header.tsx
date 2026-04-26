export default function Header() {
  return (
    <header className="animate-fade-in flex flex-col gap-3 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="bg-accent/20 text-accent-glow shadow-glow flex h-11 w-11 items-center justify-center rounded-2xl text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="gradient-text">Top Performance</span>
          <span className="text-white/50"> · Todo</span>
        </h1>
      </div>
      <p className="mx-auto max-w-md text-sm text-white/40">
        A blazing-fast, persistent task manager — keystrokes synced through Redux Toolkit and
        rehydrated from local storage on every visit.
      </p>
    </header>
  );
}
