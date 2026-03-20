import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { auth, db } from './src/firebase';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Menu, X, ArrowRight, TrendingUp, Cpu, Globe, Lock, LogOut, Plus, Edit2, Trash2, ChevronRight, Save, History, Rocket, Github, Camera, Check, Loader2, Monitor, Tablet, Smartphone, Maximize, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './src/lib/utils';

// --- Contexts ---
interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface SiteSettings {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  opsTitle: string;
  opsDesc: string;
  opsImage: string;
  opsCards: { title: string; desc: string; image: string }[];
  ceoName: string;
  ceoTitle: string;
  ceoBio: string;
  ceoImage: string;
  inquiryTitle: string;
  inquirySubtitle: string;
  primaryFont: string;
  serifFont: string;
  stats: { value: string; label: string }[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroKicker: "ROI of Intelligent Systems",
  heroTitle: "Empowering Decisions Through AI-Driven Economic Mastery",
  heroSubtitle: "Analyzing the ROI of investments in AI models and Multiagent Systems with strategic precision.",
  heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  opsTitle: "Enterprise Scale Impact Analysis",
  opsDesc: "Executives need a clear, consistent way to understand the business value and return on investment of AI initiatives. We calculate ROI across AI models using proven, traditional economic analysis.",
  opsImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  opsCards: [
    {
      title: "Value Creation",
      desc: "AI can enhance productivity, fully automate specific tasks, or scale across the organization to drive step-change efficiency gains.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Service-as-Software",
      desc: "Navigating the shift where intelligence is embedded directly into core operations, lowering marginal costs across enterprise workflows.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
    }
  ],
  ceoName: "Robert B. Cohen, Ph.D.",
  ceoTitle: "CEO, AI Economics",
  ceoBio: "Dr. Robert B. Cohen is the CEO of AI Economics. This strategic firm analyzes the ROI of investments in AI models, specialized agents, and digital labor.",
  ceoImage: "https://via.placeholder.com/400x400/111/555?text=Robert+Cohen",
  inquiryTitle: "Strategic Inquiry",
  inquirySubtitle: "Quantify Your AI Investment",
  primaryFont: "'Inter', sans-serif",
  serifFont: "'Playfair Display', serif",
  stats: [
    { value: "98%", label: "ROI Accuracy" },
    { value: "100%", label: "Satisfaction" },
    { value: "50+", label: "Implementations" },
    { value: "$10B+", label: "Value Quantified" }
  ]
};

interface SiteContextType {
  settings: SiteSettings;
  isEditMode: boolean;
  isSaving: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile' | 'full';
  setEditMode: (val: boolean) => void;
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile' | 'full') => void;
  updateSetting: (key: keyof SiteSettings, value: any) => void;
  saveSettings: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
};

const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isEditMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile' | 'full'>('full');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'content');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching site settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply fonts to document
    if (settings.primaryFont) {
      document.documentElement.style.setProperty('--font-primary', settings.primaryFont);
    }
    if (settings.serifFont) {
      document.documentElement.style.setProperty('--font-serif', settings.serifFont);
    }
  }, [settings.primaryFont, settings.serifFont]);

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'content'), settings);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SiteContext.Provider value={{ settings, isEditMode, isSaving, previewDevice, setEditMode, setPreviewDevice, updateSetting, saveSettings }}>
      {children}
    </SiteContext.Provider>
  );
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          const newProfile = {
            displayName: u.displayName || 'Anonymous',
            email: u.email,
            role: u.email === 'cohenrobert555@gmail.com' ? 'admin' : 'client',
            createdAt: serverTimestamp(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

const EditableText: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
}> = ({ value, onChange, className, as: Component = 'span', multiline = false }) => {
  const { isEditMode } = useSite();

  if (!isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <div className={cn("relative group", className)}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded p-2 text-inherit focus:outline-none focus:border-accent min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded p-2 text-inherit focus:outline-none focus:border-accent"
        />
      )}
      <div className="absolute -top-6 right-0 bg-accent text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">EDITABLE</div>
    </div>
  );
};

const EditableImage: React.FC<{
  src: string;
  onChange: (val: string) => void;
  className?: string;
  alt?: string;
}> = ({ src, onChange, className, alt }) => {
  const { isEditMode } = useSite();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />;
  }

  return (
    <div 
      className={cn("relative group cursor-pointer overflow-hidden", className, isDragging && "ring-4 ring-accent")}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        };
        input.click();
      }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
        <Camera size={32} className="mb-2" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Click or Drop Image</span>
      </div>
    </div>
  );
};

const AdminBar = () => {
  const { isAdmin, logout } = useAuth();
  const { isEditMode, setEditMode, saveSettings, isSaving, settings, updateSetting, previewDevice, setPreviewDevice } = useSite();
  
  const fonts = [
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
    { name: 'Outfit', value: "'Outfit', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
    { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
    { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" }
  ];

  const [githubToken, setGithubToken] = useState<string | null>(localStorage.getItem('github_token'));
  const [isPushing, setIsPushing] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [repoName, setRepoName] = useState('ai-economics-export');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token;
        setGithubToken(token);
        localStorage.setItem('github_token', token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isAdmin) return null;

  const handleGithubConnect = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      const { url, error } = await response.json();
      if (error) {
        alert(error + "\n\nPlease add GITHUB_CLIENT_ID to Secrets in Settings.");
        return;
      }
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (err) {
      console.error(err);
      alert("Failed to connect to GitHub. Make sure the server is running.");
    }
  };

  const handleGithubPush = async () => {
    if (!githubToken) return;
    setIsPushing(true);
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken, repoName })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Successfully pushed to GitHub!\n\nURL: ${data.url}`);
        setShowRepoModal(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to push to GitHub.");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className={cn(
      "fixed top-0 w-full z-50 shadow-xl border-b transition-all duration-300",
      isEditMode ? "bg-white text-dark py-2 sm:py-3" : "bg-accentDark text-white py-1.5 sm:py-2"
    )}>
      {/* Repo Name Modal */}
      <AnimatePresence>
        {showRepoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 max-w-md w-full rounded-2xl shadow-2xl text-dark"
            >
              <h3 className="text-2xl font-serif mb-4">Export to GitHub</h3>
              <p className="text-gray-500 mb-6 text-sm">Enter the repository name where you want to save your project code.</p>
              <div className="space-y-4 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Repository Name</label>
                  <input 
                    type="text" 
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full border-b border-gray-200 py-2 outline-none focus:border-accent font-mono text-sm"
                    placeholder="my-ai-project"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleGithubPush}
                  disabled={isPushing}
                  className="flex-grow bg-blue-600 text-white py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  {isPushing ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
                  {isPushing ? "Pushing..." : "Push to GitHub"}
                </button>
                <button 
                  onClick={() => setShowRepoModal(false)}
                  className="flex-grow border border-gray-200 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-3">
            {isEditMode ? <Edit2 size={12} className="text-accent" /> : <Lock size={12} className="text-accentLight" />}
            <span className="font-bold tracking-widest uppercase">{isEditMode ? "Editing Mode" : "Admin Builder"}</span>
          </div>

          {isEditMode && (
            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Primary Font:</span>
                <select 
                  value={settings.primaryFont} 
                  onChange={(e) => updateSetting('primaryFont', e.target.value)}
                  className="bg-gray-100 border-none rounded px-2 py-1 text-[9px] outline-none focus:ring-1 focus:ring-accent"
                >
                  {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Serif Font:</span>
                <select 
                  value={settings.serifFont} 
                  onChange={(e) => updateSetting('serifFont', e.target.value)}
                  className="bg-gray-100 border-none rounded px-2 py-1 text-[9px] outline-none focus:ring-1 focus:ring-accent"
                >
                  {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {!isEditMode && (
            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-sm border border-white/10">
              <button 
                onClick={() => setPreviewDevice('full')}
                className={cn("p-1.5 rounded-sm transition", previewDevice === 'full' ? "bg-accent text-white" : "hover:bg-white/10 text-gray-400")}
                title="Full Screen"
              >
                <Maximize size={12} />
              </button>
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={cn("p-1.5 rounded-sm transition", previewDevice === 'desktop' ? "bg-accent text-white" : "hover:bg-white/10 text-gray-400")}
                title="Desktop View"
              >
                <Monitor size={12} />
              </button>
              <button 
                onClick={() => setPreviewDevice('tablet')}
                className={cn("p-1.5 rounded-sm transition", previewDevice === 'tablet' ? "bg-accent text-white" : "hover:bg-white/10 text-gray-400")}
                title="Tablet View"
              >
                <Tablet size={12} />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={cn("p-1.5 rounded-sm transition", previewDevice === 'mobile' ? "bg-accent text-white" : "hover:bg-white/10 text-gray-400")}
                title="Mobile View"
              >
                <Smartphone size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
          <button 
            onClick={() => {
              setEditMode(!isEditMode);
              if (!isEditMode) setPreviewDevice('full');
            }}
            className={cn(
              "px-3 py-1.5 rounded transition flex items-center",
              isEditMode ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/10 hover:bg-white/20"
            )}
          >
            {isEditMode ? <X size={12} className="mr-1.5" /> : <Edit2 size={12} className="mr-1.5" />}
            <span className="hidden sm:inline">{isEditMode ? "Cancel" : "Edit Site"}</span>
          </button>
          
          {isEditMode && (
            <button 
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-accent hover:bg-accentLight text-white px-4 py-1.5 rounded font-bold transition flex items-center shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Save size={12} className="mr-1.5" />}
              <span className="hidden sm:inline">Save Changes</span>
            </button>
          )}

          <div className={cn("h-4 w-px mx-1", isEditMode ? "bg-gray-200" : "bg-white/20")}></div>
          
          <Link to="/admin" className={cn(
            "px-2 sm:px-3 py-1.5 rounded transition flex items-center",
            isEditMode ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/10 hover:bg-white/20"
          )}>
            <TrendingUp size={12} className="mr-1.5" /> <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <button 
            onClick={() => window.open(window.location.origin, '_blank')}
            className={cn(
              "px-2 sm:px-3 py-1.5 rounded transition flex items-center",
              isEditMode ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/10 hover:bg-white/20"
            )}
          >
            <ExternalLink size={12} className="mr-1.5" /> <span className="hidden sm:inline">Live Site</span>
          </button>

          <button 
            onClick={githubToken ? () => setShowRepoModal(true) : handleGithubConnect}
            className={cn(
              "px-2 sm:px-3 py-1.5 rounded transition flex items-center",
              isEditMode ? "bg-gray-800 text-white hover:bg-black" : "bg-blue-600 hover:bg-blue-500 text-white",
              githubToken && "border border-blue-400"
            )}
          >
            <Github size={12} className="mr-1.5" /> 
            <span className="hidden sm:inline">
              {githubToken ? "Push to GitHub" : "Connect GitHub"}
            </span>
          </button>
          
          <button onClick={logout} className="bg-red-600 hover:bg-red-500 px-2 sm:px-3 py-1.5 rounded font-bold transition flex items-center ml-1 text-white">
            <LogOut size={12} className="mr-1.5" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, isAdmin, signIn } = useAuth();
  const { previewDevice, isEditMode } = useSite();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = (e: any) => {
      const target = e.target === document ? window : e.target;
      const scrollY = target.scrollY || target.scrollTop || 0;
      setIsScrolled(scrollY > 20);
    };
    
    // Listen to both window and potential scrollable container
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = (isAdmin ? 48 : 0) + 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav 
      className={cn(
        previewDevice === 'full' ? "fixed" : "absolute",
        "w-full z-40 transition-all duration-500",
        isAdmin ? (previewDevice === 'full' ? (isEditMode ? "mt-[56px]" : "mt-[40px]") : "mt-0") : "mt-0",
        isScrolled ? "glass-panel h-20" : "h-24"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link to="/" onClick={() => scrollToSection('hero')} className="flex-shrink-0 flex items-center group transition-transform hover:scale-105 duration-300">
          <div className="flex items-center space-x-3">
            <svg className="logo-glow" width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" stroke="url(#logoGrad)" strokeWidth="4"></circle>
              <path d="M30 70L45 35L50 45L55 35L70 70" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="45" cy="35" r="4" fill="#818CF8"></circle>
              <circle cx="55" cy="35" r="4" fill="#818CF8"></circle>
              <circle cx="50" cy="45" r="4" fill="#4F46E5"></circle>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4F46E5"></stop>
                  <stop offset="1" stopColor="#818CF8"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-white font-bold tracking-tighter text-xl font-serif">AI ECONOMICS</span>
              <span className="text-accentLight text-[9px] tracking-[0.3em] font-medium uppercase opacity-80">Strategic Consulting</span>
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 items-center">
          <button onClick={() => scrollToSection('ops')} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition duration-300">Strategy</button>
          <button onClick={() => scrollToSection('insights')} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition duration-300">Research</button>
          <button onClick={() => scrollToSection('expert')} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition duration-300">Profile</button>
          {user ? (
            <button onClick={() => scrollToSection('inquiry')} className="bg-white/5 border border-white/10 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-dark transition rounded-sm">Inquiry</button>
          ) : (
            <button onClick={signIn} className="bg-accent border border-accent/20 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-accentLight transition rounded-sm">Login</button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button className="text-gray-300 hover:text-white p-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-darker border-b border-white/10 shadow-2xl flex flex-col px-6 py-4 space-y-4 z-50"
          >
            <button onClick={() => scrollToSection('ops')} className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border-b border-white/5 pb-2">Strategy</button>
            <button onClick={() => scrollToSection('insights')} className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border-b border-white/5 pb-2">Research</button>
            <button onClick={() => scrollToSection('expert')} className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border-b border-white/5 pb-2">Profile</button>
            <button onClick={() => scrollToSection('inquiry')} className="text-left text-xs font-bold uppercase tracking-widest text-accent hover:text-accentLight">Inquiry</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-dark py-20 border-t border-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase text-center">
      AI ECONOMICS © 2026
    </div>
  </footer>
);

// --- Pages ---

const DEFAULT_REPORTS = [
  {
    id: 'welding',
    title: "Welding Inspection ROI Analysis",
    category: "Industrial AI",
    summary: "Estimates the ROI from deploying AI agents in industrial welding inspection. Models declining marginal utility as fleet size increases using kₐ coefficients.",
    content: "Estimates the ROI from deploying AI agents in industrial welding inspection. Models declining marginal utility as fleet size increases using kₐ coefficients. This analysis serves as a critical control variable for capital allocation in industrial automation projects.",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 'allocation',
    title: "Autonomous Inventory Management",
    category: "Decision Support",
    summary: "Determines the optimal number of AI agents for inventory control by modeling experience-based learning against diminishing returns.",
    content: "Determines the optimal number of AI agents for inventory control by modeling experience-based learning against diminishing returns. The framework provides a CFO decision support model for scaling autonomous systems across global supply chains.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 'banking',
    title: "Digital Labor in Finance",
    category: "Financial Services",
    summary: "Quantifies the contribution of digital labor in fraud detection. Compares human-agent collaborative output using KEIs.",
    content: "Quantifies the contribution of digital labor in fraud detection. Compares human-agent collaborative output using KEIs (Key Efficiency Indicators). This research highlights the performance gains from human-in-the-loop AI systems in complex financial operations.",
    imageUrl: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&w=1200&q=80"
  }
];

const LandingPage = () => {
  const { settings, updateSetting } = useSite();
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const q = query(collection(db, 'insights'), orderBy('publishedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const dbInsights = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Merge with default reports if empty or just prepend
        setInsights([...dbInsights, ...DEFAULT_REPORTS]);
      } catch (err) {
        console.error(err);
        setInsights(DEFAULT_REPORTS);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
    }, 1500);
  };

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-64 lg:pb-40 overflow-hidden bg-dark">
        <div className="absolute inset-0 z-0">
          <EditableImage 
            src={settings.heroImage} 
            onChange={(val) => updateSetting('heroImage', val)}
            className="w-full h-full object-cover opacity-20" 
            alt="Global AI Network" 
          />
          <div className="absolute inset-0 image-overlay"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EditableText 
              value={settings.heroKicker} 
              onChange={(val) => updateSetting('heroKicker', val)}
              className="text-accent text-xs sm:text-sm font-bold tracking-[0.4em] uppercase mb-8 block"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EditableText 
              as="h1"
              value={settings.heroTitle} 
              onChange={(val) => updateSetting('heroTitle', val)}
              className="text-4xl md:text-7xl font-serif text-white mb-10 leading-[1.1]"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EditableText 
              as="p"
              value={settings.heroSubtitle} 
              onChange={(val) => updateSetting('heroSubtitle', val)}
              className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-gray-400 font-light leading-relaxed"
              multiline
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row justify-center gap-6"
          >
            <button onClick={() => document.getElementById('expert')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-dark px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition shadow-xl">View Expert Profile</button>
            <button onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })} className="border border-white/20 text-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-white transition">Strategic Inquiry</button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-900 bg-darker py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:divide-x md:divide-gray-900">
          {settings.stats.map((stat, idx) => (
            <div key={idx} className="px-4">
              <EditableText 
                value={stat.value} 
                onChange={(val) => {
                  const newStats = [...settings.stats];
                  newStats[idx].value = val;
                  updateSetting('stats', newStats);
                }}
                className="text-4xl md:text-6xl font-serif text-white mb-3 block"
              />
              <EditableText 
                value={stat.label} 
                onChange={(val) => {
                  const newStats = [...settings.stats];
                  newStats[idx].label = val;
                  updateSetting('stats', newStats);
                }}
                className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Ops */}
      <section id="ops" className="py-32 bg-surface relative border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-2/5 text-left">
              <h2 className="text-xs text-accent font-bold tracking-[0.3em] uppercase mb-6">Strategic Ops</h2>
              <EditableText 
                as="h3"
                value={settings.opsTitle} 
                onChange={(val) => updateSetting('opsTitle', val)}
                className="text-4xl font-serif text-white mb-8 leading-snug"
              />
              <div className="w-16 h-px bg-accent mb-10"></div>
              <EditableText 
                as="p"
                value={settings.opsDesc} 
                onChange={(val) => updateSetting('opsDesc', val)}
                className="text-gray-400 text-base leading-relaxed mb-8"
                multiline
              />
              <div className="rounded-sm overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition duration-700">
                <EditableImage 
                  src={settings.opsImage} 
                  onChange={(val) => updateSetting('opsImage', val)}
                  className="w-full h-48 object-cover" 
                  alt="Data Analysis" 
                />
              </div>
            </div>
            <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-10">
              {settings.opsCards.map((card, idx) => (
                <div key={idx} className="p-10 consulting-border bg-dark group hover:border-accent transition duration-500 text-left flex flex-col">
                  <EditableImage 
                    src={card.image} 
                    onChange={(val) => {
                      const newCards = [...settings.opsCards];
                      newCards[idx].image = val;
                      updateSetting('opsCards', newCards);
                    }}
                    className="w-full h-32 object-cover mb-8 rounded-sm opacity-60 group-hover:opacity-100 transition" 
                    alt={card.title} 
                  />
                  <EditableText 
                    as="h4"
                    value={card.title} 
                    onChange={(val) => {
                      const newCards = [...settings.opsCards];
                      newCards[idx].title = val;
                      updateSetting('opsCards', newCards);
                    }}
                    className="text-xl font-medium text-white mb-4 block"
                  />
                  <EditableText 
                    as="p"
                    value={card.desc} 
                    onChange={(val) => {
                      const newCards = [...settings.opsCards];
                      newCards[idx].desc = val;
                      updateSetting('opsCards', newCards);
                    }}
                    className="text-sm text-gray-500 leading-relaxed block"
                    multiline
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research */}
      <section id="insights" className="py-32 bg-darker border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs text-accent font-bold tracking-[0.3em] uppercase mb-6">Research & Models</h2>
          <h3 className="text-4xl font-serif text-white mb-20">Latest Economic Insights</h3>
          
          {loadingInsights ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {insights.map((insight) => (
                <div key={insight.id} className="consulting-border bg-surface group hover:border-accent transition duration-500 flex flex-col text-left overflow-hidden">
                  <div className="h-48 overflow-hidden relative">
                    <img src={insight.imageUrl || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"} alt={insight.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 scale-105 group-hover:scale-100" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-accentLight uppercase tracking-widest mb-4">{insight.category}</span>
                    <h4 className="text-2xl font-serif text-white mb-6">{insight.title}</h4>
                    <p className="text-sm text-gray-400 font-light mb-10 flex-grow leading-relaxed line-clamp-3">{insight.summary}</p>
                    <button onClick={() => setSelectedReport(insight)} className="text-white text-[11px] font-bold uppercase tracking-[0.2em] flex items-center group-hover:text-accentLight transition">
                      Full Report <ArrowRight className="ml-3" size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="col-span-full py-20 border border-dashed border-white/10 rounded-sm">
                  <p className="text-gray-500 italic">No research reports available at this time.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Expert Profile */}
      <section id="expert" className="py-32 bg-dark border-t border-gray-900 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20"><h2 className="text-xs text-accent font-bold tracking-[0.3em] uppercase mb-6">Expert Profile</h2><h3 className="text-4xl font-serif text-white">Leadership</h3></div>
          <div className="consulting-border bg-surface flex flex-col md:flex-row overflow-hidden rounded-sm shadow-2xl">
            <div className="md:w-1/3 p-12 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-800 relative group text-center bg-dark/50">
              <div className="w-56 h-56 overflow-hidden mb-10 relative transition-all duration-700 rounded-full border-4 border-gray-900 p-1">
                <EditableImage 
                  src={settings.ceoImage} 
                  onChange={(val) => updateSetting('ceoImage', val)}
                  className="w-full h-full object-cover rounded-full" 
                  alt={settings.ceoName} 
                />
              </div>
              <EditableText 
                as="h3"
                value={settings.ceoName} 
                onChange={(val) => updateSetting('ceoName', val)}
                className="text-3xl font-serif text-white mb-2"
              />
              <EditableText 
                value={settings.ceoTitle} 
                onChange={(val) => updateSetting('ceoTitle', val)}
                className="text-xs text-accentLight font-bold uppercase tracking-[0.3em] mb-8 block"
              />
              <a href="https://www.researchgate.net/profile/Robert-Cohen-25" target="_blank" rel="noopener noreferrer" className="w-full border border-white/10 hover:border-white/40 text-white text-[10px] font-bold uppercase tracking-widest py-3 transition rounded-sm flex items-center justify-center">Scientific Publications <Globe className="ml-2 opacity-50" size={14} /></a>
            </div>
            <div className="md:w-2/3 p-12 flex flex-col justify-center">
              <div className="mb-12">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] border-b border-gray-800 pb-4 mb-8">Overview</h4>
                <EditableText 
                  as="p"
                  value={settings.ceoBio} 
                  onChange={(val) => updateSetting('ceoBio', val)}
                  className="text-gray-400 leading-relaxed text-base font-light"
                  multiline
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry */}
      <section id="inquiry" className="py-32 bg-darker border-t border-gray-900 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-[0.02] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="white"><circle cx="100" cy="0" r="100"></circle></svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText 
            value={settings.inquiryTitle} 
            onChange={(val) => updateSetting('inquiryTitle', val)}
            className="text-xs text-accent font-bold tracking-[0.3em] uppercase mb-6 block"
          />
          <EditableText 
            as="h3"
            value={settings.inquirySubtitle} 
            onChange={(val) => updateSetting('inquirySubtitle', val)}
            className="text-5xl font-serif text-white mb-10 leading-tight block"
            multiline
          />
          <div className="consulting-border p-10 md:p-16 text-left w-full bg-surface shadow-2xl relative overflow-hidden rounded-sm border-white/5">
            <AnimatePresence mode="wait">
              {formStatus === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center p-12 z-20"
                >
                  <Check className="text-accent mb-6" size={48} />
                  <h4 className="text-3xl font-serif text-white mb-6">Inquiry Received</h4>
                  <button onClick={() => setFormStatus('idle')} className="text-accent text-[10px] font-bold uppercase tracking-widest">Send Another</button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleInquiry} 
                  className="space-y-8 relative z-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Full Name *</label><input type="text" name="name" required className="w-full contact-input p-5 rounded-sm text-sm" /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Email Address *</label><input type="email" name="email" required className="w-full contact-input p-5 rounded-sm text-sm" /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Message *</label><textarea name="message" required rows={6} className="w-full contact-input p-5 rounded-sm text-sm resize-none"></textarea></div>
                  <button type="submit" disabled={formStatus === 'loading'} className="w-full bg-accent hover:bg-accentLight text-white text-[11px] font-bold uppercase tracking-[0.3em] py-5 px-10 rounded-sm transition duration-500 flex items-center justify-center">
                    {formStatus === 'loading' ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    {formStatus === 'loading' ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Research Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-10"
            onClick={(e) => e.target === e.currentTarget && setSelectedReport(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-gray-800 p-10 rounded-lg max-w-3xl w-full shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition"><X size={24} /></button>
              <div className="overflow-y-auto pr-4 text-left">
                <div className="mb-10 text-center">
                  <h2 className="text-4xl font-serif text-white mb-3">{selectedReport.title}</h2>
                  <p className="text-accent text-xs font-bold uppercase tracking-widest">{selectedReport.category}</p>
                </div>
                <div className="prose prose-invert max-w-none">
                  {selectedReport.imageUrl && (
                    <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full h-64 object-cover rounded-sm mb-8" referrerPolicy="no-referrer" />
                  )}
                  <Markdown>{selectedReport.content}</Markdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Admin Dashboard (CMS) ---

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) return <div className="pt-40 text-center bg-dark min-h-screen text-white">Verifying credentials...</div>;
  if (!isAdmin) return null;

  return (
    <div className="pt-20 min-h-screen bg-white flex flex-col lg:flex-row text-dark">
      {/* Mobile Admin Nav */}
      <div className="lg:hidden bg-gray-50 border-b border-gray-200 p-4 flex justify-around items-center sticky top-20 z-30">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition">
          <TrendingUp size={14} /> Insights
        </Link>
        <Link to="/admin/new" className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition">
          <Plus size={14} /> New
        </Link>
        <Link to="/admin/users" className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition">
          <Globe size={14} /> Users
        </Link>
      </div>

      <aside className="w-64 border-r border-gray-200 p-8 hidden lg:block sticky top-20 h-[calc(100vh-80px)]">
        <h2 className="text-xl font-serif mb-12 italic">CMS Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/admin" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition"><TrendingUp size={16} /> Insights</Link>
          <Link to="/admin/new" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition"><Plus size={16} /> New Insight</Link>
          <Link to="/admin/users" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition"><Globe size={16} /> Users</Link>
          <Link to="/" className="mt-auto flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-accent hover:text-accentLight transition"><ArrowRight size={16} /> Back to Site</Link>
        </nav>
      </aside>

      <main className="flex-grow p-8 lg:p-12">
        <Routes>
          <Route path="/" element={<AdminInsightsList />} />
          <Route path="/new" element={<AdminInsightForm />} />
          <Route path="/edit/:id" element={<AdminInsightForm />} />
          <Route path="/users" element={<AdminUsersList />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminUsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-serif">Manage Users</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Name</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Email</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Role</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-6 font-serif text-lg">{user.displayName}</td>
                <td className="py-6 text-sm text-gray-500">{user.email}</td>
                <td className="py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium",
                    user.role === 'admin' ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="py-6 text-right">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-accent"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminInsightsList = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const q = query(collection(db, 'insights'), orderBy('publishedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setInsights(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchInsights();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'insights', id));
      setInsights(prev => prev.filter(i => i.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 max-w-md w-full rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-serif mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-8">This action is permanent. Are you sure you want to delete this insight?</p>
              <div className="flex gap-4">
                <button onClick={() => handleDelete(deletingId)} className="flex-grow bg-red-600 text-white py-3 rounded-sm font-bold uppercase tracking-widest text-[10px]">Delete</button>
                <button onClick={() => setDeletingId(null)} className="flex-grow border border-gray-200 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px]">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-serif">Manage Insights</h2>
        <Link to="/admin/new" className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-2">
          <Plus size={14} /> New Insight
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Title</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Category</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Date</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr key={insight.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-6 font-serif text-lg">{insight.title}</td>
                <td className="py-6 text-xs uppercase tracking-wider text-gray-500">{insight.category}</td>
                <td className="py-6 text-xs text-gray-400">
                  {insight.publishedAt?.toDate ? insight.publishedAt.toDate().toLocaleDateString() : 'Recent'}
                </td>
                <td className="py-6 text-right">
                  <div className="flex justify-end gap-4">
                    <Link to={`/admin/edit/${insight.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => setDeletingId(insight.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminInsightForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Macro',
    imageUrl: '',
    isPremium: false
  });

  useEffect(() => {
    if (id) {
      const fetchInsight = async () => {
        const docSnap = await getDoc(doc(db, 'insights', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title,
            summary: data.summary,
            content: data.content,
            category: data.category,
            imageUrl: data.imageUrl || '',
            isPremium: data.isPremium || false
          });
        }
      };
      fetchInsight();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateDoc(doc(db, 'insights', id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'insights'), {
          ...formData,
          authorId: user?.uid,
          authorName: profile?.displayName,
          publishedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-4xl font-serif mb-12">{id ? 'Edit Insight' : 'New Insight'}</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-accent outline-none transition-colors text-2xl font-serif"
            placeholder="Insight Title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-accent outline-none transition-colors"
            >
              <option value="Macro">Macro</option>
              <option value="AI">AI</option>
              <option value="Finance">Finance</option>
              <option value="Policy">Policy</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-accent outline-none transition-colors"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400">Summary</label>
          <textarea
            required
            value={formData.summary}
            onChange={e => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-transparent border border-gray-200 p-4 focus:border-accent outline-none transition-colors h-24 resize-none"
            placeholder="Brief executive summary..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400">Content (Markdown)</label>
          <textarea
            required
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-transparent border border-gray-200 p-4 focus:border-accent outline-none transition-colors h-96 font-mono text-sm"
            placeholder="# Introduction..."
          />
        </div>

        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="isPremium"
            checked={formData.isPremium}
            onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <label htmlFor="isPremium" className="text-sm text-gray-600">Premium Insight</label>
        </div>

        <div className="pt-8 flex gap-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Publish Insight'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="border border-gray-200 px-10 py-4 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Main App Component ---

const PreviewContainer = ({ children }: { children: React.ReactNode }) => {
  const { previewDevice } = useSite();
  const { isAdmin } = useAuth();
  
  if (!isAdmin || previewDevice === 'full') return <>{children}</>;

  const widths = {
    mobile: '375px',
    tablet: '768px',
    desktop: '1024px',
    full: '100%'
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12 transition-all duration-500 flex justify-center overflow-x-hidden">
      <div 
        className="bg-white shadow-2xl transition-all duration-500 overflow-hidden relative"
        style={{ 
          width: widths[previewDevice],
          height: 'calc(100vh - 120px)',
          marginTop: '20px',
          borderRadius: previewDevice === 'mobile' ? '40px' : '12px',
          border: '12px solid #1a1a1a',
          boxShadow: '0 0 0 4px #333, 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Device Notch/Speaker for mobile */}
        {previewDevice === 'mobile' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
          </div>
        )}
        <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-dark">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SiteProvider>
          <Router>
            <div className="min-h-screen flex flex-col font-sans bg-dark">
              <AdminBar />
              <PreviewContainer>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                  </Routes>
                </main>
                <Footer />
              </PreviewContainer>
            </div>
          </Router>
        </SiteProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
