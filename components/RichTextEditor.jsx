import dynamic from "next/dynamic";
import { useMemo } from "react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
}) {
  const options = useMemo(
    () => ({
      autofocus: false,
      spellChecker: false,
      status: false,
      sideBySideFullscreen: false,
      minHeight: "180px",
      placeholder,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "preview",
        "|",
        "guide",
      ],
    }),
    [placeholder]
  );

  return (
    <div className="rich-text-editor overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
      <SimpleMDE value={value || ""} onChange={onChange} options={options} />
    </div>
  );
}
