const STEPS = ["Service", "Date & time", "Your details"];

export function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                state === "todo" ? "border border-line bg-surface text-muted" : "bg-plum-600 text-white"
              }`}
            >
              {state === "done" ? "✓" : n}
            </span>
            <span className={`hidden sm:inline ${state === "todo" ? "text-muted" : "font-medium"}`}>{label}</span>
            {n < STEPS.length && <span className="mx-1 h-px w-6 bg-line sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
