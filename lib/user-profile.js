export const PROFILE_BIO_SUBJECT = "__PROFILE_BIO__";

export function getNormalizedSubject(post) {
  return String(post?.subject || "").trim();
}

export function isProfileBioPost(post) {
  return getNormalizedSubject(post) === PROFILE_BIO_SUBJECT;
}

export function parseProfileContent(content) {
  const rawContent = String(content || "").trim();
  if (!rawContent) {
    return { username: "", bio: "" };
  }

  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && typeof parsed === "object") {
      return {
        username: String(parsed.username || "").trim(),
        bio: String(parsed.bio || "").trim(),
      };
    }
  } catch (err) {
    return { username: "", bio: rawContent };
  }

  return { username: "", bio: rawContent };
}

export function serializeProfileContent({ username = "", bio = "" }) {
  return JSON.stringify({
    username: username.trim(),
    bio: bio.trim(),
  });
}
