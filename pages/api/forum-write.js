import { forumVerifiedUser } from "../../lib/forum-aws";
import {
  createTrustedReply,
  createTrustedThread,
  markTrustedDeleted,
  readTrustedVotes,
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
    if (action === "readVotes") {
      const votes = await readTrustedVotes({
        username: user.username,
        targets: req.body.targets,
      });
      return res.status(200).json({ votes });
    }
    if (action === "voteTarget") {
      const vote = await voteTrustedTarget({
        username: user.username,
        id: req.body.id,
        targetType: req.body.targetType,
      });
      return res.status(200).json({
        activity: { id: vote.id, score: vote.score },
        value: vote.value,
      });
    }
    if (action === "markDeleted") {
      const activity = await markTrustedDeleted({
        username: user.username,
        identities: user.identities,
        id: req.body.id,
        targetType: req.body.targetType,
      });
      return res.status(200).json({ activity });
    }
    return res.status(400).json({ error: "Unknown forum action." });
  } catch (error) {
    return res.status(400).json({ error: error?.message || "Forum request failed." });
  }
}
