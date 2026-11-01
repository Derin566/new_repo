import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  LogOut, 
  Brain, 
  Volume2, 
  Mic, 
  Shapes, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Play,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService, databaseService } from './firebase';
import GameSuite from './components/GameSuite';
import ResultsSummary from './components/ResultsSummary';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Child profile
  const [childName, setChildName] = useState('Alex');
  const [childAge, setChildAge] = useState(8);
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [avatarTab, setAvatarTab] = useState('animals');

  // Game Flow state: 'dashboard' | 'playing' | 'results'
  const [gameState, setGameState] = useState('dashboard');
  const [extractedFeatures, setExtractedFeatures] = useState(null);

  // Admin Config state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState({
    roundsPerGame: 3,
    timeLimitSeconds: 15,
    difficultyMode: 'auto', // 'auto' | 'level1' | 'level2' | 'level3'
    enabledModules: {
      visualSearch: true,
      symmetry: true,
      visualMemory: true,
      patternMatch: true,
      auditoryMemory: true,
      voiceEcho: true
    }
  });

  const animalAvatars = ['🦊', '🐼', '🦁', '🐯', '🐻', '🐰', '🐨', '🦉', '🐬', '🐶', '🐱', '🐸', '🐧', '🦒', '🐘'];
  const fictionalAvatars = ['🦄', '🐲', '🤖', '🚀', '👾', '🦸', '🧙‍♂️', '🧚', '🦖', '🌟', '⚡', '🧞', '🛸', '🧜'];

  // Check persisted user on load
  useEffect(() => {
    const saved = authService.getCurrentUser();
    if (saved) {
      setUser(saved);
      if (saved.learner) {
        if (saved.learner.childName) setChildName(saved.learner.childName);
        if (saved.learner.childAge) setChildAge(saved.learner.childAge);
        if (saved.learner.avatar) setSelectedAvatar(saved.learner.avatar);
      }
    }
    const savedLearner = localStorage.getItem('dyslexia_learner');
    if (savedLearner) {
      try {
        const parsed = JSON.parse(savedLearner);
        if (parsed.childName) setChildName(parsed.childName);
        if (parsed.childAge) setChildAge(parsed.childAge);
        if (parsed.avatar) setSelectedAvatar(parsed.avatar);
      } catch (e) {}
    }
  }, []);

  // Handle Login / Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isSignUp) {
        res = await authService.signup(email, password, 'parent', name || 'Parent');
      } else {
        res = await authService.login(email, password, 'parent');
      }

      if (res.success) {
        setUser(res.user);
        if (res.learner) {
          if (res.learner.childName) setChildName(res.learner.childName);
          if (res.learner.childAge) setChildAge(res.learner.childAge);
          if (res.learner.avatar) setSelectedAvatar(res.learner.avatar);
        }
        triggerGentleConfetti();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Click Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.loginWithGoogle('parent');
      if (res.success) {
        setUser(res.user);
        triggerGentleConfetti();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google login cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setGameState('dashboard');
  };

  // Play button trigger
  const handlePlayClick = async () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Auto-sync learner profile to real Cloud Firestore
    if (user && user.uid) {
      await databaseService.saveLearnerProfile(user.uid, {
        childName,
        childAge,
        avatar: selectedAvatar
      });
    }
    setGameState('playing');
  };

  const handleFinishGame = (features) => {
    setExtractedFeatures(features);
    setGameState('results');
  };

  const triggerGentleConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1D3557] flex flex-col justify-between selection:bg-[#FFE8D6]">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100/60 sticky top-0 z-40 px-6 py-4 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2A9D8F] to-[#457B9D] flex items-center justify-center text-white shadow-md shadow-teal-900/10">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1D3557]">
                Dyslexia Monitoring System
              </h1>
              <p className="text-xs text-[#6C757D] font-medium hidden sm:block">
                Multimodal Screening & Adaptive Support
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Admin Portal Toggle Button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all shadow-xs cursor-pointer"
              title="Configure rounds and view database"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Portal</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/60 px-3.5 py-1.5 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-medium text-[#1D3557]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1 hover:text-red-500 text-gray-400 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#2A9D8F] font-semibold bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#C8E6C9]">
                <ShieldCheck className="w-4 h-4" />
                <span>Firestore Live</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {!user ? (
          /* ============================================================== */
          /*                       LOGIN / SIGNUP VIEW                      */
          /* ============================================================== */
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100/70 p-6 sm:p-8 relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-3 border border-amber-200/50">
                <HeartHandshake className="w-3.5 h-3.5 text-[#E76F51]" />
                <span>A safe, supportive space for every learner</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#1D3557] tracking-tight">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                {isSignUp
                  ? 'Join to start screening and track personalized progress.'
                  : 'Log in to continue monitoring and screening.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2A9D8F] hover:bg-[#21867a] active:scale-[0.99] text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create My Account' : 'Sign In to System'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                {isSignUp ? (
                  <span>Already have an account? <strong className="text-[#2A9D8F]">Log in here</strong></span>
                ) : (
                  <span>New to the system? <strong className="text-[#2A9D8F]">Create free account</strong></span>
                )}
              </button>
            </div>
          </div>
        ) : gameState === 'playing' ? (
          /* ============================================================== */
          /*                 ACTIVE GAME SUITE RUNNING                      */
          /* ============================================================== */
          <GameSuite
            childName={childName}
            childAge={childAge}
            avatar={selectedAvatar}
            adminConfig={adminConfig}
            onFinishGame={handleFinishGame}
          />
        ) : gameState === 'results' ? (
          /* ============================================================== */
          /*                 RESULTS & EXTRACTED FEATURES SCREEN             */
          /* ============================================================== */
          <ResultsSummary
            features={extractedFeatures}
            avatar={selectedAvatar}
            onPlayAgain={() => setGameState('dashboard')}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        ) : (
          /* ============================================================== */
          /*                 POST-LOGIN SCREEN WITH PLAY BUTTON             */
          /* ============================================================== */
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-amber-100/70 p-6 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FFE8D6] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#E8F5E9] rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] tracking-tight">
              {user.isNewUser ? 'Welcome, New Explorer!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm mt-2">
              {user.isNewUser
                ? `Account active for ${user.email}. Set up your child's profile below to begin!`
                : `Logged in as ${user.email}. Profile loaded from Cloud Firestore.`}
            </p>

            {/* Child Profile inside the Play Screening Page */}
            <div className="mt-6 p-5 bg-[#FDFBF7] rounded-3xl border border-amber-200/70 max-w-lg mx-auto text-left shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#E76F51]" />
                  <span>Learner Profile</span>
                </span>
                <span className="text-xs text-[#2A9D8F] font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Ready for Assessment
                </span>
              </div>

              {/* Avatar Picker with Tabs */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Choose Your Character
                  </label>
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAvatarTab('animals')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        avatarTab === 'animals'
                          ? 'bg-white text-[#1D3557] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🐾 Animals
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarTab('fiction')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        avatarTab === 'fiction'
                          ? 'bg-white text-[#1D3557] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🚀 Cartoons & Fiction
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 max-h-28 overflow-y-auto p-1 bg-white rounded-2xl border border-gray-100">
                  {(avatarTab === 'animals' ? animalAvatars : fictionalAvatars).map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-2xl p-2 rounded-xl transition-all cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-amber-100 ring-2 ring-[#2A9D8F] scale-110 shadow-sm'
                          : 'hover:bg-gray-50 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nickname & Age inputs side by side */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Learner Nickname
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Age</label>
                    <span className="text-[10px] text-gray-400 font-medium">(5–14)</span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="14"
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    onBlur={() => {
                      if (childAge < 5) setChildAge(5);
                      if (childAge > 14) setChildAge(14);
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
              </div>
            </div>

            {/* THE BIG VIBRANT PLAY BUTTON */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={handlePlayClick}
                className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-[#2A9D8F] via-[#21867a] to-[#457B9D] rounded-full shadow-xl shadow-teal-800/30 hover:shadow-2xl hover:shadow-teal-800/40 hover:scale-105 active:scale-95 transition-all duration-300 bounce-gentle cursor-pointer"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white ml-1 text-white" />
                </div>
                <span>PLAY SCREENING</span>
              </button>
            </div>

            {/* Game Quest Activities Preview */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Shapes className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D3557]">Visual Games</h4>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    Search & mirror symmetry
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D3557]">Auditory Games</h4>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    Rhythm beat & tone memory
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D3557]">Voice Task</h4>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    NWRT clinical speech echo
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminConfig={adminConfig}
        setAdminConfig={setAdminConfig}
      />

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-amber-100/40">
        <p>Dyslexia Monitoring System • Cognitive Game Suite & ML Feature Extraction</p>
      </footer>
    </div>
  );
}
