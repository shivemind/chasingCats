'use client';

import { useState, useRef } from 'react';

interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'callout' | 'code' | 'divider' | 'list';
  content: string;
  metadata?: Record<string, unknown>;
}

interface VisualContentEditorProps {
  initialContent?: ContentBlock[];
  onSave: (content: ContentBlock[]) => void;
  onPreview: () => void;
}

export function VisualContentEditor({ initialContent = [], onSave, onPreview }: VisualContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialContent);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substring(7);

  const addBlock = (type: ContentBlock['type'], afterId?: string) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      metadata: type === 'callout' ? { variant: 'info' } : undefined,
    };

    if (afterId) {
      const index = blocks.findIndex(b => b.id === afterId);
      setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)]);
    } else {
      setBlocks([...blocks, newBlock]);
    }

    setActiveBlockId(newBlock.id);
    setShowBlockMenu(false);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    setActiveBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    addBlock(block.type, id);
    const newBlockIndex = blocks.findIndex(b => b.id === id) + 1;
    updateBlock(blocks[newBlockIndex]?.id || '', { content: block.content, metadata: block.metadata });
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock('paragraph', blockId);
    }
    if (e.key === 'Backspace' && blocks.find(b => b.id === blockId)?.content === '') {
      e.preventDefault();
      const index = blocks.findIndex(b => b.id === blockId);
      if (blocks.length > 1) {
        deleteBlock(blockId);
        setActiveBlockId(blocks[index - 1]?.id || blocks[0]?.id);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-white/10 bg-deep-space/95 backdrop-blur-md p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className="flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 text-sm font-medium text-black"
          >
            + Add Block
          </button>
          <div className="h-6 w-px bg-white/10" />
          <ToolbarButton icon="B" tooltip="Bold" onClick={() => document.execCommand('bold')} />
          <ToolbarButton icon="I" tooltip="Italic" onClick={() => document.execCommand('italic')} />
          <ToolbarButton icon="U" tooltip="Underline" onClick={() => document.execCommand('underline')} />
          <ToolbarButton icon="🔗" tooltip="Link" onClick={() => {
            const url = prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
          }} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            👁️ Preview
          </button>
          <button
            onClick={() => onSave(blocks)}
            className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-sm font-medium text-white"
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Block Menu Dropdown */}
      {showBlockMenu && (
        <div className="absolute z-20 rounded-xl border border-white/10 bg-deep-space p-2 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            <BlockTypeButton icon="H" label="Heading" onClick={() => addBlock('heading')} />
            <BlockTypeButton icon="¶" label="Paragraph" onClick={() => addBlock('paragraph')} />
            <BlockTypeButton icon="🖼️" label="Image" onClick={() => addBlock('image')} />
            <BlockTypeButton icon="🎬" label="Video" onClick={() => addBlock('video')} />
            <BlockTypeButton icon="💡" label="Callout" onClick={() => addBlock('callout')} />
            <BlockTypeButton icon="{ }" label="Code" onClick={() => addBlock('code')} />
            <BlockTypeButton icon="—" label="Divider" onClick={() => addBlock('divider')} />
            <BlockTypeButton icon="•" label="List" onClick={() => addBlock('list')} />
          </div>
        </div>
      )}

      {/* Editor Canvas */}
      <div ref={editorRef} className="min-h-[500px] rounded-xl border border-white/10 bg-white/5 p-6">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <p className="text-lg">Start building your content</p>
            <p className="text-sm mt-2">Click &quot;+ Add Block&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => (
              <EditorBlock
                key={block.id}
                block={block}
                isActive={activeBlockId === block.id}
                onFocus={() => setActiveBlockId(block.id)}
                onChange={(content) => updateBlock(block.id, { content })}
                onMetadataChange={(metadata) => updateBlock(block.id, { metadata: { ...block.metadata, ...metadata } })}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                onDuplicate={() => duplicateBlock(block.id)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Block count */}
      <div className="text-sm text-gray-500">
        {blocks.length} block{blocks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function ToolbarButton({ icon, tooltip, onClick }: { icon: string; tooltip: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10"
    >
      {icon}
    </button>
  );
}

function BlockTypeButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-white/10"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </button>
  );
}

interface EditorBlockProps {
  block: ContentBlock;
  isActive: boolean;
  onFocus: () => void;
  onChange: (content: string) => void;
  onMetadataChange: (metadata: Record<string, unknown>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function EditorBlock({
  block,
  isActive,
  onFocus,
  onChange,
  onMetadataChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onKeyDown,
}: EditorBlockProps) {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder="Heading..."
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 outline-none"
          />
        );

      case 'paragraph':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder="Write something..."
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-600 outline-none resize-none"
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              placeholder="Image URL..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
            {block.content && (
              <img src={block.content} alt="" className="max-h-64 rounded-lg object-cover" />
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              placeholder="Video URL (YouTube, Vimeo)..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
            {block.content && (
              <div className="aspect-video rounded-lg bg-black flex items-center justify-center">
                <span className="text-gray-500">Video Preview</span>
              </div>
            )}
          </div>
        );

      case 'callout':
        const variant = block.metadata?.variant as string || 'info';
        const variantStyles = {
          info: 'bg-blue-500/10 border-blue-500/30',
          warning: 'bg-yellow-500/10 border-yellow-500/30',
          success: 'bg-green-500/10 border-green-500/30',
          error: 'bg-red-500/10 border-red-500/30',
        };
        return (
          <div className={`rounded-lg border p-4 ${variantStyles[variant as keyof typeof variantStyles]}`}>
            <select
              value={variant}
              onChange={(e) => onMetadataChange({ variant: e.target.value })}
              className="mb-2 rounded bg-white/10 px-2 py-1 text-xs text-white"
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✅ Success</option>
              <option value="error">❌ Error</option>
            </select>
            <textarea
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              placeholder="Callout content..."
              rows={2}
              className="w-full bg-transparent text-white placeholder-gray-600 outline-none resize-none"
            />
          </div>
        );

      case 'code':
        return (
          <div className="rounded-lg bg-black/50 p-4">
            <textarea
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              placeholder="// Code here..."
              rows={5}
              className="w-full bg-transparent font-mono text-sm text-green-400 placeholder-gray-600 outline-none resize-none"
            />
          </div>
        );

      case 'divider':
        return <hr className="border-white/10" />;

      case 'list':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
            rows={4}
            className="w-full bg-transparent text-white placeholder-gray-600 outline-none resize-none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative rounded-lg border p-4 transition-colors ${
        isActive ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-transparent hover:border-white/10'
      }`}
    >
      {/* Block controls */}
      <div className={`absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button onClick={onMoveUp} className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white">↑</button>
        <button onClick={onMoveDown} className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white">↓</button>
      </div>

      <div className={`absolute -right-10 top-2 flex flex-col gap-1 transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button onClick={onDuplicate} className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white" title="Duplicate">📋</button>
        <button onClick={onDelete} className="rounded p-1 text-gray-500 hover:bg-red-500/20 hover:text-red-400" title="Delete">🗑️</button>
      </div>

      {/* Block type indicator */}
      <div className="absolute -top-2 left-2 rounded bg-white/10 px-2 py-0.5 text-[10px] text-gray-400 capitalize">
        {block.type}
      </div>

      {renderBlockContent()}
    </div>
  );
}
