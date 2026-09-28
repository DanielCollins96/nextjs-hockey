import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DisplayNameForm({ identity, compact = false }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!identity.user) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <Link href="/login" className="font-semibold text-blue-700 hover:underline dark:text-blue-300">
          Log in
        </Link>{" "}
        to post.
      </p>
    );
  }

  if (identity.isLoading || identity.authorName) return null;

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await identity.saveDisplayName(name);
      setName("");
    } catch (error) {
      toast.error(error?.message || "Could not save that name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={compact ? "mb-3" : "mb-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"}>
      <label htmlFor="forum-display-name" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-100">
        Choose a display name before you post
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="forum-display-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={24}
          placeholder="3 to 24 characters"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save name"}
        </button>
      </div>
    </form>
  );
}
