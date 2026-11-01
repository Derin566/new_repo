import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Settings2, 
  Database, 
  Download, 
  RefreshCw, 
  X, 
  Check, 
  Sliders, 
  Layers, 
  Clock, 
  Users
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function AdminPanel({ 
  adminConfig, 
  setAdminConfig, 
  isOpen, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'database'
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Live database records
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      fetchRecords();
    } else {
      setAuthError('Invalid Admin Passcode (Default is admin123)');
    }
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const q = query(collection(db, 'extracted_features'), limit(50));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
    } catch (err) {
      console.warn("Could not fetch Firestore records:", err.message);
      // Fallback to local storage if offline
      const local = localStorage.getItem('dyslexia_extracted_records');
      if (local) setRecords(JSON.parse(local));
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!records.length) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'session_id', 'child_name', 'age', 'timestamp',
      'vs_accuracy', 'vs_avg_rt_ms', 'vs_distractor_clicks',
      'sym_accuracy', 'sym_mirror_errors', 'sym_hesitation_ms',
      'vm_memory_span', 'vm_error_rate',
      'pm_accuracy', 'pm_decision_time_ms',
      'aud_accuracy', 'aud_memory_span',
      'voice_hesitation_ratio', 'voice_speech_rate'
    ];

    const rows = records.map(r => [
      r.id || 'N/A',
      r.child_name || 'Anonymous',
      r.age || 8,
      r.timestamp || new Date().toISOString(),
      r.vs_accuracy ?? 0,
      r.vs_avg_rt_ms ?? 0,
      r.vs_distractor_clicks ?? 0,
      r.sym_accuracy ?? 0,
      r.sym_mirror_errors ?? 0,
      r.sym_hesitation_ms ?? 0,
      r.vm_memory_span ?? 0,
      r.vm_error_rate ?? 0,
      r.pm_accuracy ?? 0,
      r.pm_decision_time_ms ?? 0,
      r.aud_accuracy ?? 0,
      r.aud_memory_span ?? 0,
      r.voice_hesitation_ratio ?? 0,
      r.voice_speech_rate ?? 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dyslexia_ml_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#1D3557] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Admin & Researcher Portal</h2>
              <p className="text-xs text-gray-300">Round Configuration, Game Calibration & Dataset Hub</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-teal-50 text-[#2A9D8F] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <Sliders className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1D3557]">Admin Passcode Required</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Enter the passcode to configure game rounds, timers, and inspect the ML database.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (admin123)"
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
              {authError && (
                <p className="text-xs text-red-600 font-semibold">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold rounded-2xl text-sm shadow-md transition-all"
              >
                Unlock Admin Controls
              </button>
              <p className="text-[11px] text-gray-400">Default passcode: <strong>admin123</strong></p>
            </form>
          </div>
        ) : (
          /* Main Authenticated Body */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-6 pt-3 bg-gray-50">
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'controls'
                    ? 'border-[#2A9D8F] text-[#1D3557] bg-white rounded-t-xl'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Settings2 className="w-4 h-4 text-[#2A9D8F]" />
                <span>Rounds & Calibration Controls</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('database');
                  fetchRecords();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'database'
                    ? 'border-[#2A9D8F] text-[#1D3557] bg-white rounded-t-xl'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Database className="w-4 h-4 text-amber-600" />
                <span>Live Firestore Dataset ({records.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'controls' ? (
                /* CONTROLS TAB */
                <div className="space-y-6">
                  {/* Round Counter */}
                  <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-amber-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-[#1D3557] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#2A9D8F]" />
                        <span>Rounds Per Game Activity</span>
                      </label>
                      <span className="text-xs font-bold px-3 py-1 bg-teal-100 text-[#1E7066] rounded-full">
                        {adminConfig.roundsPerGame} Rounds
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      How many trials each child plays per cognitive task before moving to the next.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setAdminConfig({ ...adminConfig, roundsPerGame: num })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            adminConfig.roundsPerGame === num
                              ? 'bg-[#2A9D8F] text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {num} {num === 1 ? 'Round (Fast Test)' : 'Rounds'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer Per Round */}
                  <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-amber-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-[#1D3557] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Time Limit Per Question</span>
                      </label>
                      <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                        {adminConfig.timeLimitSeconds === 0 ? 'Untimed (No Rush)' : `${adminConfig.timeLimitSeconds} Seconds`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Time allowed before automatically advancing or timing out the question.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { sec: 10, label: '10s (Fast)' },
                        { sec: 15, label: '15s (Standard)' },
                        { sec: 20, label: '20s (Relaxed)' },
                        { sec: 0, label: 'Untimed' }
                      ].map((item) => (
                        <button
                          key={item.sec}
                          onClick={() => setAdminConfig({ ...adminConfig, timeLimitSeconds: item.sec })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            adminConfig.timeLimitSeconds === item.sec
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Override */}
                  <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-amber-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-[#1D3557] flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Difficulty Mode Calibration</span>
                      </label>
                      <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-full uppercase">
                        {adminConfig.difficultyMode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Force test a specific research level or let the system adapt automatically by child's age.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'auto', label: '🤖 Auto (By Age)' },
                        { id: 'level1', label: 'Level 1 (5–7 yrs)' },
                        { id: 'level2', label: 'Level 2 (8–10 yrs)' },
                        { id: 'level3', label: 'Level 3 (11–14 yrs)' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAdminConfig({ ...adminConfig, difficultyMode: item.id })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            adminConfig.difficultyMode === item.id
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Modules Toggles */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200">
                    <h4 className="text-sm font-bold text-[#1D3557] mb-3">Active Modules in Screening Quest</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'visualSearch', label: '🔍 Visual Search' },
                        { key: 'symmetry', label: '🪞 Symmetry / Mirror' },
                        { key: 'visualMemory', label: '🧠 Visual Memory' },
                        { key: 'patternMatch', label: '🧩 Pattern Match' },
                        { key: 'auditoryMemory', label: '🎵 Auditory Memory' },
                        { key: 'voiceEcho', label: '🎙️ Voice NWRT Task' }
                      ].map((mod) => (
                        <label 
                          key={mod.key} 
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={adminConfig.enabledModules[mod.key]}
                            onChange={(e) => {
                              setAdminConfig({
                                ...adminConfig,
                                enabledModules: {
                                  ...adminConfig.enabledModules,
                                  [mod.key]: e.target.checked
                                }
                              });
                            }}
                            className="w-4 h-4 text-[#2A9D8F] rounded focus:ring-[#2A9D8F]"
                          />
                          <span className="text-xs font-semibold text-gray-800">{mod.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-[#2A9D8F] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#21867a]"
                    >
                      Save Settings & Return
                    </button>
                  </div>
                </div>
              ) : (
                /* LIVE FIRESTORE DATABASE TAB */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1D3557]">
                        Extracted Feature Records (Cloud Firestore)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Target Collection: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-teal-800">extracted_features</code> in project <code className="bg-gray-100 px-1.5 py-0.5 rounded text-teal-800">dyslexiamonitering</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchRecords}
                        disabled={loadingRecords}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-all"
                        title="Refresh database"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV for ML</span>
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <div className="max-h-96 overflow-x-auto overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="p-3">Learner</th>
                            <th className="p-3">Age</th>
                            <th className="p-3">VS Acc %</th>
                            <th className="p-3">VS RT (ms)</th>
                            <th className="p-3">Symmetry Acc %</th>
                            <th className="p-3">Mirror Errors</th>
                            <th className="p-3">Memory Span</th>
                            <th className="p-3">Voice Hesitation</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {records.length > 0 ? (
                            records.map((r, i) => (
                              <tr key={r.id || i} className="hover:bg-teal-50/50 transition-colors">
                                <td className="p-3 font-bold text-[#1D3557]">{r.child_name || 'Anonymous'}</td>
                                <td className="p-3">{r.age || 8} yrs</td>
                                <td className="p-3 font-semibold text-teal-700">{r.vs_accuracy ?? '—'}%</td>
                                <td className="p-3">{r.vs_avg_rt_ms ? `${Math.round(r.vs_avg_rt_ms)}ms` : '—'}</td>
                                <td className="p-3 font-semibold text-purple-700">{r.sym_accuracy ?? '—'}%</td>
                                <td className="p-3 text-red-600">{r.sym_mirror_errors ?? 0}</td>
                                <td className="p-3">{r.vm_memory_span ?? '—'} items</td>
                                <td className="p-3">{r.voice_hesitation_ratio ? `${(r.voice_hesitation_ratio * 100).toFixed(1)}%` : '—'}</td>
                                <td className="p-3 text-gray-400 text-[11px]">{r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Just now'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="p-8 text-center text-gray-400">
                                {loadingRecords ? 'Fetching live Firestore records...' : 'No game feature records found yet. Complete a screening quest to record live ML data!'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
