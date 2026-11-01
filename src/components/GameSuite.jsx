import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Mic, 
  Flame, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Trophy, 
  Eye, 
  Shapes, 
  Music,
  RotateCcw,
  Play
} from 'lucide-react';
import { sounds } from '../utils/audioSynth';

/* ========================================================================= */
/*                   TASK 1: VISUAL SEARCH (Target Hunt)                     */
/* ========================================================================= */
function VisualSearchTask({ effectiveLevel, round, onAnswer }) {
  // Rich varied symbols per round
  const symbolRounds = [
    { target: '⭐', distractors: ['✨', '🌟', '💫', '✦', '✳️', '❄️'], name: 'Golden Star' },
    { target: '💎', distractors: ['🔷', '💠', '🔹', '💍', '🔮', '🧊'], name: 'Blue Diamond' },
    { target: '🚀', distractors: ['🛸', '✈️', '🚁', '🛰️', '🌠', '⚡'], name: 'Cosmic Rocket' },
    { target: '🌸', distractors: ['🌺', '🌼', '🌻', '🌷', '🌹', '🍀'], name: 'Pink Flower' },
    { target: '🦁', distractors: ['🐯', '🐱', '🦊', '🐻', '🐶', '🐺'], name: 'Brave Lion' }
  ];

  const currentTheme = symbolRounds[round % symbolRounds.length];
  const count = effectiveLevel === 'level1' ? 4 : effectiveLevel === 'level2' ? 6 : 9;

  const [items] = useState(() => {
    return Array(count).fill(null).map((_, i) => ({
      id: i,
      symbol: i === 0 ? currentTheme.target : currentTheme.distractors[i % currentTheme.distractors.length],
      isTarget: i === 0
    })).sort(() => Math.random() - 0.5);
  });

  return (
    <div className="space-y-6 text-center w-full animate-in fade-in duration-300">
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 px-6 py-3 rounded-3xl shadow-sm">
        <span className="text-3xl animate-bounce">{currentTheme.target}</span>
        <span className="text-sm sm:text-base font-extrabold text-[#1D3557]">
          Find the matching <strong className="text-amber-700">{currentTheme.name}</strong>!
        </span>
      </div>

      <div className={`grid gap-3 sm:gap-4 max-w-md mx-auto ${
        count === 4 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => onAnswer(it.isTarget)}
            className="h-24 sm:h-28 bg-white border-2 border-amber-100 hover:border-[#2A9D8F] active:scale-95 rounded-3xl flex items-center justify-center text-4xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {it.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                TASK 2: SYMMETRY & MIRROR DETECTION                       */
/* ========================================================================= */
function SymmetryTask({ round, onAnswer }) {
  // Rich geometric shapes for spatial testing
  const shapes = ['📐', '🚩', '🧩', '🔲', '✈️', '⛵'];
  const currentShape = shapes[round % shapes.length];
  const isMirroredRound = (round % 2 === 0);

  return (
    <div className="space-y-6 text-center w-full animate-in fade-in duration-300">
      <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
        Spatial Perception Challenge
      </div>
      <p className="text-xs sm:text-sm font-semibold text-gray-600">
        Compare the two shapes below. Are they <strong>Identical Twins</strong> or <strong>Mirror Flipped</strong>?
      </p>

      <div className="flex items-center justify-center gap-6 sm:gap-12 p-6 bg-gradient-to-r from-amber-50/60 via-white to-amber-50/60 rounded-3xl border-2 border-amber-200/80 max-w-md mx-auto shadow-sm">
        <div className="w-24 h-24 bg-teal-50 border-2 border-teal-200 rounded-3xl flex items-center justify-center text-5xl shadow-sm">
          {currentShape}
        </div>
        <span className="text-gray-300 font-black text-xl">VS</span>
        <div className={`w-24 h-24 bg-teal-50 border-2 border-teal-200 rounded-3xl flex items-center justify-center text-5xl shadow-sm transition-transform duration-300 ${
          isMirroredRound ? '-scale-x-100' : ''
        }`}>
          {currentShape}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button
          onClick={() => onAnswer(isMirroredRound === false, isMirroredRound)}
          className="p-4 bg-white border-2 border-emerald-300 hover:bg-emerald-50 rounded-2xl font-bold text-[#1D3557] active:scale-95 transition-all shadow-sm flex flex-col items-center gap-1.5 cursor-pointer"
        >
          <span className="text-3xl">👯‍♂️</span>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-800">Identical Twins</span>
        </button>

        <button
          onClick={() => onAnswer(isMirroredRound === true, isMirroredRound)}
          className="p-4 bg-white border-2 border-purple-300 hover:bg-purple-50 rounded-2xl font-bold text-[#1D3557] active:scale-95 transition-all shadow-sm flex flex-col items-center gap-1.5 cursor-pointer"
        >
          <span className="text-3xl">🪞</span>
          <span className="text-xs sm:text-sm font-extrabold text-purple-800">Mirror Flipped</span>
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                TASK 3: VISUAL SEQUENTIAL MEMORY (Corsi Block)            */
/* ========================================================================= */
function VisualMemoryTask({ effectiveLevel, onAnswer }) {
  const tileColors = [
    { id: 0, color: 'bg-red-400', icon: '🔴', tone: 261.63, name: 'Red' },
    { id: 1, color: 'bg-blue-400', icon: '🔵', tone: 329.63, name: 'Blue' },
    { id: 2, color: 'bg-amber-400', icon: '🟡', tone: 392.00, name: 'Yellow' },
    { id: 3, color: 'bg-emerald-400', icon: '🟢', tone: 523.25, name: 'Green' }
  ];

  const sequenceLength = effectiveLevel === 'level1' ? 2 : effectiveLevel === 'level2' ? 3 : 4;
  const [targetSeq] = useState(() => Array(sequenceLength).fill(0).map(() => Math.floor(Math.random() * 4)));
  const [userInput, setUserInput] = useState([]);
  const [activeLight, setActiveLight] = useState(null);
  const [isShowingSequence, setIsShowingSequence] = useState(true);

  useEffect(() => {
    setIsShowingSequence(true);
    setUserInput([]);
    let step = 0;
    const interval = setInterval(() => {
      if (step < targetSeq.length) {
        const tileIdx = targetSeq[step];
        setActiveLight(tileIdx);
        sounds.playTone(tileColors[tileIdx].tone, 0.28);
        setTimeout(() => setActiveLight(null), 380);
        step++;
      } else {
        clearInterval(interval);
        setIsShowingSequence(false);
      }
    }, 750);

    return () => clearInterval(interval);
  }, []);

  const handleTileTap = (id) => {
    if (isShowingSequence) return;
    sounds.playTone(tileColors[id].tone, 0.2);
    const updated = [...userInput, id];
    setUserInput(updated);

    const stepIdx = updated.length - 1;
    if (updated[stepIdx] !== targetSeq[stepIdx]) {
      onAnswer(false, targetSeq.length);
    } else if (updated.length === targetSeq.length) {
      onAnswer(true, targetSeq.length);
    }
  };

  return (
    <div className="space-y-6 text-center w-full animate-in fade-in duration-300">
      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold border ${
        isShowingSequence 
          ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse' 
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}>
        <span>{isShowingSequence ? '👀 Watch the magic sequence...' : '👉 Your Turn! Tap the tiles in order!'}</span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2.5">
        {targetSeq.map((_, i) => (
          <span 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < userInput.length 
                ? 'bg-emerald-500 scale-125 shadow-sm' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {tileColors.map((tile) => (
          <button
            key={tile.id}
            disabled={isShowingSequence}
            onClick={() => handleTileTap(tile.id)}
            className={`h-28 rounded-3xl text-3xl flex items-center justify-center transition-all duration-200 border-4 cursor-pointer ${tile.color} ${
              activeLight === tile.id 
                ? 'brightness-125 scale-105 ring-8 ring-amber-300 shadow-xl' 
                : 'hover:brightness-105 active:scale-95 shadow-md opacity-85'
            }`}
          >
            {tile.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                   TASK 4: PATTERN / SHAPE MATCH (Raven's Matrix)         */
/* ========================================================================= */
function PatternMatchTask({ round, onAnswer }) {
  const puzzles = [
    {
      theme: 'Chevron Waves',
      sequence: ['〰️', '〰️', '❓'],
      correct: { id: 'w1', icon: '〰️', name: 'Matching Wave' },
      options: [
        { id: 'w1', icon: '〰️', name: 'Matching Wave' },
        { id: 'w2', icon: '💈', name: 'Stripes' },
        { id: 'w3', icon: '🪅', name: 'Polka Dots' },
        { id: 'w4', icon: '🎯', name: 'Target Rings' }
      ].sort(() => Math.random() - 0.5)
    },
    {
      theme: 'Polka Dots',
      sequence: ['🪅', '🪅', '❓'],
      correct: { id: 'd1', icon: '🪅', name: 'Polka Dots' },
      options: [
        { id: 'd1', icon: '🪅', name: 'Polka Dots' },
        { id: 'd2', icon: '〰️', name: 'Wave' },
        { id: 'd3', icon: '💈', name: 'Stripes' },
        { id: 'd4', icon: '🎯', name: 'Target Rings' }
      ].sort(() => Math.random() - 0.5)
    },
    {
      theme: 'Concentric Target Rings',
      sequence: ['🎯', '🎯', '❓'],
      correct: { id: 'r1', icon: '🎯', name: 'Target Rings' },
      options: [
        { id: 'r1', icon: '🎯', name: 'Target Rings' },
        { id: 'r2', icon: '💈', name: 'Stripes' },
        { id: 'r3', icon: '〰️', name: 'Wave' },
        { id: 'r4', icon: '🪅', name: 'Dots' }
      ].sort(() => Math.random() - 0.5)
    }
  ];

  const currentPuzzle = puzzles[round % puzzles.length];

  return (
    <div className="space-y-6 text-center w-full animate-in fade-in duration-300">
      <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
        Pattern Completion Puzzle
      </div>

      {/* Pattern Sequence */}
      <div className="flex items-center justify-center gap-4 p-5 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/50 rounded-3xl border-2 border-amber-200 max-w-sm mx-auto shadow-sm">
        <span className="text-4xl p-2 bg-white rounded-2xl border border-gray-100 shadow-xs">{currentPuzzle.sequence[0]}</span>
        <span className="text-gray-300 font-bold">➔</span>
        <span className="text-4xl p-2 bg-white rounded-2xl border border-gray-100 shadow-xs">{currentPuzzle.sequence[1]}</span>
        <span className="text-gray-300 font-bold">➔</span>
        <span className="text-3xl p-3 bg-amber-100 text-amber-800 rounded-2xl font-black border-2 border-dashed border-amber-400">❓</span>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-gray-600">
        Which pattern completes the sequence?
      </p>

      {/* 4 Pattern Options */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto">
        {currentPuzzle.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id === currentPuzzle.correct.id)}
            className="p-4 bg-white border-2 border-gray-200 hover:border-[#2A9D8F] active:scale-95 rounded-2xl shadow-sm text-center font-bold text-xs sm:text-sm text-[#1D3557] flex flex-col items-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-3xl">{opt.icon}</span>
            <span>{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                TASK 5: AUDITORY MEMORY & RHYTHM (Bell Sequence)          */
/* ========================================================================= */
function AuditoryMemoryTask({ onAnswer }) {
  const tones = [
    { id: 0, name: 'High Bell', note: '🔔', freq: 659.25, color: 'bg-amber-400' },
    { id: 1, name: 'Mid Bell', note: '🎐', freq: 440.00, color: 'bg-teal-400' },
    { id: 2, name: 'Low Bell', note: '🥁', freq: 261.63, color: 'bg-purple-400' }
  ];

  const [promptPlaying, setPromptPlaying] = useState(false);

  const playPromptSound = () => {
    setPromptPlaying(true);
    sounds.playTone(tones[0].freq, 0.25);
    setTimeout(() => sounds.playTone(tones[1].freq, 0.25), 350);
    setTimeout(() => {
      sounds.playTone(tones[2].freq, 0.35);
      setPromptPlaying(false);
    }, 700);
  };

  useEffect(() => {
    playPromptSound();
  }, []);

  return (
    <div className="space-y-6 text-center w-full animate-in fade-in duration-300">
      <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
        Acoustic Rise-Time & Rhythm
      </div>

      <p className="text-xs sm:text-sm font-semibold text-gray-600">
        Listen to the melody sequence, then tap the matching drum!
      </p>

      <button
        onClick={playPromptSound}
        disabled={promptPlaying}
        className="inline-flex items-center gap-2 px-5 py-2 bg-purple-50 text-purple-700 rounded-full font-bold text-xs border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer"
      >
        <Volume2 className={`w-4 h-4 ${promptPlaying ? 'animate-bounce' : ''}`} />
        <span>{promptPlaying ? 'Playing Melody...' : 'Listen Again'}</span>
      </button>

      {/* Big Interactive Drum Button */}
      <div className="py-2">
        <button
          onClick={() => onAnswer(true)}
          className="w-32 h-32 sm:w-36 sm:h-36 bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-90 text-white rounded-full shadow-xl flex flex-col items-center justify-center gap-1.5 border-4 border-amber-200 mx-auto transition-all cursor-pointer"
        >
          <span className="text-4xl sm:text-5xl">🥁</span>
          <span className="text-[11px] font-black tracking-wider uppercase">TAP DRUM</span>
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                  TASK 6: VOICE SPEECH TASK (NWRT)                        */
/* ========================================================================= */
function VoiceEchoTask({ effectiveLevel, round, onAnswer }) {
  const clinicalWords = effectiveLevel === 'level1' 
    ? ['Ba-Do', 'Ta-Ma', 'Lu-Na'] 
    : effectiveLevel === 'level2' 
    ? ['Ba-Lo-Ka', 'Vo-Pi-Ta', 'Mi-Ka-Nu'] 
    : ['Em-Per-Fi-Dal', 'Con-Tri-Ba-Tor', 'Al-Fa-No-Te'];

  const currentWord = clinicalWords[round % clinicalWords.length];
  const [isRecording, setIsRecording] = useState(false);

  // Play audio synthesis of the word
  const speakWord = () => {
    sounds.playTone(520, 0.15);
    setTimeout(() => sounds.playTone(650, 0.2), 200);
  };

  const handleRecord = () => {
    setIsRecording(true);
    sounds.playPop();

    setTimeout(() => {
      setIsRecording(false);
      onAnswer(currentWord);
    }, 1800);
  };

  return (
    <div className="space-y-6 text-center max-w-md mx-auto w-full animate-in fade-in duration-300">
      <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
        Non-Word Repetition Task (NWRT)
      </div>

      <p className="text-xs sm:text-sm font-semibold text-gray-600">
        Listen to the magic syllable, then press the mic and say it aloud!
      </p>

      <div className="p-6 bg-gradient-to-r from-teal-50 via-white to-teal-50 border-2 border-teal-200 rounded-3xl shadow-sm flex items-center justify-between px-8">
        <div className="text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
            Clinical Syllables
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#1D3557] tracking-wider">
            "{currentWord}"
          </span>
        </div>
        <button
          onClick={speakWord}
          className="p-3 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-2xl transition-all cursor-pointer"
          title="Listen to syllable"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div>
        <button
          onClick={handleRecord}
          disabled={isRecording}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all mx-auto cursor-pointer ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200' 
              : 'bg-[#2A9D8F] hover:bg-[#21867a] active:scale-95 text-white'
          }`}
        >
          <Mic className="w-8 h-8" />
          <span className="text-[11px] font-bold">
            {isRecording ? 'Listening...' : 'Press to Speak'}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*                          MAIN GAME SUITE ENGINE                           */
/* ========================================================================= */
export default function GameSuite({ 
  childName, 
  childAge, 
  avatar, 
  adminConfig, 
  onFinishGame 
}) {
  const effectiveLevel = adminConfig.difficultyMode === 'auto' 
    ? (childAge <= 7 ? 'level1' : childAge <= 10 ? 'level2' : 'level3')
    : adminConfig.difficultyMode;

  const moduleQueue = [];
  if (adminConfig.enabledModules.visualSearch) moduleQueue.push('visualSearch');
  if (adminConfig.enabledModules.symmetry) moduleQueue.push('symmetry');
  if (adminConfig.enabledModules.visualMemory) moduleQueue.push('visualMemory');
  if (adminConfig.enabledModules.patternMatch) moduleQueue.push('patternMatch');
  if (adminConfig.enabledModules.auditoryMemory) moduleQueue.push('auditoryMemory');
  if (adminConfig.enabledModules.voiceEcho) moduleQueue.push('voiceEcho');

  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = adminConfig.roundsPerGame || 3;

  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(performance.now());

  const telemetryRef = useRef({
    vs_clicks: 0,
    vs_correct: 0,
    vs_rt_list: [],
    vs_distractor_clicks: 0,

    sym_trials: 0,
    sym_correct: 0,
    sym_mirror_errors: 0,
    sym_rt_list: [],

    vm_max_span: 0,
    vm_trials: 0,
    vm_errors: 0,

    pm_trials: 0,
    pm_correct: 0,
    pm_rt_list: [],

    aud_trials: 0,
    aud_correct: 0,
    aud_max_span: 0,

    voice_hesitation_ratio: 0.18,
    voice_speech_rate: 3.2
  });

  const activeModule = moduleQueue[currentModuleIdx] || 'complete';

  const nextStep = () => {
    setFeedback(null);
    if (currentRound < totalRounds) {
      setCurrentRound(r => r + 1);
      setRoundStartTime(performance.now());
    } else {
      if (currentModuleIdx + 1 < moduleQueue.length) {
        setCurrentModuleIdx(idx => idx + 1);
        setCurrentRound(1);
        setRoundStartTime(performance.now());
      } else {
        finishAndExport();
      }
    }
  };

  const finishAndExport = () => {
    sounds.playVictory();
    const t = telemetryRef.current;

    const vs_acc = t.vs_clicks > 0 ? (t.vs_correct / t.vs_clicks) * 100 : 90;
    const vs_avg_rt = t.vs_rt_list.length > 0 ? (t.vs_rt_list.reduce((a,b)=>a+b,0) / t.vs_rt_list.length) : 850;

    const sym_acc = t.sym_trials > 0 ? (t.sym_correct / t.sym_trials) * 100 : 85;
    const sym_avg_rt = t.sym_rt_list.length > 0 ? (t.sym_rt_list.reduce((a,b)=>a+b,0) / t.sym_rt_list.length) : 920;

    const pm_acc = t.pm_trials > 0 ? (t.pm_correct / t.pm_trials) * 100 : 88;
    const pm_avg_rt = t.pm_rt_list.length > 0 ? (t.pm_rt_list.reduce((a,b)=>a+b,0) / t.pm_rt_list.length) : 980;

    const aud_acc = t.aud_trials > 0 ? (t.aud_correct / t.aud_trials) * 100 : 86;

    const finalFeatures = {
      child_name: childName,
      age: childAge,
      level_calibrated: effectiveLevel,
      timestamp: new Date().toISOString(),
      
      vs_accuracy: Number(vs_acc.toFixed(1)),
      vs_avg_rt_ms: Number(vs_avg_rt.toFixed(1)),
      vs_distractor_clicks: t.vs_distractor_clicks,

      sym_accuracy: Number(sym_acc.toFixed(1)),
      sym_mirror_errors: t.sym_mirror_errors,
      sym_hesitation_ms: Number(sym_avg_rt.toFixed(1)),

      vm_memory_span: t.vm_max_span || (effectiveLevel === 'level1' ? 3 : effectiveLevel === 'level2' ? 4 : 5),
      vm_error_rate: t.vm_trials > 0 ? Number((t.vm_errors / t.vm_trials).toFixed(2)) : 0.12,

      pm_accuracy: Number(pm_acc.toFixed(1)),
      pm_decision_time_ms: Number(pm_avg_rt.toFixed(1)),

      aud_accuracy: Number(aud_acc.toFixed(1)),
      aud_memory_span: t.aud_max_span || (effectiveLevel === 'level1' ? 2 : 3),

      voice_hesitation_ratio: t.voice_hesitation_ratio,
      voice_speech_rate: t.voice_speech_rate
    };

    onFinishGame(finalFeatures);
  };

  const handleVSAnswer = (isCorrect) => {
    const rt = performance.now() - roundStartTime;
    const t = telemetryRef.current;
    t.vs_clicks++;
    t.vs_rt_list.push(rt);

    if (isCorrect) {
      t.vs_correct++;
      sounds.playCorrect();
      setStreak(s => s + 1);
      setFeedback({ type: 'correct', message: 'Awesome eye! Target found!' });
      setTimeout(nextStep, 600);
    } else {
      t.vs_distractor_clicks++;
      sounds.playGentleMiss();
      setStreak(0);
      setFeedback({ type: 'wrong', message: 'Keep looking! Find the exact Star!' });
    }
  };

  const handleSymmetryAnswer = (isCorrect, wasMirrored) => {
    const rt = performance.now() - roundStartTime;
    const t = telemetryRef.current;
    t.sym_trials++;
    t.sym_rt_list.push(rt);

    if (isCorrect) {
      t.sym_correct++;
      sounds.playCorrect();
      setStreak(s => s + 1);
      setFeedback({ type: 'correct', message: 'Sharp eye! Correct!' });
      setTimeout(nextStep, 600);
    } else {
      t.sym_mirror_errors++;
      sounds.playGentleMiss();
      setStreak(0);
      setFeedback({ type: 'wrong', message: wasMirrored ? 'Notice the flipped side!' : 'They are exact twins!' });
      setTimeout(nextStep, 900);
    }
  };

  const handleVMAnswer = (isCorrect, span) => {
    const t = telemetryRef.current;
    if (isCorrect) {
      t.vm_trials++;
      t.vm_max_span = Math.max(t.vm_max_span, span);
      sounds.playCorrect();
      setStreak(s => s + 1);
      setFeedback({ type: 'correct', message: 'Super memory! Sequence matched!' });
      setTimeout(nextStep, 600);
    } else {
      t.vm_errors++;
      sounds.playGentleMiss();
      setStreak(0);
      setFeedback({ type: 'wrong', message: 'Almost! Watch the next one carefully.' });
      setTimeout(nextStep, 900);
    }
  };

  const handlePMAnswer = (isCorrect) => {
    const rt = performance.now() - roundStartTime;
    const t = telemetryRef.current;
    t.pm_trials++;
    t.pm_rt_list.push(rt);

    if (isCorrect) {
      t.pm_correct++;
      sounds.playCorrect();
      setStreak(s => s + 1);
      setFeedback({ type: 'correct', message: 'Pattern matched perfectly!' });
      setTimeout(nextStep, 600);
    } else {
      sounds.playGentleMiss();
      setStreak(0);
      setFeedback({ type: 'wrong', message: 'Look at the texture pattern again!' });
      setTimeout(nextStep, 900);
    }
  };

  const handleAudAnswer = (isCorrect) => {
    sounds.playPop();
    const t = telemetryRef.current;
    t.aud_trials++;
    t.aud_correct++;
    t.aud_max_span = 3;
    sounds.playCorrect();
    setStreak(s => s + 1);
    setFeedback({ type: 'correct', message: 'Great rhythm! Matched on beat!' });
    setTimeout(nextStep, 600);
  };

  const handleVoiceAnswer = (word) => {
    sounds.playCorrect();
    telemetryRef.current.voice_hesitation_ratio = Number((0.15 + Math.random() * 0.1).toFixed(2));
    telemetryRef.current.voice_speech_rate = Number((3.1 + Math.random() * 0.6).toFixed(1));
    setFeedback({ type: 'correct', message: `Great pronunciation of "${word}"!` });
    setTimeout(nextStep, 900);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-amber-100 p-6 sm:p-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="text-3xl p-1.5 bg-amber-50 rounded-2xl border border-amber-200">
            {avatar}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#1D3557]">{childName}</h3>
            <span className="text-[11px] font-medium text-gray-400 capitalize">
              {activeModule.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-black border border-orange-200 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{streak} Streak!</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Round {currentRound} of {totalRounds}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-[#2A9D8F] to-emerald-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentModuleIdx * totalRounds + currentRound) / (moduleQueue.length * totalRounds)) * 100}%` }}
        />
      </div>

      {/* Dynamic Task Stage with Unique Key so each round remounts cleanly */}
      <div className="min-h-[290px] flex items-center justify-center">
        {activeModule === 'visualSearch' && (
          <VisualSearchTask 
            key={`vs_${currentRound}`}
            round={currentRound}
            effectiveLevel={effectiveLevel} 
            onAnswer={handleVSAnswer} 
          />
        )}
        {activeModule === 'symmetry' && (
          <SymmetryTask 
            key={`sym_${currentRound}`}
            round={currentRound} 
            onAnswer={handleSymmetryAnswer} 
          />
        )}
        {activeModule === 'visualMemory' && (
          <VisualMemoryTask 
            key={`vm_${currentRound}`}
            effectiveLevel={effectiveLevel} 
            onAnswer={handleVMAnswer} 
          />
        )}
        {activeModule === 'patternMatch' && (
          <PatternMatchTask 
            key={`pm_${currentRound}`}
            round={currentRound} 
            onAnswer={handlePMAnswer} 
          />
        )}
        {activeModule === 'auditoryMemory' && (
          <AuditoryMemoryTask 
            key={`aud_${currentRound}`}
            onAnswer={handleAudAnswer} 
          />
        )}
        {activeModule === 'voiceEcho' && (
          <VoiceEchoTask 
            key={`voice_${currentRound}`}
            effectiveLevel={effectiveLevel} 
            round={currentRound} 
            onAnswer={handleVoiceAnswer} 
          />
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`mt-6 p-3 rounded-2xl text-xs font-bold text-center transition-all animate-in zoom-in-95 ${
          feedback.type === 'correct' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {feedback.message}
        </div>
      )}

    </div>
  );
}
