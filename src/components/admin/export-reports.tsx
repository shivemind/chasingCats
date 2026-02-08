'use client';

import { useState } from 'react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'users' | 'revenue' | 'content' | 'activity' | 'custom';
  fields: string[];
  schedule?: { frequency: 'daily' | 'weekly' | 'monthly'; time: string; recipients: string[] };
  lastGenerated?: string;
}

interface ExportReportsProps {
  templates: ReportTemplate[];
  onGenerateReport: (templateId: string, format: 'csv' | 'pdf' | 'xlsx') => Promise<void>;
  onSaveTemplate: (template: ReportTemplate) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onScheduleReport: (templateId: string, schedule: ReportTemplate['schedule']) => Promise<void>;
}

export function ExportReports({ templates, onGenerateReport, onSaveTemplate, onDeleteTemplate, onScheduleReport }: ExportReportsProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'scheduled'>('generate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Quick export state
  const [quickExportType, setQuickExportType] = useState<'users' | 'revenue' | 'content'>('users');
  const [quickExportFormat, setQuickExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [quickExportDateRange, setQuickExportDateRange] = useState('30d');

  // New template state
  const [newTemplate, setNewTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    type: 'users',
    fields: [],
  });

  // Schedule state
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleRecipients, setScheduleRecipients] = useState('');

  const availableFields: Record<string, string[]> = {
    users: ['Name', 'Email', 'Role', 'Tier', 'Status', 'Join Date', 'Last Active', 'Watch Time', 'Completed Lessons', 'XP', 'Level'],
    revenue: ['Transaction ID', 'Customer', 'Amount', 'Type', 'Date', 'Plan', 'Status', 'Stripe ID'],
    content: ['Title', 'Type', 'Views', 'Completions', 'Completion Rate', 'Watch Time', 'Engagement', 'Published Date'],
    activity: ['User', 'Action', 'Details', 'IP Address', 'Timestamp', 'Device'],
    custom: [],
  };

  const handleGenerateQuickReport = async () => {
    setIsGenerating('quick');
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(null);
    // Trigger download
  };

  const handleSaveSchedule = async () => {
    if (!showScheduleModal) return;
    await onScheduleReport(showScheduleModal, {
      frequency: scheduleFrequency,
      time: scheduleTime,
      recipients: scheduleRecipients.split(',').map(e => e.trim()),
    });
    setShowScheduleModal(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users': return '👥';
      case 'revenue': return '💰';
      case 'content': return '📚';
      case 'activity': return '📊';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Export & Reports</h2>
          <p className="text-sm text-gray-400">Generate and schedule reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['generate', 'templates', 'scheduled'] as const).map((tab) => (
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

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Export */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Export</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data Type</label>
                <select
                  value={quickExportType}
                  onChange={(e) => setQuickExportType(e.target.value as typeof quickExportType)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="users">Users</option>
                  <option value="revenue">Revenue</option>
                  <option value="content">Content Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <select
                  value={quickExportDateRange}
                  onChange={(e) => setQuickExportDateRange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Format</label>
                <div className="flex gap-2">
                  {(['csv', 'pdf', 'xlsx'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setQuickExportFormat(format)}
                      className={`flex-1 rounded-lg py-2 text-sm uppercase ${
                        quickExportFormat === format
                          ? 'bg-neon-cyan text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerateQuickReport}
                disabled={isGenerating === 'quick'}
                className="w-full rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-medium text-white disabled:opacity-50"
              >
                {isGenerating === 'quick' ? 'Generating...' : '📥 Download Report'}
              </button>
            </div>
          </div>

          {/* Recent Downloads */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Downloads</h3>
            <div className="space-y-3">
              {[
                { name: 'users_export_2024-02-01.csv', date: '2024-02-01', size: '1.2 MB' },
                { name: 'revenue_report_jan.pdf', date: '2024-01-31', size: '3.5 MB' },
                { name: 'content_analytics.xlsx', date: '2024-01-28', size: '2.1 MB' },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {file.name.endsWith('.csv') ? '📄' : file.name.endsWith('.pdf') ? '📕' : '📊'}
                    </span>
                    <div>
                      <p className="text-white text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.date} • {file.size}</p>
                    </div>
                  </div>
                  <button className="text-neon-cyan text-sm hover:underline">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-neon-cyan px-4 py-2 text-sm font-medium text-black"
            >
              + Create Template
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(template.type)}</span>
                    <div>
                      <p className="font-medium text-white">{template.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{template.type} report</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.fields.slice(0, 4).map((field) => (
                    <span key={field} className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                      {field}
                    </span>
                  ))}
                  {template.fields.length > 4 && (
                    <span className="text-xs text-gray-500">+{template.fields.length - 4} more</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onGenerateReport(template.id, 'csv')}
                    disabled={isGenerating === template.id}
                    className="flex-1 rounded-lg bg-white/10 py-2 text-xs text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    {isGenerating === template.id ? 'Generating...' : 'Generate'}
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(template.id)}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
                  >
                    ⏰
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Report</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Frequency</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Recipients</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Run</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.filter(t => t.schedule).map((template) => (
                <tr key={template.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(template.type)}</span>
                      <span className="text-white">{template.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{template.schedule?.frequency}</td>
                  <td className="px-4 py-3 text-gray-400">{template.schedule?.time}</td>
                  <td className="px-4 py-3 text-gray-400">{template.schedule?.recipients.length} recipients</td>
                  <td className="px-4 py-3 text-gray-400">
                    {template.lastGenerated ? new Date(template.lastGenerated).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setShowScheduleModal(template.id)}
                      className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {templates.filter(t => t.schedule).length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No scheduled reports. Create a template and schedule it to get started.
            </div>
          )}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">Create Report Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Monthly Users Report"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Export all user data with activity stats"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as ReportTemplate['type'], fields: [] })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="users">Users</option>
                  <option value="revenue">Revenue</option>
                  <option value="content">Content</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fields to Include</label>
                <div className="flex flex-wrap gap-2">
                  {availableFields[newTemplate.type || 'users'].map((field) => (
                    <button
                      key={field}
                      onClick={() => {
                        const fields = newTemplate.fields || [];
                        if (fields.includes(field)) {
                          setNewTemplate({ ...newTemplate, fields: fields.filter(f => f !== field) });
                        } else {
                          setNewTemplate({ ...newTemplate, fields: [...fields, field] });
                        }
                      }}
                      className={`rounded-lg px-3 py-1 text-xs ${
                        newTemplate.fields?.includes(field)
                          ? 'bg-neon-cyan text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSaveTemplate(newTemplate as ReportTemplate);
                    setShowCreateModal(false);
                    setNewTemplate({ name: '', description: '', type: 'users', fields: [] });
                  }}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">Schedule Report</h3>
              <button onClick={() => setShowScheduleModal(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value as typeof scheduleFrequency)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="admin@example.com, team@example.com"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(null)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
