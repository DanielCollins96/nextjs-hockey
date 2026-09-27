import test from "node:test";
import assert from "node:assert/strict";
import { forumUploadExtension, forumUploadKeyFromStoredSrc, forumUploadSrc, isForumImageUrl, isForumUploadKey, isForumVideoUrl } from "../lib/forum-content.js";

test("https image and gif links are allowed", () => {
  assert.equal(isForumImageUrl("https://i.imgur.com/abc123.png"), true);
  assert.equal(isForumImageUrl("https://media.tenor.com/example/goal.gif"), true);
  assert.equal(isForumImageUrl("https://media.giphy.com/media/abc/giphy.webp"), true);
});

test("an uploaded image keeps a stable forum key", () => {
  const key = "forum/550e8400-e29b-41d4-a716-446655440000.gif";
  assert.equal(isForumUploadKey(key), true);
  assert.equal(isForumImageUrl(forumUploadSrc(key)), true);
  assert.equal(isForumUploadKey("forum/../secret.png"), false);
  assert.equal(forumUploadExtension({ type: "image/jpeg" }), "jpg");
  assert.equal(forumUploadExtension({ type: "image/heic" }), "");
});

test("an expired upload link still points at the stored file", () => {
  const signed = "https://example.s3.us-east-1.amazonaws.com/public/forum/dd9dd9c8-1a0d-4dd4-8cab-0f0c686025ec.png?X-Amz-Expires=3600&X-Amz-Signature=abc";
  assert.equal(forumUploadKeyFromStoredSrc(signed), "forum/dd9dd9c8-1a0d-4dd4-8cab-0f0c686025ec.png");
  assert.equal(forumUploadKeyFromStoredSrc(forumUploadSrc("forum/dd9dd9c8-1a0d-4dd4-8cab-0f0c686025ec.png")), "forum/dd9dd9c8-1a0d-4dd4-8cab-0f0c686025ec.png");
  assert.equal(forumUploadKeyFromStoredSrc("https://example.com/public/not-forum/file.png"), "");
});
test("funnyjunk hd clips are mp4 videos", () => {
  const clip = "https://anime3.funnyjunk.com/hdgifs/The+granola+tastes+like+glue_4fcc86_13410118-HD-AV1.mp4";
  assert.equal(isForumVideoUrl(clip), true);
  assert.equal(isForumImageUrl(clip), false);
  assert.equal(isForumVideoUrl("http://anime3.funnyjunk.com/hdgifs/clip.mp4"), false);
});

test("pages, data urls, and non-image files are rejected", () => {
  assert.equal(isForumImageUrl("https://tenor.com/view/goal-gif-123"), false);
  assert.equal(isForumImageUrl("http://i.imgur.com/abc123.png"), false);
  assert.equal(isForumImageUrl("data:image/gif;base64,R0lGOD"), false);
  assert.equal(isForumImageUrl("https://example.com/file.pdf"), false);
});
