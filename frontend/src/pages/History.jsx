import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import { Clock, FileText, Mic } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const SENTIMENT_COLORS = {
  Positive: 'text-green-400 bg-green-400/10',
  Negative: 'text-red-400 bg-red-400/10',
  Neutral:  'text-yellow-400 bg-yellow-400/10',
};

function Badge({ text, colorMap }) {
  const cls = colorMap?.[text] || 'text-gray-400 bg-gray-400/10';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
}

function History() {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data.results || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="relative p-6 space-y-4">
      <AnimatedBackground dark={true} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">History</h1>
        <p className="text-white/40 text-sm mt-1">
          Your recent analysis results
        </p>
      </div>

      {loading ? (
        <div className="text-center text-white/40 text-sm py-20 animate-pulse">
          Loading history...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <Clock size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No analysis history yet</p>
          <p className="text-white/20 text-xs mt-1">
            Go to Analyze page to start analyzing calls or reviews
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">

          {/* List */}
          <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Type</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Input</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Sentiment</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Category</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                      selected?.id === item.id ? 'bg-indigo-500/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        item.source_type === 'call'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.source_type === 'call'
                          ? <Mic size={14} />
                          : <FileText size={14} />
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm max-w-[200px] truncate">
                      {item.filename || item.input_text?.slice(0, 50) + '...'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={item.sentiment} colorMap={SENTIMENT_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-full lg:w-80 bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">
                  {selected.source_type === 'call' ? '📞 Call Analysis' : '⭐ Review Analysis'}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-white/30 hover:text-white text-xs"
                >✕</button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Sentiment',  value: selected.sentiment },
                  { label: 'Category',   value: selected.category },
                  { label: 'Outcome',    value: selected.outcome },
                  { label: 'Risk Level', value: selected.risk_level },
                  { label: 'Language',   value: selected.language_detected },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-white/40 text-xs mb-1">{label}</p>
                    <p className="text-white text-sm">{value || '—'}</p>
                  </div>
                ))}

                <div>
                  <p className="text-white/40 text-xs mb-1">Summary</p>
                  <p className="text-white/80 text-xs leading-relaxed">{selected.summary}</p>
                </div>

                <div>
                  <p className="text-white/40 text-xs mb-1">Objection</p>
                  <p className="text-white/80 text-xs leading-relaxed">{selected.objection}</p>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                  <p className="text-indigo-400/60 text-xs mb-1">Action Item</p>
                  <p className="text-indigo-300 text-xs">{selected.action_item}</p>
                </div>

                <div>
                  <p className="text-white/40 text-xs mb-1">Analyzed on</p>
                  <p className="text-white/60 text-xs">{formatDate(selected.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
