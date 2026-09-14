"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";
import { Icon, type IconName } from "@/components/icon";

/**
 * Bilingual-aware rich text editor.
 *
 * `dir` is set per instance, so the Arabic editor types right-to-left and the
 * English one left-to-right in the same form — the previous editor used one
 * direction for both, which made English content awkward to write.
 *
 * Output is HTML. It is sanitised server-side on save (see lib/sanitize.ts),
 * so nothing here is trusted.
 */
export function RichEditor({
  value,
  onChange,
  dir = "rtl",
  placeholder,
  onRequestImage,
}: {
  value: string;
  onChange: (html: string) => void;
  dir?: "rtl" | "ltr";
  placeholder?: string;
  onRequestImage?: () => Promise<string | null>;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExt.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        dir,
        class:
          "prose-body min-h-[320px] px-4 py-4 focus:outline-none [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-start [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-ink-3 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[380px] rounded-sm border border-line bg-surface" />
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-surface focus-within:border-accent">
      <Toolbar editor={editor} onRequestImage={onRequestImage} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({
  editor,
  onRequestImage,
}: {
  editor: Editor;
  onRequestImage?: () => Promise<string | null>;
}) {
  const linkRef = useRef<HTMLInputElement>(null);

  const addLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!onRequestImage) return;
    const url = await onRequestImage();
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor, onRequestImage]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-alt px-2 py-2">
      <Btn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <span className="font-bold">B</span>
      </Btn>
      <Btn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <span className="italic">I</span>
      </Btn>

      <Sep />

      {([2, 3] as const).map((level) => (
        <Btn
          key={level}
          active={editor.isActive("heading", { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          label={`Heading ${level}`}
        >
          H{level}
        </Btn>
      ))}

      <Sep />

      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        •
      </Btn>
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        1.
      </Btn>
      <Btn
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Quote"
      >
        &rdquo;
      </Btn>

      <Sep />

      <Btn active={editor.isActive("link")} onClick={addLink} label="Link">
        <Icon name="link" className="h-4 w-4" />
      </Btn>
      {onRequestImage && (
        <Btn onClick={addImage} label="Insert image">
          <Icon name="image" className="h-4 w-4" />
        </Btn>
      )}

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        label="Undo"
        disabled={!editor.can().undo()}
      >
        ↶
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        label="Redo"
        disabled={!editor.can().redo()}
      >
        ↷
      </Btn>

      <input ref={linkRef} type="hidden" />
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      title={label}
      className={[
        "inline-flex h-8 min-w-8 items-center justify-center rounded-xs px-2 text-sm transition-colors",
        active
          ? "bg-accent text-surface"
          : "text-ink-2 hover:bg-accent-wash hover:text-accent",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-line" />;
}

export type { IconName };
