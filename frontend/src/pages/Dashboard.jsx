import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import { useProfile } from '../hooks/useProfile';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  PhoneCall, Star, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Zap, Lock
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const SENTIMENT_COLORS = {
  Positive: '#22c55e',
  Negative: '#ef4444',
  Neutral:  '#f59e0b',
};

const OUTCOME_COLORS = {
  'Closed Won':          '#22c55e',
  'Closed Lost':         '#ef4444',
  'Follow-up Scheduled': '#6366f1',
  'Demo Scheduled':      '#f59e0b',
  'Proposal Sent':       '#06b6d4',
  'In Progress':         '#8b5cf6',
  'No Action':           '#64748b',
};

// Sample placeholder data shown (blurred) to brand-new users with no analyzed data yet
const SAMPLE_SENTIMENT = [
  { name: 'Positive', value: 58 },
  { name: 'Negative', value: 22 },
  { name: 'Neutral',  value: 20 },
];
const SAMPLE_OUTCOME = [
  { name: 'Closed Won',          value: 34 },
  { name: 'Follow-up Scheduled', value: 21 },
  { name: 'Demo Scheduled',      value: 15 },
  { name: 'Closed Lost',         value: 12 },
];
const SAMPLE_CATEGORY = [
  { name: 'Pricing',           value: 28 },
  { name: 'Product Quality',   value: 24 },
  { name: 'Customer Service',  value: 19 },
  { name: 'Delivery',          value: 14 },
  { name: 'Feature Request',   value: 9 },
  { name: 'General Feedback',  value: 6 },
];
const SAMPLE_LANGUAGE = [
  { name: 'English',  value: 52 },
  { name: 'Hindi',    value: 26 },
  { name: 'Hinglish', value: 22 },
];

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-sm">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

function tooltipStyle() {
  return {
    contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' },
    labelStyle: { color: '#fff' },
    itemStyle: { color: '#94a3b8' },
  };
}

/** The actual chart grid — used for both real data and the blurred sample preview */
function ChartsGrid({ sentimentData, outcomeData, categoryData, languageData }) {
  const ts = tooltipStyle();
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sentiment Pie */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Sentiment Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {sentimentData.map((entry) => (
                  <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip {...ts} />
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome Bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Call Outcomes</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={outcomeData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip {...ts} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {outcomeData.map((entry) => (
                  <Cell key={entry.name} fill={OUTCOME_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Category Bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Top Categories</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip {...ts} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Language Pie */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Language Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={languageData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {languageData.map((_, i) => (
                  <Cell key={i} fill={['#6366f1', '#22c55e', '#f59e0b'][i % 3]} />
                ))}
              </Pie>
              <Tooltip {...ts} />
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, isAdmin } = useProfile();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setStatsLoading(false));
  }, []);

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <div className="relative flex items-center justify-center h-full min-h-[60vh]">
        <AnimatedBackground dark={true} />
        <div className="text-white/50 text-sm animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Admins always see the full dashboard. If stats failed to load for an admin, show error.
  if (isAdmin && !stats) {
    return (
      <div className="relative flex items-center justify-center h-full min-h-[60vh]">
        <AnimatedBackground dark={true} />
        <div className="text-red-400 text-sm">Failed to load stats</div>
      </div>
    );
  }

  const hasData = isAdmin ? true : (stats?.total > 0);

  // Real chart data (only meaningful when hasData is true)
  const sentimentData = stats
    ? Object.entries(stats.sentiment || {}).map(([name, value]) => ({ name, value }))
    : [];
  const outcomeData = stats
    ? Object.entries(stats.outcome || {}).map(([name, value]) => ({ name, value }))
    : [];
  const categoryData = stats
    ? Object.entries(stats.category || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))
    : [];
  const languageData = stats
    ? Object.entries(stats.language || {})
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .reduce((acc, curr) => {
          const existing = acc.find(a => a.name.toLowerCase() === curr.name.toLowerCase());
          if (existing) existing.value += curr.value;
          else acc.push(curr);
          return acc;
        }, [])
    : [];

  return (
    <div className="relative p-6 space-y-6">
      <AnimatedBackground dark={true} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          {isAdmin ? 'Sales intelligence overview — all users' : 'Your sales intelligence overview'}
        </p>
      </div>

      {/* KPI Cards — only meaningful once there's data */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Analyzed"
            value={stats.total?.toLocaleString()}
            subtitle="Calls + Reviews"
            icon={TrendingUp}
            color="bg-indigo-500/20"
          />
          <StatCard
            title="Total Calls"
            value={stats.total_calls}
            subtitle="Sales calls"
            icon={PhoneCall}
            color="bg-blue-500/20"
          />
          <StatCard
            title="Total Reviews"
            value={stats.total_reviews?.toLocaleString()}
            subtitle="Customer reviews"
            icon={Star}
            color="bg-yellow-500/20"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.win_rate}%`}
            subtitle="Closed Won calls"
            icon={CheckCircle}
            color="bg-green-500/20"
          />
        </div>
      )}

      {/* Charts — real for admins/users with data, blurred sample + CTA for new users */}
      {hasData ? (
        <ChartsGrid
          sentimentData={sentimentData}
          outcomeData={outcomeData}
          categoryData={categoryData}
          languageData={languageData}
        />
      ) : (
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm opacity-50">
            <ChartsGrid
              sentimentData={SAMPLE_SENTIMENT}
              outcomeData={SAMPLE_OUTCOME}
              categoryData={SAMPLE_CATEGORY}
              languageData={SAMPLE_LANGUAGE}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#0f172a]/90 border border-white/10 rounded-2xl p-8 text-center max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Upload your first call to unlock insights
              </h3>
              <p className="text-white/40 text-sm mb-5">
                Analyze a sales call or customer review to see your real sentiment,
                outcome, and category breakdowns here.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                <Zap size={14} /> Analyze Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
