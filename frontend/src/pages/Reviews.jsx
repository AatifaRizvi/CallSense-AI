import React, { useEffect, useState } from 'react';
import { getReviews } from '../services/api';
import { Search, ChevronRight } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const SENTIMENT_COLORS = {
  Positive: 'text-green-400 bg-green-400/10',
  Negative: 'text-red-400 bg-red-400/10',
  Neutral:  'text-yellow-400 bg-yellow-400/10',
};

function Badge({ text, colorMap }) {
  const cls = colorMap[text] || 'text-gray-400 bg-gray-400/10';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
}

// Check if title is raw review text
function isRawTitle(title) {
  if (!title) return true;
  if (title.length > 60) return true;
  const bad = ['review #', 'review#', 'review_text', 'untitled',
               'this product', 'very poor', 'average product',
               'great product', 'i bought', 'i have been'];
  const low = title.toLowerCase().trim();
  return bad.some(b => low.startsWith(b));
}

function Reviews() {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sentiment, setSentiment] = useState('');
  const [category, setCategory]   = useState('');
  const [language, setLanguage]   = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    getReviews({ search, sentiment, category, language, page, limit: 20 })
      .then(res => setReviews(res.data.results))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      fetchReviews();
    }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const getDisplayTitle = (review) => {
    if (!isRawTitle(review.title)) return review.title;
    // Fallback: short preview of review text
    return review.input_text?.slice(0, 50) + '...' || review.record_id;
  };

  return (
    <div className="relative p-6 space-y-4">
      <AnimatedBackground dark={true} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Reviews</h1>
        <p className="text-white/40 text-sm mt-1">All analyzed customer reviews</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={sentiment}
          onChange={e => setSentiment(e.target.value)}
          className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500 [&>option]:bg-[#1e293b] [&>option]:text-white"
        >
          <option value="">All Sentiments</option>
          <option value="Positive">Positive</option>
          <option value="Negative">Negative</option>
          <option value="Neutral">Neutral</option>
        </select>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500 [&>option]:bg-[#1e293b] [&>option]:text-white"
        >
          <option value="">All Categories</option>
          <option value="Product Quality">Product Quality</option>
          <option value="Customer Service">Customer Service</option>
          <option value="Pricing">Pricing</option>
          <option value="Delivery">Delivery</option>
          <option value="General Feedback">General Feedback</option>
          <option value="Feature Request">Feature Request</option>
        </select>

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500 [&>option]:bg-[#1e293b] [&>option]:text-white"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Hinglish">Hinglish</option>
        </select>

        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table + Detail */}
      <div className="flex flex-col lg:flex-row gap-4">

        <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm animate-pulse">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No reviews found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Review ID</th>
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Title / Preview</th>
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Language</th>
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Sentiment</th>
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Category</th>
                    <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Risk</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr
                      key={review.record_id}
                      onClick={() => setSelected(review)}
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${selected?.record_id === review.record_id ? 'bg-indigo-500/10' : ''}`}
                    >
                      <td className="px-4 py-3 text-white text-sm font-medium">{review.record_id}</td>
                      <td className="px-4 py-3 text-white/70 text-sm max-w-[220px] truncate">
                        {getDisplayTitle(review)}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-sm">{review.language}</td>
                      <td className="px-4 py-3"><Badge text={review.sentiment} colorMap={SENTIMENT_COLORS} /></td>
                      <td className="px-4 py-3 text-white/60 text-sm">{review.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${review.risk_level === 'High' ? 'text-red-400' : review.risk_level === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {review.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} className="text-white/20" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-white/40 hover:text-white text-sm disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-white/40 text-xs">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={reviews.length < 20}
              className="text-white/40 hover:text-white text-sm disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-80 bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[600px]">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                {!isRawTitle(selected.title) ? selected.title : selected.record_id}
              </h3>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Sentiment', value: selected.sentiment },
                { label: 'Category',  value: selected.category },
                { label: 'Language',  value: selected.language },
                { label: 'Risk',      value: selected.risk_level },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-white/40 text-xs mb-1">{label}</p>
                  <p className="text-white text-sm">{value || '—'}</p>
                </div>
              ))}

              <div>
                <p className="text-white/40 text-xs mb-1">Intent</p>
                <p className="text-white/80 text-xs leading-relaxed">{selected.intent || '—'}</p>
              </div>

              <div>
                <p className="text-white/40 text-xs mb-1">Summary</p>
                <p className="text-white/80 text-xs leading-relaxed">{selected.summary || '—'}</p>
              </div>

              <div>
                <p className="text-white/40 text-xs mb-1">Objection</p>
                <p className="text-white/80 text-xs leading-relaxed">{selected.objection || '—'}</p>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                <p className="text-indigo-400/60 text-xs mb-1">Action Item</p>
                <p className="text-indigo-300 text-xs leading-relaxed">{selected.action_item || '—'}</p>
              </div>

              <div>
                <p className="text-white/40 text-xs mb-1">Review Text</p>
                <p className="text-white/60 text-xs leading-relaxed line-clamp-6">{selected.input_text}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
