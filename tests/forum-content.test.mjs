import test from "node:test";
import assert from "node:assert/strict";
import { FORUM_BODY_MAX, FORUM_DELETED_BODY, FORUM_TITLE_MAX, assertForumMediaLimits, forumPreviewImage, forumUploadExtension, forumUploadKeyFromStoredSrc, forumUploadSrc, isForumDeleted, isForumImageUrl, isForumUploadKey, isForumVideoUrl, requireForumBody, sanitizeForumHtml, validateTitle } from "../lib/forum-content.js";

test("https image and gif links are allowed", () => {
  assert.equal(isForumImageUrl("https://i.imgur.com/abc123.png"), true);
  assert.equal(isForumImageUrl("https://media.tenor.com/example/goal.gif"), true);
  assert.equal(isForumImageUrl("https://media.giphy.com/media/abc/giphy.webp"), true);
});

test("a catalog preview uses the first allowed image", () => {
  assert.equal(forumPreviewImage('<p>hi</p><img src="https://i.imgur.com/abc123.png" alt="">'), "https://i.imgur.com/abc123.png");
  assert.equal(forumPreviewImage('<img src="javascript:alert(1)">'), "");
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
test("a post cannot carry an unlimited number of uploads", () => {
  const image = '<img src="https://forum-uploads.hocke.invalid/forum/550e8400-e29b-41d4-a716-446655440000.png" data-upload="forum/550e8400-e29b-41d4-a716-446655440000.png">';
  assert.doesNotThrow(() => assertForumMediaLimits(image.repeat(4)));
  assert.throws(() => assertForumMediaLimits(image.repeat(5)), /4 uploaded images/);
  assert.throws(() => assertForumMediaLimits("<video src=\"https://example.com/a.mp4\"></video>".repeat(3)), /2 videos/);
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

test("a deleted post is marked without matching ordinary text", () => {
  assert.equal(isForumDeleted(FORUM_DELETED_BODY), true);
  assert.equal(isForumDeleted("<p>Deleted</p>"), false);
  assert.equal(isForumDeleted("<p>I deleted my take</p>"), false);
});

test("thread titles must be 3 to 80 characters", () => {
  assert.equal(validateTitle("MEOW"), "MEOW");
  assert.equal(FORUM_TITLE_MAX, 80);
  assert.equal(FORUM_BODY_MAX, 10000);
  assert.throws(() => validateTitle("a".repeat(81)), /80 characters/);
  assert.throws(() => validateTitle("ab"), /3 to 80/);
});

test("trusted creates can sanitize a post body in Node", async () => {
  assert.equal(typeof window, "undefined");
  const clean = await requireForumBody("<p>First line shift.</p>");
  assert.match(clean, /First line shift/);
  const withScript = await sanitizeForumHtml("<p>Keep me</p><script>alert(1)</script>");
  assert.match(withScript, /Keep me/);
  assert.doesNotMatch(withScript, /script/i);
  await assert.rejects(() => requireForumBody("<script>alert(1)</script>"), /Write something/);
});

test("server sanitize keeps allowed media and drops the rest", async () => {
  const image = await requireForumBody('<p><img src="https://i.imgur.com/abc123.png"></p>');
  assert.match(image, /i\.imgur\.com\/abc123\.png/);
  assert.match(image, /loading="lazy"/);
  const upload = await requireForumBody('<p><img data-upload="forum/550e8400-e29b-41d4-a716-446655440000.gif" src="https://evil.example/x.gif"></p>');
  assert.match(upload, /forum-uploads\.hocke\.invalid\/forum\/550e8400-e29b-41d4-a716-446655440000\.gif/);
  const dropped = await sanitizeForumHtml('<p><img src="javascript:alert(1)"><a href="javascript:alert(1)">x</a></p>');
  assert.doesNotMatch(dropped, /javascript/i);
  assert.match(dropped, />x<\/a>/);
});
