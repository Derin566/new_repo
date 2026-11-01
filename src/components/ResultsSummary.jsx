import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Star, 
  CheckCircle2, 
  Download, 
  Home, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ResultsSummary({ 
  features, 
  avatar, 
  onPlayAgain, 
  onOpenAdmin 
}) {
  const [cloudSaved, setCloudSaved] = useState(false);
  const [docId, setDocId] = useState('');
  const [savingError, setSavingError] = useState('');

  // Auto-save to Cloud Firestore on mount
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });

    const saveToFirestore = async () => {
      try {
        const docRef = await addDoc(collection(db, 'extracted_features'), {
          ...features,
          createdAt: serverTimestamp()
        });
        setCloudSaved(true);
        setDocId(docRef.id);

        // Fallback local cache
        const prev = JSON.parse(localStorage.getItem('dyslexia_extracted_records') || '[]');
        localStorage.setItem('dyslexia_extracted_records', JSON.stringify([
          { id: docRef.id, ...features },
          ...prev
        ]));
      } catch (err) {
        console.warn("Firestore save fallback to local:", err.message);
        setSavingError('Stored Locally in Browser Cache');
        const prev = JSON.parse(localStorage.getItem('dyslexia_extracted_records') || '[]');
        localStorage.setItem('dyslexia_extracted_records', JSON.stringify([
          { id: 'local_' + Date.now(), ...features },
          ...prev
        ]));
      }
    };

    saveToFirestore();
  }, [features]);

  const handleDownloadCSV = () => {
    const keys = Object.keys(features);
    const values = Object.values(features);
    const csvContent = "data:text/csv;charset=utf-8," + keys.join(',') + "\n" + values.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dyslexia_features_${features.child_name}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-100 p-6 sm:p-10 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
      
      {/* Top Victory Mascot */}
      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner border-2 border-amber-200">
          {avatar}
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full shadow-md">
          <Trophy className="w-4 h-4" />
        </div>
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
        Assessment Finished
      </div>

      <h2 className="text-3xl font-black text-[#1D3557] tracking-tight">
        You Have Completed the Screening!
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-4">
        Great job, <strong>{features.child_name}</strong>! All cognitive tasks are complete.
      </p>

      {/* 3 Stars Badge */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {[1, 2, 3].map((s) => (
          <Star key={s} className="w-8 h-8 fill-amber-400 text-amber-500 drop-shadow-sm animate-bounce" />
        ))}
      </div>

      {/* Cloud Firestore Status Confirmation */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-6">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>
          {cloudSaved 
            ? `Successfully Stored in Cloud Firestore Database!` 
            : savingError || 'Storing data in database...'}
        </span>
      </div>

      {/* Extracted Clinical Feature Table */}
      <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-amber-200/70 text-left mb-6">
        <div className="flex items-center justify-between mb-3 border-b border-amber-200/50 pb-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#2A9D8F]" />
            <span>Extracted Telemetry Features</span>
          </span>
          <span className="text-[11px] text-gray-500 font-semibold">
            Age {features.age} • {features.level_calibrated}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Visual Search Acc</span>
            <strong className="text-sm text-teal-700">{features.vs_accuracy}%</strong>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Visual Search RT</span>
            <strong className="text-sm text-[#1D3557]">{features.vs_avg_rt_ms} ms</strong>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Symmetry Acc</span>
            <strong className="text-sm text-purple-700">{features.sym_accuracy}%</strong>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Mirror Confusions</span>
            <strong className="text-sm text-red-600">{features.sym_mirror_errors} errors</strong>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Memory Span</span>
            <strong className="text-sm text-blue-700">{features.vm_memory_span} items</strong>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-gray-400 text-[10px] block font-semibold">Voice Hesitation</span>
            <strong className="text-sm text-orange-600">{(features.voice_hesitation_ratio * 100).toFixed(1)}% pause</strong>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Main Big Button: Back to Home Page */}
        <button
          onClick={onPlayAgain}
          className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-gradient-to-r from-[#2A9D8F] to-[#21867a] hover:from-[#21867a] hover:to-[#1a685e] active:scale-95 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-teal-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home Page</span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="w-full sm:w-auto py-3.5 px-5 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Admin Portal Quick Link */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onOpenAdmin}
          className="text-xs text-gray-400 hover:text-gray-700 font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-gray-400" />
          <span>Open Admin Portal & Dataset Inspector</span>
        </button>
      </div>

    </div>
  );
}

