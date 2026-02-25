import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Download, Copy, Sun, Moon, MapPin, X, Plus, Briefcase, ChevronRight, Target, TrendingUp, Star, AlertTriangle, BookOpen, BarChart3, Sparkles } from 'lucide-react';

// ─── Inject global animations ───────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; }

  body { font-family: 'DM Sans', sans-serif; }

  .font-display { font-family: 'Syne', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes growDown {
    from { height: 0; }
    to   { height: 100%; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  .anim-fade-up   { animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-fade-in   { animation: fadeIn 0.5s ease both; }
  .anim-slide-r   { animation: slideRight 0.5s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-float     { animation: float 3s ease-in-out infinite; }
  .anim-pulse-glow { animation: pulse-glow 2s infinite; }

  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
  .delay-6 { animation-delay: 0.6s; }
  .delay-7 { animation-delay: 0.7s; }

  .shimmer-text {
    background: linear-gradient(90deg, #f97316 0%, #fbbf24 40%, #f97316 60%, #fbbf24 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  .glass-card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .timeline-line {
    animation: growDown 1.2s ease forwards;
    animation-delay: 0.3s;
  }

  .prose-custom h1, .prose-custom h2, .prose-custom h3 {
    font-family: 'Syne', sans-serif;
    color: #fdba74;
    margin-top: 0.75em;
    margin-bottom: 0.4em;
  }
  .prose-custom p { margin: 0.4em 0; line-height: 1.7; color: #d4d4d8; }
  .prose-custom ul { padding-left: 1.2em; margin: 0.4em 0; }
  .prose-custom li { color: #d4d4d8; margin: 0.2em 0; line-height: 1.6; }
  .prose-custom strong { color: #fb923c; }
  .prose-custom code { background: rgba(249,115,22,0.15); color: #fb923c; padding: 1px 6px; border-radius: 4px; font-size: 0.85em; }

  .skill-bar-fill {
    animation: growRight 1.2s cubic-bezier(.22,.68,0,1.2) forwards;
  }
  @keyframes growRight {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }

  .step-card:hover {
    transform: translateY(-2px);
    border-color: rgba(249,115,22,0.4);
    transition: all 0.3s ease;
  }

  .noise-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  input, textarea, select { font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 3px; }
`;

// ─── Section config ──────────────────────────────────────────────────────────
const SECTION_CONFIG = [
  {
    key: 'assessment',
    emoji: '📊',
    label: 'Skill Match',
    sublabel: 'Where you stand today',
    icon: BarChart3,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    dot: '#3b82f6',
    keywords: ['Skill Match', 'Assessment', 'match'],
  },
  {
    key: 'short',
    emoji: '🎯',
    label: '0–6 Months',
    sublabel: 'Quick wins & foundations',
    icon: Target,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.25)',
    dot: '#f97316',
    keywords: ['Short-Term', '0–6', 'Short Term'],
  },
  {
    key: 'medium',
    emoji: '🛤️',
    label: '6–18 Months',
    sublabel: 'Build experience & portfolio',
    icon: TrendingUp,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
    dot: '#a855f7',
    keywords: ['Medium-Term', '6–18', 'Medium Term'],
  },
  {
    key: 'long',
    emoji: '🌟',
    label: '18+ Months',
    sublabel: 'Senior roles & leadership',
    icon: Star,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.08)',
    border: 'rgba(234,179,8,0.25)',
    dot: '#eab308',
    keywords: ['Long-Term', '18+', 'Long Term', 'Vision'],
  },
  {
    key: 'roadblocks',
    emoji: '⚠️',
    label: 'Roadblocks',
    sublabel: 'Challenges & how to beat them',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    dot: '#ef4444',
    keywords: ['Roadblock', 'Overcome', 'Challenge'],
  },
  {
    key: 'resources',
    emoji: '📚',
    label: 'Resources',
    sublabel: 'Learn & level up',
    icon: BookOpen,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    dot: '#10b981',
    keywords: ['Resource', 'Course', 'Learn'],
  },
];

// ─── Parse markdown into sections ────────────────────────────────────────────
function parseRoadmap(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = null;
  let titleLine = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      titleLine = line.replace(/^# /, '');
    } else if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      const heading = line.replace(/^## /, '');
      const config = SECTION_CONFIG.find(c =>
        c.keywords.some(k => heading.toLowerCase().includes(k.toLowerCase()))
      );
      currentSection = { heading, content: '', config: config || null };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  if (currentSection) sections.push(currentSection);
  return { title: titleLine, sections };
}

// ─── Animated Step Card ───────────────────────────────────────────────────────
function StepCard({ section, index, isLast }) {
  const cfg = section.config;
  const Icon = cfg?.icon || Sparkles;
  const color = cfg?.color || '#f97316';
  const bg = cfg?.bg || 'rgba(249,115,22,0.08)';
  const border = cfg?.border || 'rgba(249,115,22,0.25)';

  return (
    <div className="flex gap-4 anim-fade-up" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
      {/* Timeline spine */}
      <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
        <div
          className="anim-pulse-glow w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{ background: `${color}22`, border: `2px solid ${color}`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-1"
            style={{ background: `linear-gradient(to bottom, ${color}60, transparent)`, minHeight: 32 }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className="step-card flex-1 rounded-2xl p-5 mb-4 cursor-default"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{cfg?.emoji || '📌'}</span>
          <div>
            <div className="font-display font-700 text-base" style={{ color, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              {cfg?.label || section.heading}
            </div>
            {cfg?.sublabel && (
              <div className="text-xs" style={{ color: `${color}99` }}>{cfg.sublabel}</div>
            )}
          </div>
        </div>
        <div className="prose-custom text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content.trim()}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// ─── Roadmap Timeline View ────────────────────────────────────────────────────
function RoadmapView({ roadmap, onCopy, onDownload, darkMode }) {
  const { title, sections } = parseRoadmap(roadmap);

  return (
    <div className="anim-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium tracking-widest uppercase">Your Roadmap</span>
          </div>
          <h3
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: '#fdba74', maxWidth: 340 }}
          >
            {title || 'Personalized Career Path'}
          </h3>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition font-medium
              ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs transition font-medium"
          >
            <Download className="w-3 h-3" /> .md
          </button>
        </div>
      </div>

      {/* Progress pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SECTION_CONFIG.map((cfg, i) => (
          <div
            key={cfg.key}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium anim-fade-up"
            style={{
              background: `${cfg.color}15`,
              border: `1px solid ${cfg.color}30`,
              color: cfg.color,
              animationDelay: `${i * 0.06}s`
            }}
          >
            <span>{cfg.emoji}</span> {cfg.label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="overflow-y-auto flex-1 pr-1">
        {sections.map((section, i) => (
          <StepCard
            key={i}
            section={section}
            index={i}
            isLast={i === sections.length - 1}
          />
        ))}

        {/* Footer celebration */}
        <div className="text-center py-6 anim-fade-up" style={{ animationDelay: '0.9s' }}>
          <div className="text-3xl anim-float mb-2">🏆</div>
          <p className="text-sm text-zinc-500">You've got your roadmap — now go build it!</p>
          <p className="text-xs text-zinc-600 mt-1">Mumbai's best opportunities await 🚀</p>
        </div>
      </div>
    </div>
  );
}

// ─── Loading animation ────────────────────────────────────────────────────────
function LoadingView() {
  const steps = ['Analyzing your skills...', 'Mapping the job market...', 'Charting your path...', 'Crafting your roadmap...'];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full border-2 border-orange-500/20"
          style={{ animation: 'spin-slow 3s linear infinite' }}
        />
        <div
          className="absolute inset-2 rounded-full border-2 border-t-orange-500 border-r-amber-400 border-b-transparent border-l-transparent"
          style={{ animation: 'spin-slow 1.2s linear infinite' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl anim-float">🧭</div>
      </div>
      <div>
        <p className="text-orange-400 font-medium anim-fade-up text-sm tracking-wide" key={step}>
          {steps[step]}
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-orange-500"
            style={{ animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-5 anim-float">🗺️</div>
      <h3 className="text-lg font-bold text-zinc-400 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Your career map is waiting
      </h3>
      <p className="text-sm text-zinc-600 max-w-xs leading-relaxed">
        Fill in your designation, skills & target job description, then click Generate to see your step-by-step path.
      </p>
      <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
        {['📊 Skill gap analysis', '🎯 3-phase action plan', '📚 India-specific resources', '⚠️ Roadblock solutions'].map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-900/50 rounded-xl px-4 py-2.5 anim-slide-r"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <ChevronRight className="w-3 h-3 text-orange-500/50" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [designation, setDesignation] = useState('');
  const [skillInput, setSkillInput]   = useState('');
  const [skills, setSkills]           = useState(['Flutter', 'Dart', 'React']);
  const [jobDescription, setJobDescription] = useState('We are looking for a Senior Flutter Developer with experience in BLoC architecture, Firebase, and RESTful APIs.');
  const [model, setModel]             = useState('gemini-2.5-flash');
  const [roadmap, setRoadmap]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [darkMode, setDarkMode]       = useState(true);

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) setSkills([...skills, t]);
    setSkillInput('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };

  const generateRoadmap = async () => {
    if (!designation.trim()) { setError('Please enter your current designation.'); return; }
    if (skills.length === 0) { setError('Please add at least one skill.'); return; }
    setLoading(true); setError(''); setRoadmap('');
    try {
      // For Local Run
      // const res = await axios.post('/api/generate-roadmap', {
      //   skills, designation: designation.trim(), job_description: jobDescription, model
      // });

      //For Production
      const res = await axios.post('https://career-gps-backend.vercel.app/api/generate-roadmap', {
           skills,
           designation: designation.trim(),
           job_description: jobDescription,
           model
         });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(roadmap); alert('✅ Copied!'); };
  const downloadMarkdown = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([roadmap], { type: 'text/markdown' }));
    a.download = `CareerGPS_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  const inputCls = `w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-all duration-200
    ${darkMode
      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-600 hover:border-zinc-700'
      : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 hover:border-zinc-300'}`;

  return (
    <>
      <style>{STYLES}</style>

      <div className={`min-h-screen relative ${darkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        {/* Noise overlay */}
        <div className="noise-overlay fixed inset-0 pointer-events-none z-0" />

        {/* Ambient glow */}
        {darkMode && (
          <>
            <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          </>
        )}

        {/* ── Navbar ── */}
        <nav className={`relative z-10 border-b backdrop-blur-xl sticky top-0
          ${darkMode ? 'border-zinc-800/60 bg-zinc-950/70' : 'border-zinc-200/80 bg-white/80'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 anim-fade-up">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center anim-pulse-glow"
                style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}>
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Career<span className="shimmer-text">GPS</span>
                </h1>
                <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  <MapPin className="w-3 h-3" /> Mumbai, India
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all ${darkMode ? 'hover:bg-zinc-800/80 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* ── Main Grid ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[calc(100vh-72px)]">

          {/* ── Left: Input Panel ── */}
          <div className="space-y-5 anim-fade-up delay-1">
            <div className="mb-2">
              <h2 className="text-3xl font-bold mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                Chart Your Next<br />
                <span className="shimmer-text">Career Move</span>
              </h2>
              <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Tell us where you are — we'll map where you're going.
              </p>
            </div>

            {/* Designation */}
            <div className="anim-fade-up delay-2">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 text-zinc-400 uppercase tracking-wider">
                <Briefcase className="w-3 h-3 text-orange-400" /> Current Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className={inputCls}
                placeholder="e.g. Junior Flutter Developer, Fresher, QA Engineer..."
              />
            </div>

            {/* Skills */}
            <div className="anim-fade-up delay-3">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 text-zinc-400 uppercase tracking-wider">
                Skills
                <span className={`normal-case text-xs font-normal ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  — press Enter or , to add
                </span>
              </label>
              <div className={`min-h-[72px] w-full border rounded-2xl p-3 flex flex-wrap gap-1.5 mb-2
                ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                {skills.map(skill => (
                  <span key={skill}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)' }}>
                    {skill}
                    <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-red-400 transition ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && <span className="text-zinc-600 text-xs self-center pl-1">No skills added yet...</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className={`${inputCls} flex-1`}
                  placeholder="Type a skill and press Enter..."
                />
                <button onClick={addSkill}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm transition flex items-center gap-1 font-medium whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="anim-fade-up delay-4">
              <label className="text-xs font-medium mb-1.5 text-zinc-400 uppercase tracking-wider block">
                Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className={`${inputCls} h-32 resize-none`}
                placeholder="Paste the full job description here..."
              />
            </div>

            {/* Model */}
            {/* <div className="anim-fade-up delay-5">
              <label className="text-xs font-medium mb-1.5 text-zinc-400 uppercase tracking-wider block">
                Gemini Model
              </label>
              <select value={model} onChange={e => setModel(e.target.value)} className={inputCls}>
                <option value="gemini-2.5-flash">gemini-2.5-flash — Fast & Free</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro — Best Quality</option>
              </select>
            </div> */}

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-2xl px-4 py-3 anim-fade-up">
                ⚠️ {error}
              </div>
            )}

            {/* Generate */}
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="anim-fade-up delay-6 w-full text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60"
              style={{
                background: loading ? '#78350f' : 'linear-gradient(135deg, #f97316, #f59e0b)',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(249,115,22,0.25)',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Charting your Mumbai career path...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate My Career GPS Roadmap</>
              )}
            </button>
          </div>

          {/* ── Right: Output Panel ── */}
          <div
            className="rounded-3xl p-7 flex flex-col anim-fade-up delay-2"
            style={{
              background: darkMode ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.9)',
              border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(20px)',
              minHeight: 600,
            }}
          >
            {loading ? (
              <LoadingView />
            ) : roadmap ? (
              <RoadmapView
                roadmap={roadmap}
                onCopy={copyToClipboard}
                onDownload={downloadMarkdown}
                darkMode={darkMode}
              />
            ) : (
              <EmptyView />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
