
import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppState, SiteConfig, Profile } from './types.ts';
import { DEFAULT_CONFIG, INITIAL_PROFILE } from './constants.tsx';
import { Button, Card } from './components/ui.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // 보안 환경에 따라 window.scrollTo가 제한될 수 있으므로 try-catch 처리
    try {
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn("ScrollToTop failed:", e);
    }
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

const Navbar: React.FC<{ siteName: string; onAdminToggle: () => void }> = ({ siteName, onAdminToggle }) => {
  const words = siteName?.split(' ') || ["AI", "ECONOMICS"];
  return (
    <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo size={40} className="group-hover:rotate-12 transition-transform duration-500" />
          <span className="text-2xl font-brand font-extrabold tracking-tighter text-white">
            {words[0]}<span className="text-indigo-400"> {words.slice(1).join(' ')}</span>
          </span>
        </Link>
        <div className="hidden md:flex space-x-12 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Strategic Ops</Link>
          <Link to="/profile" className="hover:text-white transition-colors">Expert Profile</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Inquiry</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onAdminToggle} className="p-2 text-gray-500 hover:text-white transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>
          <Link to="/contact">
            <Button className="hidden sm:block">Work with Us</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const ContactView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("https://formspree.io/f/xdaokrzk", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) setStatus('success');
      else setStatus('error');
    } catch (err) { 
      console.error("Submission error:", err);
      setStatus('error'); 
    }
  };

  return (
    <section className="pt-48 pb-32 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-4">Strategic Inquiry</h2>
        <h1 className="text-4xl md:text-6xl font-brand font-black text-white tracking-tighter">Let's redefine your AI trajectory.</h1>
      </div>
      {status === 'success' ? (
        <Card className="p-16 bg-zinc-900/60 border-indigo-500/50 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-brand font-black text-white mb-4 uppercase tracking-widest">Inquiry Received</h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto">Your brief has been securely transmitted. Our team will review and respond within 24 business hours.</p>
          <Button onClick={() => setStatus('idle')} variant="outline">New Inquiry</Button>
        </Card>
      ) : (
        <Card className="p-8 md:p-12 bg-zinc-900/60 border-white/5 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Full Name</label>
                <input required name="name" type="text" disabled={status === 'submitting'} className="w-full bg-black/40 border border-white/10 rounded-sm p-4 text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Email</label>
                <input required name="email" type="email" disabled={status === 'submitting'} className="w-full bg-black/40 border border-white/10 rounded-sm p-4 text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Organization</label>
              <input name="organization" type="text" disabled={status === 'submitting'} className="w-full bg-black/40 border border-white/10 rounded-sm p-4 text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Strategic Brief</label>
              <textarea required name="message" disabled={status === 'submitting'} className="w-full bg-black/40 border border-white/10 rounded-sm p-4 text-white focus:border-indigo-500 outline-none transition-all min-h-[150px] disabled:opacity-50"></textarea>
            </div>
            <Button type="submit" disabled={status === 'submitting'} className="w-full py-5 text-lg">
              {status === 'submitting' ? 'Transmitting...' : 'Initialize Consultation'}
            </Button>
            {status === 'error' && <p className="text-red-400 text-center text-xs uppercase font-black">Transmission failed. Please try again.</p>}
          </form>
        </Card>
      )}
    </section>
  );
};

const ProfileView: React.FC<{ profile: Profile }> = ({ profile }) => (
  <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto animate-in fade-in duration-1000">
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-2">Technical Mastery</h3>
          {profile?.skills?.map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                <span>{skill.name}</span>
                <span>{skill.level}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden rounded-full">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000" style={{ width: `${skill.level}%` }} />
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
      </div>
    </div>
  </section>
);

const Hero: React.FC<{ config: SiteConfig }> = ({ config }) => {
  const headingParts = config?.heroHeading?.split('ROI') || [config?.heroHeading || "ROI Strategy"];
  return (
    <section className="relative pt-48 pb-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="max-w-7xl mx-auto px-6 relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black tracking-[0.3em] uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          {config?.tagline}
        </div>
        <h1 className="text-5xl md:text-8xl font-brand font-black text-white mb-8 leading-[1.1] tracking-tight max-w-5xl">
          {headingParts[0]}
          {headingParts.length > 1 && <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">ROI</span>}
          {headingParts.slice(1).join('ROI')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl leading-relaxed">{config?.heroSubheading}</p>
        <div className="flex flex-col sm:flex-row gap-5">
          <Link to="/profile"><Button className="px-12 py-5 text-lg">View Expert Profile</Button></Link>
          <Link to="/contact"><Button variant="outline" className="px-12 py-5 text-lg">Strategic Inquiry</Button></Link>
        </div>
      </div>
    </section>
  );
};

const BackgroundLayer: React.FC = () => (
  <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#020205]" />
    <div 
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
      style={{ 
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
        opacity: 0.1
      }} 
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#020205] via-[#020205]/90 to-[#020205]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03)_0%,transparent_100%)]" />
  </div>
);

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // LocalStorage 접근 시 보안 오류 방지
    try {
      const saved = localStorage.getItem('ai_economics_v6_restored');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.config && parsed.profile) {
          setState({
            config: { ...DEFAULT_CONFIG, ...parsed.config },
            profile: { ...INITIAL_PROFILE, ...parsed.profile }
          });
          return;
        }
      }
    } catch (e) {
      console.warn("LocalStorage access denied or corrupted. Using defaults.", e);
    }
    setState({ config: DEFAULT_CONFIG, profile: INITIAL_PROFILE });
  }, []);

  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem('ai_economics_v6_restored', JSON.stringify(state));
      } catch (e) {
        // LocalStorage 쓰기 제한 시 무시
      }
    }
  }, [state]);

  if (!state) return null;

  const updateConfig = (newConfig: Partial<SiteConfig>) => 
    setState(prev => prev ? ({ ...prev, config: { ...prev.config, ...newConfig } }) : null);
  
  const updateProfile = (newProfile: Partial<Profile>) => 
    setState(prev => prev ? ({ ...prev, profile: { ...prev.profile, ...newProfile } }) : null);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#020205] selection:bg-indigo-500/30 text-white relative font-sans">
        <BackgroundLayer />
        <Navbar siteName={state.config?.siteName} onAdminToggle={() => setIsAdminOpen(!isAdminOpen)} />
        {isAdminOpen && <AdminDashboard state={state} onUpdateConfig={updateConfig} onUpdateProfile={updateProfile} />}
        <Routes>
          <Route path="/" element={<main><Hero config={state.config} /></main>} />
          <Route path="/profile" element={<ProfileView profile={state.profile} />} />
          <Route path="/contact" element={<ContactView />} />
        </Routes>
      </div>
    </Router>
  );
}
