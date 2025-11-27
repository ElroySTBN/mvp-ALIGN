import React from 'react';
import { Archetype, BrandProfile, VisualPreset } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Building, ShoppingBag, Briefcase, Info } from 'lucide-react';

interface BrandSetupProps {
  brand: BrandProfile;
  setBrand: (b: BrandProfile) => void;
  onNext: () => void;
}

export const BrandSetup: React.FC<BrandSetupProps> = ({ brand, setBrand, onNext }) => {
  
  const handleArchetypeSelect = (type: Archetype) => {
    setBrand({ ...brand, archetype: type });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Define Your Digital Entity
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          ALIGN requires a rigid definition of your brand's physical reality before generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ArchetypeCard 
          active={brand.archetype === Archetype.SPACE} 
          onClick={() => handleArchetypeSelect(Archetype.SPACE)}
          icon={<Building size={32} />}
          title="SPACE"
          desc="Real Estate, Hotels, Venues"
          features={['Architecture', 'Atmosphere', 'Volume']}
        />
        <ArchetypeCard 
          active={brand.archetype === Archetype.PRODUCT} 
          onClick={() => handleArchetypeSelect(Archetype.PRODUCT)}
          icon={<ShoppingBag size={32} />}
          title="PRODUCT"
          desc="Retail, E-Commerce, Objects"
          features={['Materiality', 'Utility', 'Desire']}
        />
        <ArchetypeCard 
          active={brand.archetype === Archetype.SERVICE} 
          onClick={() => handleArchetypeSelect(Archetype.SERVICE)}
          icon={<Briefcase size={32} />}
          title="SERVICE"
          desc="Consulting, Experts, Agencies"
          features={['Authority', 'Trust', 'Expertise']}
        />
      </div>

      <GlassCard className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Brand Mission (DNA)</label>
          <textarea 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
            rows={3}
            placeholder="e.g., We democratize high-end design for modern startups..."
            value={brand.mission}
            onChange={(e) => setBrand({...brand, mission: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tone of Voice</label>
            <input 
              type="text"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-violet-500/50 outline-none"
              placeholder="e.g., Sophisticated, Minimal, Direct"
              value={brand.tone}
              onChange={(e) => setBrand({...brand, tone: e.target.value})}
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-red-300/80 mb-2 flex items-center gap-2">
               <ShieldCheckIcon size={14} /> Safety Constraints
             </label>
            <input 
              type="text"
              className="w-full bg-red-950/10 border border-red-500/20 rounded-xl p-3 text-red-200 placeholder:text-red-500/30 focus:ring-2 focus:ring-red-500/30 outline-none"
              placeholder="e.g., No slang, no political topics..."
              value={brand.constraints}
              onChange={(e) => setBrand({...brand, constraints: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={onNext}
            className="px-6 py-3 bg-white text-slate-950 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            Initialize Asset Locker <Info size={16} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

const ArchetypeCard = ({ active, onClick, icon, title, desc, features }: any) => (
  <div 
    onClick={onClick}
    className={`
      cursor-pointer relative p-6 rounded-2xl border transition-all duration-300 group
      ${active 
        ? 'bg-violet-900/20 border-violet-500/50 ring-1 ring-violet-500/50' 
        : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'}
    `}
  >
    <div className={`mb-4 transition-colors ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-400 mb-4">{desc}</p>
    <div className="flex flex-wrap gap-2">
      {features.map((f: string) => (
        <span key={f} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
          {f}
        </span>
      ))}
    </div>
  </div>
);

const ShieldCheckIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
)
