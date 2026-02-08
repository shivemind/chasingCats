'use client';

import { useState } from 'react';

interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  avgTimeInStage: number;
  dropOffReasons?: { reason: string; count: number }[];
}

interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
}

interface UserFunnelAnalyticsProps {
  funnel: FunnelStage[];
  cohorts: CohortData[];
  conversionTrend: { date: string; rate: number }[];
  metrics: {
    signupToTrialRate: number;
    trialToConversionRate: number;
    overallConversionRate: number;
    avgTimeToConvert: number;
    churnRisk: number;
  };
}

export function UserFunnelAnalytics({ funnel, cohorts, conversionTrend, metrics }: UserFunnelAnalyticsProps) {
  const [activeView, setActiveView] = useState<'funnel' | 'cohorts' | 'trends'>('funnel');
  const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);

  const maxCount = Math.max(...funnel.map(s => s.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">User Funnel Analytics</h2>
          <p className="text-sm text-gray-400">Track user journey from signup to retention</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard
          label="Signup → Trial"
          value={`${metrics.signupToTrialRate.toFixed(1)}%`}
          color="neon-cyan"
        />
        <MetricCard
          label="Trial → Paid"
          value={`${metrics.trialToConversionRate.toFixed(1)}%`}
          color="neon-purple"
        />
        <MetricCard
          label="Overall Conversion"
          value={`${metrics.overallConversionRate.toFixed(1)}%`}
          color="cat-eye"
        />
        <MetricCard
          label="Avg Time to Convert"
          value={`${metrics.avgTimeToConvert}d`}
        />
        <MetricCard
          label="Churn Risk"
          value={`${metrics.churnRisk}%`}
          color={metrics.churnRisk > 10 ? 'red' : 'green'}
        />
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {(['funnel', 'cohorts', 'trends'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              activeView === view ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Funnel View */}
      {activeView === 'funnel' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {funnel.map((stage, i) => {
                const width = (stage.count / maxCount) * 100;
                return (
                  <div
                    key={stage.name}
                    className="cursor-pointer"
                    onClick={() => setSelectedStage(stage)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{stage.name}</span>
                      <span className="text-gray-400">
                        {stage.count.toLocaleString()} users
                      </span>
                    </div>
                    <div className="relative h-12">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple transition-all hover:opacity-80"
                        style={{ width: `${width}%` }}
                      />
                      {i < funnel.length - 1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
                          <span className={`text-sm ${
                            stage.conversionRate >= 50 ? 'text-green-400' :
                            stage.conversionRate >= 30 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {stage.conversionRate}% →
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Avg {stage.avgTimeInStage} days in stage
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Details */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            {selectedStage ? (
              <>
                <h3 className="text-lg font-bold text-white mb-4">{selectedStage.name}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Users in Stage</p>
                    <p className="text-2xl font-bold text-white">{selectedStage.count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-neon-cyan">{selectedStage.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Time in Stage</p>
                    <p className="text-2xl font-bold text-white">{selectedStage.avgTimeInStage} days</p>
                  </div>
                  
                  {selectedStage.dropOffReasons && (
                    <div className="mt-6">
                      <p className="text-gray-400 text-sm mb-3">Drop-off Reasons</p>
                      <div className="space-y-2">
                        {selectedStage.dropOffReasons.map((reason) => (
                          <div key={reason.reason} className="flex items-center justify-between">
                            <span className="text-white text-sm">{reason.reason}</span>
                            <span className="text-gray-400 text-sm">{reason.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Click a stage to see details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cohorts View */}
      {activeView === 'cohorts' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Retention Cohorts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-400">Cohort</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-400">Size</th>
                  {cohorts[0]?.retention.map((_, i) => (
                    <th key={i} className="px-3 py-2 text-center text-sm font-medium text-gray-400">
                      Week {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="border-t border-white/5">
                    <td className="px-3 py-2 text-white">{cohort.cohort}</td>
                    <td className="px-3 py-2 text-gray-400">{cohort.size}</td>
                    {cohort.retention.map((rate, i) => {
                      const intensity = rate / 100;
                      return (
                        <td key={i} className="px-3 py-2">
                          <div
                            className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(0, 217, 255, ${intensity})`,
                              color: intensity > 0.5 ? 'black' : 'white',
                            }}
                          >
                            {rate}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trends View */}
      {activeView === 'trends' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Conversion Rate Trend</h3>
          <div className="h-64 flex items-end gap-1">
            {conversionTrend.map((point, i) => {
              const height = point.rate;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${
                        point.rate >= 5 ? 'bg-green-500' :
                        point.rate >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      } group-hover:opacity-80`}
                      style={{ height: `${height * 10}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block">
                      <div className="bg-deep-space border border-white/10 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        {point.rate}%
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    'neon-cyan': 'text-neon-cyan',
    'neon-purple': 'text-neon-purple',
    'cat-eye': 'text-cat-eye',
    'green': 'text-green-400',
    'red': 'text-red-400',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
