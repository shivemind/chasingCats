'use client';

import { useState, useEffect, useCallback } from 'react';

export interface VideoNote {
  id: string;
  timestamp: number;
  text: string;
  createdAt: string;
}

interface VideoNotesProps {
  contentId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function VideoNotes({ contentId, currentTime, onSeek }: VideoNotesProps) {
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`notes_${contentId}`);
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, [contentId]);

  // Save notes to localStorage
  const saveNotes = useCallback((updatedNotes: VideoNote[]) => {
    localStorage.setItem(`notes_${contentId}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  }, [contentId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: VideoNote = {
      id: Date.now().toString(),
      timestamp: Math.floor(currentTime),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, note].sort((a, b) => a.timestamp - b.timestamp);
    saveNotes(updatedNotes);
    setNewNote('');
    setIsAdding(false);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
  };

  const editNote = (id: string, text: string) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, text } : n);
    saveNotes(updatedNotes);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          isOpen 
            ? 'bg-neon-cyan text-black' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Notes {notes.length > 0 && `(${notes.length})`}
      </button>

      {/* Notes panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-deep-space shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="font-semibold text-white">My Notes</h3>
            <button
              onClick={() => {
                setIsAdding(true);
                setNewNote('');
              }}
              className="flex items-center gap-1 text-sm text-neon-cyan hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add at {formatTime(currentTime)}
            </button>
          </div>

          {/* Add note form */}
          {isAdding && (
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-neon-cyan">
                <span className="rounded bg-neon-cyan/20 px-2 py-0.5">{formatTime(currentTime)}</span>
              </div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note..."
                autoFocus
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none resize-none"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={addNote}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 text-sm font-medium text-black"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          <div className="max-h-64 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg className="mx-auto h-10 w-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Click &quot;Add&quot; to create your first note</p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onSeek={() => onSeek(note.timestamp)}
                  onDelete={() => deleteNote(note.id)}
                  onEdit={(text) => editNote(note.id, text)}
                />
              ))
            )}
          </div>

          {/* Export option */}
          {notes.length > 0 && (
            <div className="border-t border-white/10 p-3">
              <button className="w-full rounded-lg border border-white/10 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                Export Notes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoteItem({ 
  note, 
  onSeek, 
  onDelete, 
  onEdit 
}: { 
  note: VideoNote; 
  onSeek: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  return (
    <div className="group border-b border-white/5 p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onSeek}
          className="flex items-center gap-1.5 text-xs text-neon-cyan hover:underline"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {formatTime(note.timestamp)}
        </button>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50 resize-none"
            rows={2}
          />
          <div className="mt-2 flex gap-2">
            <button onClick={handleSave} className="text-xs text-neon-cyan hover:underline">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 hover:underline">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-300">{note.text}</p>
      )}
    </div>
  );
}

// Note markers on video timeline
export function NoteMarkers({ 
  notes, 
  duration, 
  onSeek 
}: { 
  notes: VideoNote[]; 
  duration: number;
  onSeek: (time: number) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
      {notes.map((note) => {
        const position = (note.timestamp / duration) * 100;
        
        return (
          <button
            key={note.id}
            onClick={() => onSeek(note.timestamp)}
            className="absolute top-0 h-full w-2 -translate-x-1/2 pointer-events-auto group"
            style={{ left: `${position}%` }}
          >
            <div className="h-full w-0.5 mx-auto bg-yellow-400 group-hover:w-1 transition-all" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 h-2 w-2 rounded-full bg-yellow-400" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-2 bg-deep-space border border-white/10 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="line-clamp-2">{note.text}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
