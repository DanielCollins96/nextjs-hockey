import Head from "next/head";
import Link from "next/link";

const linkClassName =
  "rounded-md border border-gray-200 bg-white px-3 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-blue-500 dark:hover:text-blue-300";

export default function ErrorView({ statusCode = 404 }) {
  const isNotFound = statusCode === 404;
  const title = isNotFound ? "Page not found" : "Something went wrong";
  const description = isNotFound
    ? "That team, player, or page does not exist."
    : "The page failed to load. Try again in a moment.";

  return (
    <section className="mx-auto max-w-6xl px-3 py-16">
      <Head>
        <title>{`${statusCode} | hocke.ca`}</title>
      </Head>
      <p className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        {statusCode}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
      <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-3">
        <Link href="/" className={linkClassName}>
          Home
        </Link>
        <Link href="/teams" className={linkClassName}>
          Teams
        </Link>
        <Link href="/players" className={linkClassName}>
          Players
        </Link>
      </div>
    </section>
  );
}
