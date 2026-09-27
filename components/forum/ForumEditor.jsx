import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import toast from "react-hot-toast";
import { forumUploadExtension, isForumImageUrl, isForumVideoUrl } from "../../lib/forum-content";
import { forumAuthToken, uploadForumImage } from "../../lib/forum-media";

const ForumImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploadKey: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-upload"),
        renderHTML: (attributes) => (attributes.uploadKey ? { "data-upload": attributes.uploadKey } : {}),
      },
    };
  },
}).configure({ inline: false, allowBase64: false });

const ForumVideo = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, {
      controls: "",
      loop: "",
      muted: "",
      playsinline: "",
      autoplay: "",
      preload: "metadata",
    })];
  },
  addCommands() {
    return {
      setVideo: (src) => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { src },
      }),
    };
  },
});

function clipboardImage(event) {
  const files = [...(event.clipboardData?.files || [])];
  const file = files.find((item) => forumUploadExtension(item));
  if (file) return file;
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.kind === "file" && forumUploadExtension({ type: entry.type }));
  return item ? item.getAsFile() : null;
}

function ToolbarButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function insertImageNode(view, src) {
  const node = view.state.schema.nodes.image.create({ src });
  view.dispatch(view.state.tr.replaceSelectionWith(node));
}

function insertVideoNode(view, src) {
  const node = view.state.schema.nodes.video.create({ src });
  view.dispatch(view.state.tr.replaceSelectionWith(node));
}

export default function ForumEditor({ value, onChange, placeholder = "Write a post..." }) {
  const fileRef = useRef(null);
  const [panel, setPanel] = useState(null);
  const [url, setUrl] = useState("");
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [gifNote, setGifNote] = useState("");
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      ForumImage,
      ForumVideo,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "forum-editor-content",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain")?.trim() || "";
        if (isForumVideoUrl(text)) {
          insertVideoNode(view, text);
          return true;
        }
        if (isForumImageUrl(text)) {
          insertImageNode(view, text);
          return true;
        }
        const file = clipboardImage(event);
        if (file) {
          uploadForumImage(file).then(({ key, src }) => {
            const node = view.state.schema.nodes.image.create({ src, uploadKey: key });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          }).catch((error) => {
            toast.error(error?.message || "Could not upload that image.");
          });
          return true;
        }
        const items = [...(event.clipboardData?.items || [])];
        if (items.some((item) => item.type.startsWith("image/"))) {
          toast.error("Use a jpg, png, webp, or gif.");
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value === "") editor.commands.clearContent();
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href || "https://";
    const next = window.prompt("Link URL", previous);
    if (next === null) return;
    if (!next.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(next.trim())) return;
    editor.chain().focus().setLink({ href: next.trim() }).run();
  };

  const addImage = (src) => {
    const next = String(src || "").trim();
    if (isForumVideoUrl(next)) {
      editor.chain().focus().setVideo(next).run();
      setUrl("");
      setPanel(null);
      setGifs([]);
      setGifNote("");
      return;
    }
    if (!isForumImageUrl(next)) {
      toast.error("Use an https link to a jpg, png, webp, gif, or mp4.");
      return;
    }
    editor.chain().focus().setImage({ src: next, alt: "" }).run();
    setUrl("");
    setPanel(null);
    setGifs([]);
    setGifNote("");
  };

  const uploadFile = async (file) => {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const { key, src } = await uploadForumImage(file);
      editor.chain().focus().setImage({ src, alt: "", uploadKey: key }).run();
      setPanel(null);
      setUrl("");
    } catch (error) {
      toast.error(error?.message || "Could not upload that image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const searchGifs = async (event) => {
    event.preventDefault();
    const query = gifQuery.trim();
    if (!query) return;
    setSearching(true);
    setGifNote("");
    try {
      const token = await forumAuthToken().catch(() => "");
      const response = await fetch(`/api/gifs?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (!data.configured) {
        setGifs([]);
        setGifNote("GIF search needs a Tenor or Giphy key. Paste a GIF link instead.");
        return;
      }
      if (!response.ok) {
        setGifs([]);
        setGifNote(data.error || "GIF search is unavailable. Paste a GIF link instead.");
        return;
      }
      setGifs(data.gifs || []);
      if (!data.gifs?.length) setGifNote("No GIFs found.");
    } catch {
      setGifs([]);
      setGifNote("GIF search is unavailable. Paste a GIF link instead.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1 dark:border-gray-600">
        <ToolbarButton
          active={editor?.isActive("bold")}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("italic")}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("heading", { level: 2 })}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("link")} disabled={!editor} onClick={setLink}>
          Link
        </ToolbarButton>
        <ToolbarButton active={panel === "image"} disabled={!editor} onClick={() => setPanel(panel === "image" ? null : "image")}>
          Image
        </ToolbarButton>
        <ToolbarButton active={panel === "gif"} disabled={!editor} onClick={() => setPanel(panel === "gif" ? null : "gif")}>
          GIF
        </ToolbarButton>
      </div>
      {panel && (
        <div className="space-y-2 border-b border-gray-200 px-2 py-2 dark:border-gray-600">
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addImage(url);
              }}
              placeholder={panel === "gif" ? "https://….gif or .mp4" : "https://….jpg, .png, or .mp4"}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => addImage(url)}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Insert
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
          </div>
          {panel === "gif" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={gifQuery}
                  onChange={(event) => setGifQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    searchGifs(event);
                  }}
                  placeholder="Search GIFs"
                  className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  type="button"
                  disabled={searching}
                  onClick={searchGifs}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
              {gifNote && <p className="text-xs text-gray-500 dark:text-gray-400">{gifNote}</p>}
              {gifs.length > 0 && (
                <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto">
                  {gifs.map((gif) => (
                    <button
                      key={gif.src}
                      type="button"
                      onClick={() => addImage(gif.src)}
                      className="overflow-hidden rounded border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <img src={gif.preview} alt={gif.alt} className="h-16 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
