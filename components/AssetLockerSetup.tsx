import React, { useState } from 'react';
import { Archetype, BrandProfile, AssetLocker } from '../types';
import { GlassCard } from './ui/GlassCard';
import { UploadCloud, Image as ImageIcon, Check, Loader2, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssetLockerSetupProps {
  brand: BrandProfile;
  setBrand: (b: BrandProfile) => void;
  onNext: () => void;
}

// Configuration for upload zones based on Archetype
const UPLOAD_CONFIG: Record<Archetype, { 
  key1: keyof AssetLocker; label1: string; desc1: string;
  key2: keyof AssetLocker; label2: string; desc2: string;
}> = {
  [Archetype.SPACE]: {
    key1: 'spaceUrls', label1: 'Interior Views (Wide)', desc1: 'High-res, wide angle, empty or staged rooms.',
    key2: 'exteriorUrls', label2: 'Exterior & Neighborhood', desc2: 'Facade, street view, local atmosphere.'
  },
  [Archetype.PRODUCT]: {
    key1: 'productUrls', label1: 'Packshots (Clean BG)', desc1: 'Front, side, and top views on neutral background.',
    key2: 'textureUrls', label2: 'Material & Texture', desc2: 'Macro shots of fabric, wood, metal details.'
  },
  [Archetype.SERVICE]: {
    key1: 'teamUrls', label1: 'Leadership & Team', desc1: 'Professional headshots, portraits.',
    key2: 'actionUrls', label2: 'Action & Process', desc2: 'Meetings, craftsmanship, hands at work.'
  }
};

export const AssetLockerSetup: React.FC<AssetLockerSetupProps> = ({ brand, setBrand, onNext }) => {
  const config = UPLOAD_CONFIG[brand.archetype];
  const [uploading, setUploading] = useState<string | null>(null);

  // Helper to simulate upload
  const handleUpload = (key: keyof AssetLocker) => {
    setUploading(key);
    setTimeout(() => {
      const currentAssets = brand.assets || {};
      const currentList = currentAssets[key] || [];
      
      setBrand({
        ...brand,
        assets: {
          ...currentAssets,
          [key]: [...currentList, 'https://picsum.photos/200/200'] // Simulated asset
        }
      });
      setUploading(null);
    }, 1500);
  };

  const getCount = (key: keyof AssetLocker) => (brand.assets?.[key] || []).length;
  const hasAssets = getCount(config.key1) > 0 || getCount(config.key2) > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
           <Lock className="text-violet-500" /> Asset Locker
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ingest your physical reality. The AI uses these constraints to ground its hallucinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* ZONE 1 */}
        <UploadZone 
          label={config.label1}
          desc={config.desc1}
          count={getCount(config.key1)}
          loading={uploading === config.key1}
          onClick={() => handleUpload(config.key1)}
        />

        {/* ZONE 2 */}
        <UploadZone 
          label={config.label2}
          desc={config.desc2}
          count={getCount(config.key2)}
          loading={uploading === config.key2}
          onClick={() => handleUpload(config.key2)}
        />
      </div>

      <div className="flex justify-center pt-8">
         <button 
            onClick={onNext}
            disabled={!hasAssets}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalize Digital Twin <ArrowRight size={20} />
          </button>
      </div>
    </motion.div>
  );
};

const UploadZone = ({ label, desc, count, loading, onClick }: any) => (
  <GlassCard className="p-8 group cursor-pointer border-dashed border-2 border-slate-700 hover:border-violet-500/50 transition-all h-full">
    <div className="flex flex-col items-center text-center space-y-4 h-full" onClick={onClick}>
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
        ${count > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500 group-hover:text-violet-400 group-hover:scale-110'}
      `}>
        {loading ? <Loader2 className="animate-spin" /> : count > 0 ? <Check size={32} /> : <UploadCloud size={32} />}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">{label}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>

      <div className="pt-4 w-full flex-1 flex flex-col justify-end">
        {count > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {[...Array(count)].map((_, i) => (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                key={i} className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-white/10"
              >
                 <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <ImageIcon size={14} className="opacity-50" />
                 </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center border border-white/5 rounded-lg bg-slate-950/30 text-xs text-slate-600 font-mono">
            DROP ASSETS HERE
          </div>
        )}
      </div>
    </div>
  </GlassCard>
);