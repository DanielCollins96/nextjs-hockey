import dynamic from "next/dynamic";
import { useState } from "react";
import toast from "react-hot-toast";
import DisplayNameForm from "./DisplayNameForm";
import { htmlToText } from "../../lib/forum-content";

const ForumEditor = dynamic(() => import("./ForumEditor"), { ssr: false });

export default function ForumComposer({
  identity,
  title,
  onSubmit,
  showTitle = false,
  submitLabel = "Post",
  placeholder,
  onCancel,
  embedded = false,
}) {
  const [draftTitle, setDraftTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  if (!identity.user) return <DisplayNameForm identity={identity} />;
  if (identity.needsName || identity.isLoading) return <DisplayNameForm identity={identity} />;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title: draftTitle,
        body,
        authorName: identity.authorName,
        authorId: identity.user.username,
      });
      setDraftTitle("");
      setBody("");
    } catch (error) {
      toast.error(error?.message || "Could not save that post.");
    } finally {
      setSaving(false);
    }
  };

  const dirty = Boolean(draftTitle.trim() || htmlToText(body) || /<img\b|<video\b/i.test(body));
  const cancel = () => {
    setDraftTitle("");
    setBody("");
    onCancel?.();
  };

  return (
    <form
      onSubmit={submit}
      className={embedded ? "" : "rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"}
    >
      <h2 className={embedded ? "text-sm font-semibold text-gray-900 dark:text-gray-100" : "text-lg font-semibold text-gray-900 dark:text-gray-100"}>{title}</h2>
      {showTitle && (
        <input
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          maxLength={120}
          placeholder="Thread title"
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      )}
      <div className="mt-3">
        <ForumEditor value={body} onChange={setBody} placeholder={placeholder} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Posting..." : submitLabel}
        </button>
        {(onCancel || dirty) && (
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="text-sm font-medium text-gray-600 hover:underline disabled:opacity-70 dark:text-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
