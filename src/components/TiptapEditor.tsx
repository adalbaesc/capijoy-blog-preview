"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type TiptapEditorProps = {
  initialContent?: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
};

const BASE_EDITOR_CLASS =
  "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-md";

export default function TiptapEditor({
  initialContent = "",
  onContentChange,
  placeholder,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          BASE_EDITOR_CLASS +
          (placeholder ? ` data-placeholder="${placeholder}"` : ""),
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="min-h-[200px] p-4 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
        Carregando editor...
      </div>
    );
  }

  return <EditorContent editor={editor} />;
}