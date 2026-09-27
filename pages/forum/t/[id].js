import { useRouter } from "next/router";
import SEO from "../../../components/SEO";
import ForumThread from "../../../components/forum/ForumThread";

export default function ForumThreadPage() {
  const router = useRouter();
  const threadId = String(router.query.id || "");

  return (
    <div className="mx-auto max-w-3xl px-3 py-6">
      <SEO title="Forum thread" description="Hockey forum thread" path={`/forum/t/${threadId}`} />
      {threadId && <ForumThread threadId={threadId} />}
    </div>
  );
}
