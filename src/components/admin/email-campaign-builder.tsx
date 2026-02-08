'use client';

import { useState } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'marketing' | 'transactional' | 'newsletter';
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  template?: string;
  segment: string;
  scheduledFor?: string;
  sentAt?: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
  abTest?: {
    variantA: { subject: string; openRate: number };
    variantB: { subject: string; openRate: number };
    winner?: 'A' | 'B';
  };
}

interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  segments: { id: string; name: string; count: number }[];
  onSaveCampaign: (campaign: Partial<EmailCampaign>) => Promise<void>;
  onSendCampaign: (campaignId: string) => Promise<void>;
  onScheduleCampaign: (campaignId: string, date: string) => Promise<void>;
}

export function EmailCampaignBuilder({ templates, campaigns, segments, onSaveCampaign, onSendCampaign, onScheduleCampaign }: EmailCampaignBuilderProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'templates'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  
  // Create campaign state
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [enableAbTest, setEnableAbTest] = useState(false);
  const [subjectB, setSubjectB] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'sending': return 'bg-yellow-500/20 text-yellow-400';
      case 'sent': return 'bg-green-500/20 text-green-400';
    }
  };

  const handleCreateCampaign = async () => {
    await onSaveCampaign({
      name: campaignName,
      subject,
      segment: selectedSegment,
      status: 'draft',
      abTest: enableAbTest ? {
        variantA: { subject, openRate: 0 },
        variantB: { subject: subjectB, openRate: 0 },
      } : undefined,
    });
    // Reset form
    setCampaignName('');
    setSubject('');
    setContent('');
    setSelectedSegment('');
    setEnableAbTest(false);
    setSubjectB('');
    setActiveTab('campaigns');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Email Campaigns</h2>
          <p className="text-sm text-gray-400">Create and manage email campaigns</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 font-medium text-white"
        >
          + New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['campaigns', 'create', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              activeTab === tab ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Segment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stats</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{campaign.name}</p>
                    <p className="text-xs text-gray-500">{campaign.subject}</p>
                    {campaign.abTest && (
                      <span className="text-xs text-neon-purple">A/B Test</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{campaign.segment}</td>
                  <td className="px-4 py-3">
                    {campaign.stats ? (
                      <div className="text-xs">
                        <p className="text-white">{campaign.stats.sent.toLocaleString()} sent</p>
                        <p className="text-gray-500">
                          {((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}% opened
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {campaign.status === 'draft' && (
                        <>
                          <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onSendCampaign(campaign.id)}
                            className="rounded-lg bg-neon-cyan px-3 py-1 text-xs text-black"
                          >
                            Send
                          </button>
                        </>
                      )}
                      {campaign.status === 'sent' && (
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="February Newsletter"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="🎉 New features just dropped!"
              />
            </div>
            
            {/* A/B Testing */}
            <div className="rounded-lg bg-white/5 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAbTest}
                  onChange={(e) => setEnableAbTest(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="text-white font-medium">Enable A/B Testing</p>
                  <p className="text-xs text-gray-500">Test two subject lines</p>
                </div>
              </label>
              {enableAbTest && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-2">Subject B</label>
                  <input
                    type="text"
                    value={subjectB}
                    onChange={(e) => setSubjectB(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="Check out what's new!"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Segment</label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                <option value="">Select a segment...</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.count.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                rows={10}
                placeholder="Write your email content here... (HTML supported)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateCampaign}
                className="flex-1 rounded-lg border border-white/10 py-2 text-white hover:bg-white/10"
              >
                Save as Draft
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black"
              >
                {scheduleDate ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-bold text-white mb-4">Email Preview</h3>
            <div className="rounded-lg bg-white p-6">
              <div className="border-b pb-4 mb-4">
                <p className="text-sm text-gray-500">From: ChasingCats &lt;hello@chasingcats.com&gt;</p>
                <p className="text-sm text-gray-500">Subject: {subject || 'Your subject line...'}</p>
              </div>
              <div className="prose prose-sm max-w-none">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-gray-400 italic">Your email content will appear here...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{template.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    template.type === 'marketing' ? 'bg-neon-purple/20 text-neon-purple' :
                    template.type === 'newsletter' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {template.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">{template.subject}</p>
              <button
                onClick={() => {
                  setSubject(template.subject);
                  setContent(template.content);
                  setActiveTab('create');
                }}
                className="w-full rounded-lg bg-white/10 py-2 text-sm text-white hover:bg-white/20"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Stats Modal */}
      {selectedCampaign && selectedCampaign.stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">{selectedCampaign.name}</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{selectedCampaign.stats.sent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Sent</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-neon-cyan">
                    {((selectedCampaign.stats.opened / selectedCampaign.stats.sent) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Open Rate</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-neon-purple">
                    {((selectedCampaign.stats.clicked / selectedCampaign.stats.opened) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Click Rate</p>
                </div>
              </div>
              
              {selectedCampaign.abTest && (
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm font-medium text-white mb-3">A/B Test Results</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">A: {selectedCampaign.abTest.variantA.subject}</span>
                      <span className={selectedCampaign.abTest.winner === 'A' ? 'text-green-400' : 'text-white'}>
                        {selectedCampaign.abTest.variantA.openRate}% open rate
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">B: {selectedCampaign.abTest.variantB.subject}</span>
                      <span className={selectedCampaign.abTest.winner === 'B' ? 'text-green-400' : 'text-white'}>
                        {selectedCampaign.abTest.variantB.openRate}% open rate
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">{selectedCampaign.stats.delivered.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400">{selectedCampaign.stats.unsubscribed}</p>
                  <p className="text-xs text-gray-500">Unsubscribed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-400">{selectedCampaign.stats.bounced}</p>
                  <p className="text-xs text-gray-500">Bounced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
