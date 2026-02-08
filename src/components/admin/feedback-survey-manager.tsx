'use client';

import { useState } from 'react';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  questions: SurveyQuestion[];
  responses: number;
  createdAt: string;
  closesAt?: string;
}

interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'choice' | 'nps';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  answers: { questionId: string; answer: string | number }[];
  submittedAt: string;
}

interface NPSData {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  trend: { date: string; score: number }[];
}

interface FeedbackSurveyManagerProps {
  surveys: Survey[];
  responses: SurveyResponse[];
  npsData: NPSData;
  onCreateSurvey: (survey: Partial<Survey>) => Promise<void>;
  onUpdateSurvey: (surveyId: string, updates: Partial<Survey>) => Promise<void>;
  onDeleteSurvey: (surveyId: string) => Promise<void>;
}

export function FeedbackSurveyManager({ surveys, responses, npsData, onCreateSurvey, onUpdateSurvey, onDeleteSurvey }: FeedbackSurveyManagerProps) {
  const [activeTab, setActiveTab] = useState<'surveys' | 'responses' | 'nps' | 'create'>('surveys');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  
  // Create survey state
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: '',
    description: '',
    questions: [],
  });
  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
    type: 'rating',
    question: '',
    required: true,
    options: [],
  });

  const addQuestion = () => {
    if (!newQuestion.question) return;
    const question: SurveyQuestion = {
      id: Date.now().toString(),
      type: newQuestion.type || 'rating',
      question: newQuestion.question,
      required: newQuestion.required ?? true,
      options: newQuestion.options,
    };
    setNewSurvey({
      ...newSurvey,
      questions: [...(newSurvey.questions || []), question],
    });
    setNewQuestion({ type: 'rating', question: '', required: true, options: [] });
  };

  const handleCreateSurvey = async () => {
    await onCreateSurvey(newSurvey);
    setNewSurvey({ title: '', description: '', questions: [] });
    setActiveTab('surveys');
  };

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-red-500/20 text-red-400';
    }
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-400';
    if (score >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Feedback & Surveys</h2>
          <p className="text-sm text-gray-400">Collect feedback and track NPS</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 font-medium text-white"
        >
          + New Survey
        </button>
      </div>

      {/* NPS Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 text-sm mb-1">NPS Score</p>
          <p className={`text-4xl font-bold ${getNPSColor(npsData.score)}`}>{npsData.score}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 text-sm mb-1">Promoters (9-10)</p>
          <p className="text-2xl font-bold text-green-400">{npsData.promoters}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 text-sm mb-1">Passives (7-8)</p>
          <p className="text-2xl font-bold text-yellow-400">{npsData.passives}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 text-sm mb-1">Detractors (0-6)</p>
          <p className="text-2xl font-bold text-red-400">{npsData.detractors}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['surveys', 'responses', 'nps', 'create'] as const).map((tab) => (
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

      {/* Surveys Tab */}
      {activeTab === 'surveys' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{survey.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(survey.status)}`}>
                    {survey.status}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteSurvey(survey.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">{survey.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{survey.questions.length} questions</span>
                <span>{survey.responses} responses</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSurvey(survey)}
                  className="flex-1 rounded-lg bg-white/10 py-2 text-xs text-white hover:bg-white/20"
                >
                  View Results
                </button>
                {survey.status === 'draft' && (
                  <button
                    onClick={() => onUpdateSurvey(survey.id, { status: 'active' })}
                    className="flex-1 rounded-lg bg-neon-cyan py-2 text-xs text-black"
                  >
                    Activate
                  </button>
                )}
                {survey.status === 'active' && (
                  <button
                    onClick={() => onUpdateSurvey(survey.id, { status: 'closed' })}
                    className="flex-1 rounded-lg bg-red-500/20 py-2 text-xs text-red-400"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Survey</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Answers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => {
                const survey = surveys.find(s => s.id === response.surveyId);
                return (
                  <tr key={response.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white">{response.userName}</p>
                      <p className="text-xs text-gray-500">{response.userId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{survey?.title || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {response.answers.slice(0, 3).map((ans, i) => (
                          <span key={i} className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                            {typeof ans.answer === 'number' ? `${ans.answer}/10` : ans.answer.slice(0, 15)}
                          </span>
                        ))}
                        {response.answers.length > 3 && (
                          <span className="text-xs text-gray-500">+{response.answers.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* NPS Tab */}
      {activeTab === 'nps' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">NPS Trend</h3>
            <div className="h-48 flex items-end gap-2">
              {npsData.trend.map((point, i) => {
                const height = Math.max(10, ((point.score + 100) / 200) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${getNPSColor(point.score)} bg-current opacity-50 group-hover:opacity-100`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block">
                        <div className="bg-deep-space border border-white/10 rounded px-2 py-1 text-xs text-white">
                          {point.score}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Score Distribution</h3>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 11 }, (_, i) => {
                const percentage = Math.random() * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${
                        i <= 6 ? 'bg-red-500' : i <= 8 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ height: `${percentage}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{i}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Survey Title</label>
              <input
                type="text"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="Customer Satisfaction Survey"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={newSurvey.description}
                onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                rows={2}
                placeholder="Help us improve your experience..."
              />
            </div>

            {/* Add Question */}
            <div className="rounded-lg bg-white/5 p-4 space-y-3">
              <p className="text-sm font-medium text-white">Add Question</p>
              <select
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as SurveyQuestion['type'] })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                <option value="rating">Rating (1-10)</option>
                <option value="nps">NPS (0-10)</option>
                <option value="text">Text Response</option>
                <option value="choice">Multiple Choice</option>
              </select>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="Enter your question..."
              />
              {newQuestion.type === 'choice' && (
                <input
                  type="text"
                  value={newQuestion.options?.join(', ')}
                  onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value.split(', ') })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Option 1, Option 2, Option 3"
                />
              )}
              <button
                onClick={addQuestion}
                disabled={!newQuestion.question}
                className="w-full rounded-lg bg-white/10 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50"
              >
                + Add Question
              </button>
            </div>

            <button
              onClick={handleCreateSurvey}
              disabled={!newSurvey.title || !newSurvey.questions?.length}
              className="w-full rounded-lg bg-neon-cyan py-3 font-medium text-black disabled:opacity-50"
            >
              Create Survey
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-bold text-white mb-4">Survey Preview</h3>
            {newSurvey.questions && newSurvey.questions.length > 0 ? (
              <div className="space-y-4">
                {newSurvey.questions.map((q, i) => (
                  <div key={q.id} className="rounded-lg bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <p className="text-white">
                        {i + 1}. {q.question}
                        {q.required && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      <button
                        onClick={() => setNewSurvey({
                          ...newSurvey,
                          questions: newSurvey.questions?.filter(qu => qu.id !== q.id),
                        })}
                        className="text-gray-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{q.type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Add questions to see preview</p>
            )}
          </div>
        </div>
      )}

      {/* Survey Results Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-deep-space max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 p-4 sticky top-0 bg-deep-space">
              <h3 className="font-bold text-white">{selectedSurvey.title} - Results</h3>
              <button onClick={() => setSelectedSurvey(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-neon-cyan">{selectedSurvey.responses}</p>
                <p className="text-gray-500">Total Responses</p>
              </div>
              {selectedSurvey.questions.map((q, i) => (
                <div key={q.id} className="rounded-lg bg-white/5 p-4">
                  <p className="text-white mb-3">{i + 1}. {q.question}</p>
                  {q.type === 'rating' || q.type === 'nps' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-neon-cyan">8.2</span>
                      <span className="text-gray-500">avg rating</span>
                    </div>
                  ) : q.type === 'choice' ? (
                    <div className="space-y-2">
                      {q.options?.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="flex-1 h-4 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-neon-cyan"
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-white w-20">{opt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">View individual responses for text answers</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
