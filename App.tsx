
import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppState, SiteConfig, Profile } from './types.ts';
import { DEFAULT_CONFIG, INITIAL_PROFILE } from './constants.tsx';
import { Button, Card } from './components/ui.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const BrandLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="logoGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="70%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#312E81" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#logoGrad)" filter="url(#glow)" />
    <circle cx="50" cy="30" r="8" fill="white" fillOpacity="0.4" />
    <circle cx="30" cy="60" r="10" fill="white" fillOpacity="0.3" />
    <circle cx="70" cy="60" r="12" fill="white" fillOpacity="0.2" />
    <path d="M15 25L17 20L22 18L17 16L15 11L13 16L8 18L13 20L15 25Z" fill="#FDE047" />
  </svg>
);

const Navbar: React.FC<{ siteName: string; onAdminToggle: () => void }> = ({ siteName, onAdminToggle }) => (
  <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <BrandLogo size={40} className="group-hover:rotate-12 transition-transform duration-500" />
        <span className="text-2xl font-brand font-extrabold tracking-tighter text-white">
          {siteName?.split(' ')[0] || "AI"}<span className="text-indigo-400">{siteName?.split(' ')[1] || "ECONOMICS"}</span>
        </span>
      </Link>
      <div className="hidden md:flex space-x-12 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
        <Link to="/" className="hover:text-white transition-colors">Strategic Ops</Link>
        <Link to="/profile" className="hover:text-white transition-colors">Expert Profile</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Inquiry</Link>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onAdminToggle} className="p-2 text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
        <Link to="/contact">
          <Button className="hidden sm:block">Work with Us</Button>
        </Link>
      </div>
    </div>
  </nav>
);

const ProfileView: React.FC<{ profile: Profile }> = ({ profile }) => (
  <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-[1fr_2.5fr] gap-20 items-start">
      <aside className="lg:sticky lg:top-48">
        <div className="relative mb-10 w-full group">
          <div className="absolute -inset-4 bg-indigo-600/20 blur-2xl group-hover:bg-indigo-600/30 transition-all duration-700" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-900">
            <img src={profile?.imageUrl} alt={profile?.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
        <h1 className="text-3xl font-brand font-black text-white mb-2 leading-tight">{profile?.name}</h1>
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-8">{profile?.title}</p>
        
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-2 text-center md:text-left">Technical Mastery</h3>
          {profile?.skills?.map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                <span>{skill.name}</span>
                <span>{skill.level}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden rounded-full">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${skill.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-16">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8 border-l-2 border-indigo-500 pl-4">Executive Brief</h2>
          <p className="text-2xl md:text-4xl text-white font-medium leading-[1.3] mb-12">{profile?.bio}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {profile?.detailedSections?.map((section, i) => (
            <Card key={i} className="p-10 border-white/5 hover:border-indigo-500/20 transition-all group bg-zinc-900/40">
              <h3 className="text-indigo-500 font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-3">
                <span className="w-4 h-[1px] bg-indigo-500" />
                {section.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
            </Card>
          ))}
        </div>

        <div className="animate-in fade-in duration-1000">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-10 border-l-2 border-indigo-500 pl-4">Strategic Milestones</h2>
          <div className="grid gap-4">
            {profile?.achievements?.map((item, i) => (
              <div key={i} className="flex gap-8 items-center p-6 bg-white/5 border border-white/5 rounded-xl group hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300">
                <span className="text-indigo-500 font-black text-2xl opacity-40 group-hover:opacity-100">0{i + 1}</span>
                <p className="text-white text-base font-medium leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Hero: React.FC<{ config: SiteConfig }> = ({ config }) => (
  <section className="relative pt-48 pb-32 overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
    <div className="max-w-7xl mx-auto px-6 relative">
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black tracking-[0.3em] uppercase">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        {config?.tagline || "Strategic AI Consulting"}
      </div>
      <h1 className="text-5xl md:text-8xl font-brand font-black text-white mb-8 leading-[1.1] tracking-tight max-w-5xl">
        Decoding the <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Economic</span> ROI of AI
      </h1>
      <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl leading-relaxed">{config?.heroSubheading}</p>
      <div className="flex flex-col sm:flex-row gap-5">
        <Link to="/profile"><Button className="px-12 py-5 text-lg">View Profile</Button></Link>
        <Link to="/contact"><Button variant="outline" className="px-12 py-5 text-lg">Inquiry</Button></Link>
      </div>
    </div>
  </section>
);

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('ai_economics_v6_restored');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return { config: DEFAULT_CONFIG, profile: INITIAL_PROFILE };
  });

  useEffect(() => {
    localStorage.setItem('ai_economics_v6_restored', JSON.stringify(state));
  }, [state]);

  const updateConfig = (newConfig: SiteConfig) => setState(prev => ({ ...prev, config: newConfig }));
  const updateProfile = (newProfile: Profile) => setState(prev => ({ ...prev, profile: newProfile }));

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#020205] selection:bg-indigo-500/30">
        <Navbar siteName={state.config?.siteName} onAdminToggle={() => setIsAdminOpen(!isAdminOpen)} />
        {isAdminOpen && <AdminDashboard state={state} onUpdateConfig={updateConfig} onUpdateProfile={updateProfile} />}
        <Routes>
          <Route path="/" element={<main><Hero config={state.config} /></main>} />
          <Route path="/profile" element={<ProfileView profile={state.profile} />} />
          <Route path="/contact" element={<div className="pt-48 px-6 max-w-2xl mx-auto text-center"><h1 className="text-4xl font-brand font-black mb-8">Consultation Inquiry</h1><p className="text-gray-400 leading-relaxed">Please contact info@aieconomics.ai for strategic advisory requests.</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}
