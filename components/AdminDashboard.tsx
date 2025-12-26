
import React, { useState, useRef } from 'react';
import { AppState, Profile, SiteConfig } from '../types.ts';
import { Button, Card, Input, TextArea } from './ui.tsx';
import { gemini } from '../services/geminiService.ts';

interface AdminDashboardProps {
  state: AppState;
  onUpdateConfig: (config: SiteConfig) => void;
  onUpdateProfile: (profile: Profile) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onUpdateConfig, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiEnhanceBio = async () => {
    setIsAiLoading(true);
    const result = await gemini.generateDraft(`Professionalize and enhance this bio for an AI Economics consultant: ${state.profile.bio}`);
    if (result) onUpdateProfile({ ...state.profile, bio: result.content });
    setIsAiLoading(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            onUpdateProfile({ ...state.profile, imageUrl: compressedBase64 });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/98 z-50 overflow-y-auto pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <h2 className="text-3xl font-brand font-black text-indigo-500 uppercase tracking-tighter">Control Center</h2>
          <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Expert Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Site Settings
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Visual Identity</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative group">
                  <div className="w-32 h-32 bg-zinc-800 rounded-xl overflow-hidden border border-white/10 shadow-xl">
                    <img src={state.profile.imageUrl} className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white uppercase tracking-widest"
                  >
                    Change Photo
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <Input label="Professional Name" value={state.profile.name} onChange={(e) => onUpdateProfile({...state.profile, name: e.target.value})} />
                  <Input label="Executive Title" value={state.profile.title} onChange={(e) => onUpdateProfile({...state.profile, title: e.target.value})} />
                </div>
              </div>
              <TextArea label="Professional Biography" value={state.profile.bio} onChange={(e) => onUpdateProfile({...state.profile, bio: e.target.value})} />
              <Button onClick={handleAiEnhanceBio} disabled={isAiLoading} variant="outline" className="w-full text-[10px] border-indigo-500/30">
                {isAiLoading ? "Syncing with Gemini..." : "Enhance Narrative with AI ✨"}
              </Button>
            </Card>
          </div>
        ) : (
          <Card className="p-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Interface Config</h3>
            <Input label="Brand Name" value={state.config.siteName} onChange={(e) => onUpdateConfig({...state.config, siteName: e.target.value})} />
            <TextArea label="Strategic Mission (Hero Subheading)" value={state.config.heroSubheading} onChange={(e) => onUpdateConfig({...state.config, heroSubheading: e.target.value})} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
