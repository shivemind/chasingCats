'use client';

import { useState } from 'react';

interface RevenueData {
  mrr: number;
  mrrChange: number;
  arr: number;
  churnRate: number;
  churnChange: number;
  ltv: number;
  ltvChange: number;
  arpu: number;
  totalCustomers: number;
  newCustomers: number;
  churned: number;
  subscriptionBreakdown: { tier: string; count: number; revenue: number; color: string }[];
  revenueHistory: { date: string; mrr: number; newRevenue: number; churn: number }[];
  topCustomers: { name: string; email: string; ltv: number; tier: string; since: string }[];
  recentTransactions: { id: string; customer: string; amount: number; type: string; date: string }[];
}

interface RevenueAnalyticsProps {
  data: RevenueData;
  dateRange: '7d' | '30d' | '90d' | '12m';
  onDateRangeChange: (range: '7d' | '30d' | '90d' | '12m') => void;
}

export function RevenueAnalytics({ data, dateRange, onDateRangeChange }: RevenueAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'customers' | 'transactions'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatPercent = (value: number, showSign = true) => {
    const prefix = showSign && value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
          <p className="text-sm text-gray-400">Track your subscription revenue and growth</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '12m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`rounded-lg px-4 py-2 text-sm ${
                dateRange === range ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Monthly Recurring Revenue"
          value={formatCurrency(data.mrr)}
          change={data.mrrChange}
          sublabel={`ARR: ${formatCurrency(data.arr)}`}
          icon="💰"
          color="neon-cyan"
        />
        <MetricCard
          label="Customer LTV"
          value={formatCurrency(data.ltv)}
          change={data.ltvChange}
          sublabel={`ARPU: ${formatCurrency(data.arpu)}`}
          icon="📈"
          color="neon-purple"
        />
        <MetricCard
          label="Churn Rate"
          value={formatPercent(data.churnRate, false)}
          change={-data.churnChange}
          sublabel={`${data.churned} customers this period`}
          icon="📉"
          color={data.churnRate > 5 ? 'red' : 'green'}
          invertChange
        />
        <MetricCard
          label="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          sublabel={`+${data.newCustomers} new this period`}
          icon="👥"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {(['overview', 'subscriptions', 'customers', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-neon-cyan text-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
            <div className="h-64">
              <RevenueChart data={data.revenueHistory} />
            </div>
          </div>

          {/* Subscription Breakdown */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Subscription Mix</h3>
            <div className="space-y-4">
              {data.subscriptionBreakdown.map((tier) => (
                <div key={tier.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white capitalize">{tier.tier}</span>
                    <span className="text-gray-400">{tier.count} users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(tier.revenue / data.mrr) * 100}%`,
                          backgroundColor: tier.color,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium w-20 text-right">
                      {formatCurrency(tier.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total MRR</span>
                <span className="text-xl font-bold text-neon-cyan">{formatCurrency(data.mrr)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {data.subscriptionBreakdown.map((tier) => (
              <div key={tier.tier} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white capitalize">{tier.tier}</h4>
                  <span className="text-2xl" style={{ color: tier.color }}>●</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-white">{tier.count}</p>
                    <p className="text-sm text-gray-500">active subscriptions</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: tier.color }}>
                      {formatCurrency(tier.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">monthly revenue</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      ARPU: {formatCurrency(tier.revenue / tier.count || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white">Top Customers by LTV</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">LTV</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer Since</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((customer, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                      customer.tier === 'elite' ? 'bg-cat-eye/20 text-cat-eye' :
                      customer.tier === 'pro' ? 'bg-neon-purple/20 text-neon-purple' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-neon-cyan">{formatCurrency(customer.ltv)}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(customer.since).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white">Recent Transactions</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Transaction</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-white">{tx.customer}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      tx.type === 'subscription' ? 'bg-green-500/20 text-green-400' :
                      tx.type === 'refund' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${
                    tx.type === 'refund' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'refund' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  sublabel?: string;
  icon: string;
  color?: 'neon-cyan' | 'neon-purple' | 'green' | 'red';
  invertChange?: boolean;
}

function MetricCard({ label, value, change, sublabel, icon, color, invertChange }: MetricCardProps) {
  const colorClasses = {
    'neon-cyan': 'text-neon-cyan',
    'neon-purple': 'text-neon-purple',
    'green': 'text-green-400',
    'red': 'text-red-400',
  };

  const changeColor = change !== undefined
    ? (invertChange ? change < 0 : change >= 0) ? 'text-green-400' : 'text-red-400'
    : '';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
        {value}
      </p>
      <div className="flex items-center justify-between mt-2">
        {sublabel && <span className="text-xs text-gray-500">{sublabel}</span>}
        {change !== undefined && (
          <span className={`text-sm ${changeColor}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: RevenueData['revenueHistory'] }) {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data</div>;

  const maxMrr = Math.max(...data.map(d => d.mrr));
  
  return (
    <div className="h-full flex items-end gap-1">
      {data.map((point, i) => {
        const height = (point.mrr / maxMrr) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative">
              <div
                className="w-full bg-gradient-to-t from-neon-cyan/50 to-neon-cyan rounded-t transition-all group-hover:from-neon-cyan/70 group-hover:to-neon-cyan"
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block">
                <div className="bg-deep-space border border-white/10 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                  ${point.mrr.toLocaleString()}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
