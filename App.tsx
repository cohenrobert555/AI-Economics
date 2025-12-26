
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
    <circle cx="50" cy="75" r="6" fill="white" fillOpacity="0.5" />
    <path d="M15 25L17 20L22 18L17 16L15 11L13 16L8 18L13 20L15 25Z" fill="#FDE047" />
    <path d="M85 45L87 40L92 38L87 36L85 31L83 36L78 38L83 40L85 45Z" fill="#FDE047" />
    <path d="M75 15L77 12L81 11L77 10L75 7L73 10L69 11L73 12L75 15Z" fill="#FDE047" />
  </svg>
);

const Navbar: React.FC<{ siteName: string; onAdminToggle: () => void; isAdminOpen: boolean }> = ({ siteName, onAdminToggle, isAdminOpen }) => (
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
        <button onClick={onAdminToggle} title="Admin Dashboard" className="p-2 text-gray-500 hover:text-white transition-colors">
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
            <img 
              src={profile?.imageUrl || ""} 
              alt={profile?.name || "Expert"} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
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
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" 
                  style={{ width: `${skill.level}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 space-y-4">
           <a href="mailto:info@aieconomics.ai" className="block">
             <Button className="w-full text-[10px] tracking-[0.2em] bg-indigo-600">Contact Dr. Cohen</Button>
           </a>
        </div>
      </aside>

      <div className="space-y-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8 border-l-2 border-indigo-500 pl-4">Executive Brief</h2>
          <p className="text-2xl md:text-4xl text-white font-medium leading-[1.3] mb-12">
            Harnessing <span className="text-indigo-400">quantitative economics</span> to validate the <span className="text-indigo-400">ROI of Multiagent AI</span> in the global workforce.
          </p>
          <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed space-y-8">
            <p className="text-xl text-indigo-100/80 font-light italic border-l-4 border-indigo-500/30 pl-8 bg-indigo-500/5 py-4 rounded-r-lg">{profile?.bio}</p>
          </div>
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

        <div className="animate-in fade-in duration-1000 delay-300">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-10 border-l-2 border-indigo-500 pl-4">Strategic Milestones</h2>
          <div className="grid gap-4">
            {profile?.achievements?.map((item, i) => (
              <div key={i} className="flex gap-8 items-center p-6 bg-white/5 border border-white/5 rounded-xl group hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300">
                <span className="text-indigo-500 font-black text-2xl opacity-40 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
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
    <BrandLogo size={400} className="absolute -top-20 -right-20 opacity-10 blur-sm -z-10 rotate-12" />
    <div className="max-w-7xl mx-auto px-6 relative">
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black tracking-[0.3em] uppercase">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        {config?.tagline || "Strategic AI Consulting"}
      </div>
      <h1 className="text-5xl md:text-8xl font-brand font-black text-white mb-8 leading-[1.1] tracking-tight max-w-5xl">
        Decoding the <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Economic</span> ROI of AI
      </h1>
      <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl leading-relaxed">
        {config?.heroSubheading}
      </p>
      <div className="flex flex-col sm:flex-row gap-5">
        <Link to="/profile">
          <Button className="px-12 py-5 text-xl bg-gradient-to-r from-indigo-600 to-purple-600 border-none w-full sm:w-auto">
            View Expert Profile
          </Button>
        </Link>
        <Link to="/contact">
          <Button variant="outline" className="px-12 py-5 text-xl border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">
            Request Consultation
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

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
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section className="pt-48 pb-32 px-6 max-w-4xl mx-auto min-h-screen">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8 border-l-2 border-indigo-500 pl-4">Strategic Inquiry</h2>
      <h1 className="text-4xl md:text-6xl font-brand font-black text-white mb-12 tracking-tight">Let's redefine your AI trajectory.</h1>
      
      {status === 'success' ? (
        <Card className="p-10 bg-zinc-900/60 border-indigo-500/50 text-center animate-in fade-in zoom-in duration-500">
          <div className="text-indigo-400 text-6xl mb-6">✓</div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Inquiry Received</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">Thank you for your interest. Dr. Cohen's strategic team will review your inquiry and reach out within 24 business hours.</p>
          <Button onClick={() => setStatus('idle')}>New Intelligence Request</Button>
        </Card>
      ) : (
        <Card className="p-10 bg-zinc-900/60 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</label>
                <input 
                  required
                  name="name"
                  type="text" 
                  disabled={status === 'submitting'}
                  className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-colors disabled:opacity-50" 
                  placeholder="Full Name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                <input 
                  required
                  name="email"
                  type="email" 
                  disabled={status === 'submitting'}
                  className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-colors disabled:opacity-50" 
                  placeholder="email@company.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Organization</label>
              <input 
                name="organization"
                type="text" 
                disabled={status === 'submitting'}
                className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-colors disabled:opacity-50" 
                placeholder="Company Name" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inquiry Brief</label>
              <textarea 
                required
                name="message"
                disabled={status === 'submitting'}
                className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-colors min-h-[150px] disabled:opacity-50" 
                placeholder="Describe your strategic requirements..."
              ></textarea>
            </div>
            <Button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-5 text-lg"
            >
              {status === 'submitting' ? 'Transmitting...' : 'Send Intelligence Request'}
            </Button>
            {status === 'error' && (
              <p className="text-red-400 text-xs text-center mt-4 uppercase tracking-widest font-bold">Transmission failed. Please try again or contact info@aieconomics.ai.</p>
            )}
          </form>
        </Card>
      )}
    </section>
  );
};

const Footer: React.FC<{ siteName: string }> = ({ siteName }) => (
  <footer className="border-t border-white/5 py-20 mt-20 bg-zinc-950">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
      <div className="max-w-xs">
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo size={32} />
          <span className="text-xl font-brand font-bold text-white">AIECONOMICS</span>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">
          The industry standard for analyzing ROI in Multiagent AI Systems and algorithmic economic modeling.
        </p>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
      <span>© 2024 AI Economics | Dr. Robert B. Cohen</span>
    </div>
  </footer>
);

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('ai_economics_state_cohen_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile && parsed.config) return parsed;
      }
    } catch (e) {
      console.error("Failed to load saved state", e);
    }
    return { config: DEFAULT_CONFIG, profile: INITIAL_PROFILE };
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai_economics_state_cohen_v5', JSON.stringify(state));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable", e);
    }
  }, [state]);

  const updateConfig = (newConfig: SiteConfig) => setState(prev => ({ ...prev, config: newConfig }));
  const updateProfile = (newProfile: Profile) => setState(prev => ({ ...prev, profile: newProfile }));

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#020205] selection:bg-indigo-500/30">
        <Navbar 
          siteName={state.config?.siteName || "AI Economics"} 
          onAdminToggle={() => setIsAdminOpen(!isAdminOpen)} 
          isAdminOpen={isAdminOpen}
        />
        
        {isAdminOpen && (
          <AdminDashboard 
            state={state} 
            onUpdateConfig={updateConfig} 
            onUpdateProfile={updateProfile}
          />
        )}

        <Routes>
          <Route path="/" element={
            <main>
              <Hero config={state.config} />
              <Footer siteName={state.config?.siteName} />
            </main>
          } />
          <Route path="/profile" element={
            <>
              <ProfileView profile={state.profile} />
              <Footer siteName={state.config?.siteName} />
            </>
          } />
          <Route path="/contact" element={
            <>
              <ContactView />
              <Footer siteName={state.config?.siteName} />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
