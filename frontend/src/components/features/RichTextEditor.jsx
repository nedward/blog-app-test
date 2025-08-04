import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  Heading2,
  Heading3,
  MinusSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      'p-2 rounded hover:bg-gray-100 transition-colors',
      isActive && 'bg-gray-100 text-primary-600'
    )}
    type="button"
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing your story...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center gap-1 flex-wrap">
        {/* Text Style */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code size={18} />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Type size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={18} />
          </MenuButton>
        </div>

        {/* Links & Media */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <Link2 size={18} />
          </MenuButton>
          <MenuButton
            onClick={addImage}
            title="Add Image"
          >
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <MinusSquare size={18} />
          </MenuButton>
        </div>

        {/* History */}
        <div className="flex items-center gap-1 pl-2">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </MenuButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <div className="border-t border-gray-200 px-4 py-2 text-sm text-gray-500 bg-gray-50 flex justify-between">
        <span>{editor.storage.characterCount.characters()} / {editor.storage.characterCount.limit} characters</span>
        <span>{editor.storage.characterCount.words()} words</span>
      </div>
    </div>
  );
};

export default RichTextEditor;