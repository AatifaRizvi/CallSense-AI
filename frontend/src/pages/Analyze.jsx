import React, { useState, useRef } from 'react';
import { analyzeText, analyzeAudio, analyzeCsv, analyzeCsvDownload } from '../services/api';
import { supabase } from '../supabaseClient';
import { Zap, Upload, FileText, Loader, Mic, X, Download, Table } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const SENTIMENT_COLORS = {
  Positive: 'text-green-400 bg-green-400/10 border-green-400/20',
  Negative: 'text-red-400 bg-red-400/10 border-red-400/20',
  Neutral:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

const RISK_COLORS = {
  Low:    'text-green-400',
  Medium: 'text-yellow-400',
  High:   'text-red-400',
};

const SENTIMENT_BADGE = {
  Positive: 'text-green-400 bg-green-400/10',
  Negative: 'text-red-400 bg-red-400/10',
  Neutral:  'text-yellow-400 bg-yellow-400/10',
};

function ResultCard({ label, value, highlight }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight || 'text-white'}`}>{value || '—'}</p>
    </div>
  );
}

function Analyze() {
  // Main mode: 'call' or 'review'
  const [mode, setMode]           = useState('call');
  // Review sub-mode: 'text' or 'csv'
  const [reviewMode, setReviewMode] = useState('text');

  const [text, setText]             = useState('');
  const [audioFile, setAudioFile]   = useState(null);
  const [csvFile, setCsvFile]       = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [csvResults, setCsvResults] = useState([]);
  const [error, setError]           = useState('');
  const [saved, setSaved]           = useState(false);

  const audioRef = useRef();
  const csvRef   = useRef();

  const saveToHistory = async (analysis, inputText, filename = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('analysis_history').insert({
        user_id:           user.id,
        source_type:       mode,
        input_text:        inputText,
        filename:          filename,
        sentiment:         analysis.sentiment,
        category:          analysis.category,
        intent:            analysis.intent,
        summary:           analysis.summary,
        objection:         analysis.objection,
        action_item:       analysis.action_item,
        outcome:           analysis.outcome,
        risk_level:        analysis.risk_level,
        language_detected: analysis.language_detected,
      });
      setSaved(true);
    } catch (err) {
      console.error('History save error:', err);
    }
  };

  const handleClear = () => {
    setText('');
    setAudioFile(null);
    setCsvFile(null);
    setTranscript('');
    setResult(null);
    setCsvResults([]);
    setError('');
    setSaved(false);
  };

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);
    setResult(null);
    setCsvResults([]);
    setTranscript('');
    setSaved(false);

    try {
      // Sales Call — MP3
      if (mode === 'call') {
        if (!audioFile) { setError('Please upload an MP3 file'); setLoading(false); return; }
        const formData = new FormData();
        formData.append('file', audioFile);
        const res = await analyzeAudio(formData);
        setTranscript(res.data.transcript);
        setResult(res.data.analysis);
        await saveToHistory(res.data.analysis, res.data.transcript, audioFile.name);
      }

      // Review — single text
      else if (mode === 'review' && reviewMode === 'text') {
        if (!text.trim()) { setError('Please enter review text'); setLoading(false); return; }
        const res = await analyzeText(text, 'review');
        setResult(res.data.analysis);
        await saveToHistory(res.data.analysis, text);
      }

      // Review — bulk CSV
      else if (mode === 'review' && reviewMode === 'csv') {
        if (!csvFile) { setError('Please upload a CSV file'); setLoading(false); return; }
        const formData = new FormData();
        formData.append('file', csvFile);
        const res = await analyzeCsv(formData);
        if (res.data.error) { setError(res.data.error); setLoading(false); return; }
        setCsvResults(res.data.results);

        // Save har row to history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          for (const row of res.data.results) {
            await supabase.from('analysis_history').insert({
              user_id:           user.id,
              source_type:       'review',
              input_text:        row.input_text,
              filename:          csvFile.name,
              sentiment:         row.sentiment,
              category:          row.category,
              intent:            row.intent,
              summary:           row.summary,
              objection:         row.objection,
              action_item:       row.action_item,
              outcome:           row.outcome,
              risk_level:        row.risk_level,
              language_detected: row.language_detected,
            });
          }
          setSaved(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!csvFile) return;
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await analyzeCsvDownload(formData);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `analyzed_${csvFile.name}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  const canAnalyze =
    (mode === 'call' && audioFile) ||
    (mode === 'review' && reviewMode === 'text' && text.trim()) ||
    (mode === 'review' && reviewMode === 'csv' && csvFile);

  return (
    <div className="relative p-6 space-y-6">
      <AnimatedBackground dark={true} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Live Analysis</h1>
        <p className="text-white/40 text-sm mt-1">
          Upload a sales call or analyze customer reviews instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Input Section */}
        <div className="space-y-4">

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('call'); handleClear(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                mode === 'call'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}
            >
              <Mic size={14} /> Sales Call
            </button>
            <button
              onClick={() => { setMode('review'); handleClear(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                mode === 'review'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}
            >
              <FileText size={14} /> Customer Review
            </button>
          </div>

          {/* Review sub-mode */}
          {mode === 'review' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setReviewMode('text'); handleClear(); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  reviewMode === 'text'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/40 hover:text-white border border-white/10'
                }`}
              >
                <FileText size={12} /> Paste Text
              </button>
              <button
                onClick={() => { setReviewMode('csv'); handleClear(); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  reviewMode === 'csv'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/40 hover:text-white border border-white/10'
                }`}
              >
                <Table size={12} /> Upload CSV (Bulk)
              </button>
            </div>
          )}

          {/* Sales Call: MP3 Upload */}
          {mode === 'call' && (
            <div>
              {!audioFile ? (
                <div
                  onClick={() => audioRef.current.click()}
                  className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-10 text-center cursor-pointer transition-all group"
                >
                  <Upload size={32} className="text-white/20 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                  <p className="text-white/50 text-sm">Click to upload MP3 / WAV / M4A</p>
                  <p className="text-white/20 text-xs mt-1">Max file size: 25MB</p>
                  <input ref={audioRef} type="file" accept=".mp3,.wav,.m4a" className="hidden"
                    onChange={e => setAudioFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Mic size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{audioFile.name}</p>
                      <p className="text-white/40 text-xs">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setAudioFile(null)} className="text-white/30 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
              {transcript && (
                <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-2">Transcript (Whisper)</p>
                  <p className="text-white/70 text-xs leading-relaxed max-h-40 overflow-y-auto pr-2">{transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Review: Text Paste */}
          {mode === 'review' && reviewMode === 'text' && (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste customer review here...&#10;&#10;Supports English, Hindi, and Hinglish"
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          )}

          {/* Review: CSV Upload */}
          {mode === 'review' && reviewMode === 'csv' && (
            <div>
              {!csvFile ? (
                <div
                  onClick={() => csvRef.current.click()}
                  className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-10 text-center cursor-pointer transition-all group"
                >
                  <Table size={32} className="text-white/20 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                  <p className="text-white/50 text-sm">Click to upload CSV file</p>
                  <p className="text-white/20 text-xs mt-1">Must have a <code className="text-indigo-400">review_text</code> column • Max 50 rows</p>
                  <input ref={csvRef} type="file" accept=".csv" className="hidden"
                    onChange={e => setCsvFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Table size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{csvFile.name}</p>
                      <p className="text-white/40 text-xs">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setCsvFile(null)} className="text-white/30 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {saved  && <p className="text-green-400 text-xs">✓ Saved to history</p>}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !canAnalyze}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              {loading
                ? <><Loader size={14} className="animate-spin" />Analyzing...</>
                : <><Zap size={14} />Analyze</>
              }
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div>

          {/* Empty state */}
          {!result && csvResults.length === 0 && !loading && (
            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-xl">
              <div className="text-center space-y-2">
                <Zap size={32} className="text-white/20 mx-auto" />
                <p className="text-white/30 text-sm">Analysis results will appear here</p>
                <p className="text-white/20 text-xs">Supports English, Hindi & Hinglish</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-indigo-500/30 rounded-xl">
              <div className="text-center space-y-3">
                <Loader size={32} className="text-indigo-400 mx-auto animate-spin" />
                <p className="text-indigo-400/70 text-sm">
                  {mode === 'call' ? 'Transcribing + analyzing...'
                    : reviewMode === 'csv' ? 'Analyzing all reviews...'
                    : 'Analyzing review...'}
                </p>
              </div>
            </div>
          )}

          {/* Single Result */}
          {result && (
            <div className="space-y-3">
              <div className={`border rounded-xl p-4 ${SENTIMENT_COLORS[result.sentiment] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                <p className="text-xs opacity-60 mb-1">Overall Sentiment</p>
                <p className="text-2xl font-bold">{result.sentiment}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Category"   value={result.category} />
                <ResultCard label="Risk Level" value={result.risk_level} highlight={RISK_COLORS[result.risk_level]} />
                <ResultCard label="Outcome"    value={result.outcome} />
                <ResultCard label="Language"   value={result.language_detected} />
              </div>
              <ResultCard label="Intent"    value={result.intent} />
              <ResultCard label="Summary"   value={result.summary} />
              <ResultCard label="Objection" value={result.objection} />
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <p className="text-indigo-400/60 text-xs mb-1">Recommended Action</p>
                <p className="text-indigo-300 text-sm font-medium">{result.action_item}</p>
              </div>
            </div>
          )}

          {/* CSV Bulk Results */}
          {csvResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{csvResults.length} reviews analyzed</p>
                  <p className="text-white/40 text-xs mt-0.5">{csvFile?.name}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs transition-all"
                >
                  <Download size={14} /> Download CSV
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#0d1117]">
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/40 text-xs font-medium px-3 py-2">#</th>
                      <th className="text-left text-white/40 text-xs font-medium px-3 py-2">Review</th>
                      <th className="text-left text-white/40 text-xs font-medium px-3 py-2">Sentiment</th>
                      <th className="text-left text-white/40 text-xs font-medium px-3 py-2">Category</th>
                      <th className="text-left text-white/40 text-xs font-medium px-3 py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvResults.map((row) => (
                      <tr key={row.row} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2 text-white/40 text-xs">{row.row}</td>
                        <td className="px-3 py-2 text-white/70 text-xs max-w-[150px] truncate">{row.input_text}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SENTIMENT_BADGE[row.sentiment] || 'text-gray-400 bg-gray-400/10'}`}>
                            {row.sentiment}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-white/60 text-xs">{row.category}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-medium ${RISK_COLORS[row.risk_level]}`}>
                            {row.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Analyze;
