import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { popularNeighbors } from "../../lib/forum-hot";
import { threadPath } from "../../lib/forum-numbers";

const POPULAR_SEARCH = { feed: "popular" };

function typingTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
}

function Step({ thread, label, current = false }) {
  const className = current
    ? "rounded bg-gray-900 px-2 py-1 text-xs font-bold text-white dark:bg-gray-100 dark:text-gray-900"
    : "rounded px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
  if (!thread || current) {
    return <span className={current ? className : "px-2 py-1 text-xs font-bold text-gray-400"}>{label}</span>;
  }
  return (
    <Link href={threadPath(thread, POPULAR_SEARCH)} className={label === "Next" ? "rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700" : className}>
      {label}
    </Link>
  );
}

export default function PopularStepper({ threads, threadId, listen = false }) {
  const router = useRouter();
  const list = threads || [];
  const { index, previous, next } = popularNeighbors(list, threadId);

  useEffect(() => {
    if (!listen || index < 0) return undefined;
    const onKey = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (typingTarget(event.target)) return;
      const target = event.key === "ArrowRight" ? next : event.key === "ArrowLeft" ? previous : null;
      if (!target) return;
      event.preventDefault();
      router.push(threadPath(target, POPULAR_SEARCH));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, listen, next, previous, router]);

  if (index < 0) return null;

  const nearby = [index - 1, index, index + 1].filter((item) => item >= 0 && item < list.length);

  return (
    <nav aria-label="Popular" className="flex flex-wrap items-center gap-1.5">
      <Step thread={index > 0 ? list[0] : null} label="First" />
      {nearby.map((item) => (
        <Step key={list[item].id} thread={list[item]} label={String(item + 1)} current={item === index} />
      ))}
      <Step thread={index < list.length - 1 ? list[list.length - 1] : null} label="Last" />
      <Step thread={next} label="Next" />
    </nav>
  );
}
