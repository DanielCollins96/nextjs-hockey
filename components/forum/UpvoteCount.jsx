function UpvoteGlyph({ score, active, compact = false }) {
  const tint = active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-300";
  return (
    <span className={`inline-flex items-center ${compact ? "gap-0.5" : "gap-1"} ${tint}`}>
      <svg viewBox="0 0 20 20" aria-hidden="true" className={compact ? "h-3.5 w-3.5" : "h-5 w-5"}>
        <path d="M5 12.5 10 7l5 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-center font-bold tabular-nums leading-none ${compact ? "text-[11px]" : "min-w-[1rem] text-xs"}`}>{score || 0}</span>
    </span>
  );
}

export default function UpvoteCount({ score, active, plain = false, compact = false }) {
  const voted = active ?? (score || 0) > 0;
  const glyph = <UpvoteGlyph score={score} active={voted} compact={compact} />;
  if (plain) return glyph;
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 py-1 pl-2 pr-3 dark:bg-gray-900">
      {glyph}
    </span>
  );
}

export function VoteButton({ active, score, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={active ? "Remove upvote" : "Upvote"}
      aria-pressed={active}
      className="inline-flex items-center rounded-full bg-gray-100 py-1 pl-2 pr-3 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:disabled:hover:bg-gray-900"
    >
      <UpvoteGlyph score={score} active={active} />
    </button>
  );
}
