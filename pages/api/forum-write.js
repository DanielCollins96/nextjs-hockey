import { forumVerifiedUser } from "../../lib/forum-aws";
import {
  createTrustedReply,
  createTrustedThread,
  markTrustedDeleted,
  viewTrustedThread,
  voteTrustedTarget,
} from "../../lib/forum-server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = token ? await forumVerifiedUser(token).catch(() => null) : null;
  if (!user) return res.status(401).json({ error: "Log in to post." });

  try {
    const { action } = req.body || {};
    if (action === "createThread") {
      const thread = await createTrustedThread({
        token,
        username: user.username,
        boardSlug: req.body.boardSlug,
        title: req.body.title,
        body: req.body.body,
        gameId: req.body.gameId || null,
        id: req.body.id || null,
      });
      return res.status(200).json({ thread });
    }
    if (action === "createReply") {
      const reply = await createTrustedReply({
        token,
        username: user.username,
        threadId: req.body.threadId,
        body: req.body.body,
        parentReplyId: req.body.parentReplyId || null,
      });
      return res.status(200).json({ reply });
    }
    if (action === "viewThread") {
      const activity = await viewTrustedThread({ id: req.body.id, boardSlug: req.body.boardSlug });
      return res.status(200).json({ activity });
    }
    if (action === "voteTarget") {
      const activity = await voteTrustedTarget({
        id: req.body.id,
        boardSlug: req.body.boardSlug,
        delta: req.body.delta,
      });
      return res.status(200).json({ activity });
    }
    if (action === "markDeleted") {
      const activity = await markTrustedDeleted({ id: req.body.id, boardSlug: req.body.boardSlug });
      return res.status(200).json({ activity });
    }
    return res.status(400).json({ error: "Unknown forum action." });
  } catch (error) {
    return res.status(400).json({ error: error?.message || "Forum request failed." });
  }
}
