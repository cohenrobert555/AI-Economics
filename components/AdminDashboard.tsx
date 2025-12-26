
import React, { useState, useRef } from 'react';
import { AppState, Profile, SiteConfig, Skill } from '../types.ts';
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
    if (result) {
      onUpdateProfile({ ...state.profile, bio: result.content });
    }
    setIsAiLoading(false);
  };

  const handleSkillUpdate = (index: number, name: string, level: number) => {
    const newSkills = [...state.profile.skills];
    newSkills[index] = { name, level };
    onUpdateProfile({ ...state.profile, skills: newSkills });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ ...state.profile, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-brand text-indigo-500 tracking-tight uppercase">Control Center</h2>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-zinc-800">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Expert Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Site Settings
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-widest">Consultant Info</h3>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-white/10 bg-black">
                      <img 
                        src={state.profile.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button 
                      onClick={triggerFileInput}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter text-white text-center p-2"
                    >
                      Change Photo
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                      <Input 
                        placeholder="Full Name" 
                        value={state.profile.name} 
                        onChange={(e) => onUpdateProfile({...state.profile, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Professional Title</label>
                      <Input 
                        placeholder="Professional Title" 
                        value={state.profile.title} 
                        onChange={(e) => onUpdateProfile({...state.profile, title: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image URL (Optional)</label>
                  <Input 
                    placeholder="Profile Image URL" 
                    value={state.profile.imageUrl} 
                    onChange={(e) => onUpdateProfile({...state.profile, imageUrl: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Executive Bio</label>
                  <TextArea 
                    placeholder="Executive Bio" 
                    value={state.profile.bio} 
                    onChange={(e) => onUpdateProfile({...state.profile, bio: e.target.value})} 
                    className="min-h-[150px]"
                  />
                </div>
                
                <Button variant="outline" className="w-full text-[10px]" onClick={handleAiEnhanceBio}>
                  {isAiLoading ? "Processing..." : "Enhance Bio with AI ✨"}
                </Button>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-widest">Core Skills</h3>
              <div className="space-y-4">
                {state.profile.skills.map((skill, i) => (
                  <div key={i} className="flex gap-4">
                    <Input 
                      placeholder="Skill Name" 
                      value={skill.name} 
                      onChange={(e) => handleSkillUpdate(i, e.target.value, skill.level)} 
                    />
                    <Input 
                      type="number" 
                      className="w-24" 
                      value={skill.level} 
                      onChange={(e) => handleSkillUpdate(i, skill.name, parseInt(e.target.value))} 
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Interface Configuration</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Brand Identity</label>
                <Input value={state.config.siteName} onChange={(e) => onUpdateConfig({...state.config, siteName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Hero Heading</label>
                <TextArea value={state.config.heroHeading} onChange={(e) => onUpdateConfig({...state.config, heroHeading: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Primary Color</label>
                  <Input type="color" value={state.config.primaryColor} onChange={(e) => onUpdateConfig({...state.config, primaryColor: e.target.value})} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
