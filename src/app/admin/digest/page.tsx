import { isEmailAvailable, getDigestStats, generateDigestContent, buildDigestEmail } from '@/lib/digest';

export default async function AdminDigestPage() {
  const isAvailable = isEmailAvailable();
  
  let stats = { totalSubscribers: 0, weeklyCount: 0, dailyCount: 0 };
  let previewHtml = '';
  
  if (isAvailable) {
    stats = await getDigestStats();
    // Generate preview
    const content = await generateDigestContent();
    previewHtml = buildDigestEmail('Preview User', content, {
      includeNewContent: true,
      includeChallenges: true,
      includeTips: true
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Weekly Digest</h1>
        <p className="text-white/60 mt-1">Manage email digest settings and preview content</p>
      </div>

      {/* Status */}
      <div className={`rounded-xl p-6 ${
        isAvailable 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-yellow-500/10 border border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h2 className="text-lg font-semibold text-white">
            {isAvailable ? 'Email Service Active' : 'Email Service Not Configured'}
          </h2>
        </div>
        {!isAvailable && (
          <div className="mt-3">
            <p className="text-white/60 text-sm">
              To enable email digests, add one of the following environment variables:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-white/50">
              <li><code className="bg-white/10 px-2 py-0.5 rounded">RESEND_API_KEY</code> - For Resend</li>
              <li><code className="bg-white/10 px-2 py-0.5 rounded">SENDGRID_API_KEY</code> - For SendGrid</li>
            </ul>
          </div>
        )}
      </div>

      {isAvailable && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-white">{stats.totalSubscribers}</div>
              <div className="text-sm text-white/50">Total Subscribers</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-neon-purple">{stats.weeklyCount}</div>
              <div className="text-sm text-white/50">Weekly Digests</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-neon-cyan">{stats.dailyCount}</div>
              <div className="text-sm text-white/50">Daily Digests</div>
            </div>
          </div>

          {/* Cron Setup */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-3">⏰ Automated Sending</h2>
            <p className="text-white/60 text-sm mb-4">
              Set up a cron job to send digests automatically. Call these endpoints with your CRON_SECRET:
            </p>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">Weekly (Sunday mornings)</p>
                <code className="text-sm text-neon-cyan break-all">
                  GET /api/cron/digest?frequency=WEEKLY
                </code>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">Daily</p>
                <code className="text-sm text-neon-cyan break-all">
                  GET /api/cron/digest?frequency=DAILY
                </code>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-3">
              Add header: <code className="bg-white/10 px-1 rounded">Authorization: Bearer YOUR_CRON_SECRET</code>
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">📧 Email Preview</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                <span className="text-sm text-white/50">Preview of weekly digest email</span>
              </div>
              <div className="bg-[#0a0a1a] p-4">
                <div 
                  className="max-w-[600px] mx-auto"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Info */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-3">About Weekly Digest</h2>
        <div className="text-sm text-white/60 space-y-2">
          <p>
            The weekly digest automatically includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>New content published in the past week</li>
            <li>Active and voting photo challenges</li>
            <li>A random wildlife photography tip</li>
          </ul>
          <p className="mt-3">
            Users can customize their preferences to include/exclude any of these sections.
          </p>
        </div>
      </div>
    </div>
  );
}
