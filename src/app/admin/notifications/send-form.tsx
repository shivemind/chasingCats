'use client';

import { useState } from 'react';

export function SendPushForm({ disabled }: { disabled: boolean }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sendToAll, setSendToAll] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url, sendToAll })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
        setTitle('');
        setBody('');
        setUrl('/');
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to send notification' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          required
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notification message"
          required
          rows={3}
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">
          Link URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/"
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="sendToAll"
          checked={sendToAll}
          onChange={(e) => setSendToAll(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-neon-cyan focus:ring-neon-cyan"
        />
        <label htmlFor="sendToAll" className="text-sm text-white/70">
          Send to all subscribers
        </label>
      </div>

      {result && (
        <div className={`rounded-xl p-3 text-sm ${
          result.success 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Send Notification'}
      </button>
    </form>
  );
}
