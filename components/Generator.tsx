import React, { useState } from 'react';
import { BrandProfile, GeneratedContent, GenerationRequest, StrategicAnalysis, VisualPreset, Archetype } from '../types';
import { generateStrategy, generateFinalContent, generateVisual } from '../services/geminiService';
import { GlassCard } from './ui/GlassCard';
import { BrainCircuit, CheckCircle2, ChevronRight, Loader2, RefreshCw, Wand2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratorProps {
  brand: BrandProfile;
}

const PRESETS: Record<Archetype, VisualPreset[]> = {
  [Archetype.SPACE]: [VisualPreset.LISTING, VisualPreset.AMBIANCE],
  [Archetype.PRODUCT]: [VisualPreset.STUDIO, VisualPreset.LIFESTYLE],
  [Archetype.SERVICE]: [VisualPreset.AUTHORITY, VisualPreset.CORPORATE, VisualPreset.CRAFT]
};

export const Generator: React.FC<GeneratorProps> = ({ brand }) => {
  // State
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<VisualPreset>(PRESETS[brand.archetype][0]);
  
  // Pipeline State
  const [step, setStep] = useState<'INPUT' | 'THINKING' | 'REVIEW' | 'GENERATING' | 'DONE'>('INPUT');
  const [strategy, setStrategy] = useState<StrategicAnalysis | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleStart = async () => {
    if (!topic || !context) return;
    setStep('THINKING');
    setError(null);
    try {
      const req: GenerationRequest = {
        topic,
        context,
        targetAudience: audience,
        brand,
        preset: selectedPreset
      };
      
      const strat = await generateStrategy(req);
      setStrategy(strat);
      setStep('REVIEW');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Strategy generation failed");
      setStep('INPUT');
    }
  };

  const handleExecute = async () => {
    if (!strategy) return;
    setStep('GENERATING');
    try {
       const req: GenerationRequest = {
        topic,
        context,
        targetAudience: audience,
        brand,
        preset: selectedPreset
      };
      
      const result = await generateFinalContent(req, strategy);
      // Kick off image generation in parallel but wait for it
      const imageUrl = await generateVisual(result.imagePrompt);
      
      setContent({ ...result, imageUrl });
      setStep('DONE');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Content generation failed");
      setStep('REVIEW');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">System 2 Generator</h2>
          <p className="text-slate-400 text-sm">Active Archetype: <span className="text-violet-400 font-mono">{brand.archetype}</span></p>
        </div>
        <div className="flex items-center gap-2">
            {step === 'THINKING' && <span className="text-violet-400 text-xs font-mono animate-pulse">ANALYZING RISKS...</span>}
            {step === 'GENERATING' && <span className="text-fuchsia-400 text-xs font-mono animate-pulse">SYNTHESIZING ASSETS...</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Campaign Topic</label>
              <input 
                disabled={step !== 'INPUT'}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-violet-500 outline-none disabled:opacity-50"
                placeholder="e.g. Summer Launch"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Context & Goal</label>
              <textarea 
                disabled={step !== 'INPUT'}
                rows={4}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-violet-500 outline-none disabled:opacity-50"
                placeholder="What are we achieving? Any constraints?"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Audience</label>
              <input 
                 disabled={step !== 'INPUT'}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-violet-500 outline-none disabled:opacity-50"
                placeholder="e.g. C-Level Execs"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            
            {/* Visual Presets */}
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Visual Mode</label>
               <div className="flex flex-wrap gap-2">
                 {PRESETS[brand.archetype].map(preset => (
                   <button
                    key={preset}
                    disabled={step !== 'INPUT'}
                    onClick={() => setSelectedPreset(preset)}
                    className={`
                      px-3 py-1.5 rounded text-xs font-medium border transition-all
                      ${selectedPreset === preset 
                        ? 'bg-violet-600 border-violet-500 text-white' 
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'}
                    `}
                   >
                     {preset}
                   </button>
                 ))}
               </div>
            </div>

            {step === 'INPUT' && (
              <button 
                onClick={handleStart}
                disabled={!topic || !context}
                className="w-full py-3 mt-4 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <BrainCircuit size={18} />
                Initiate Strategy
              </button>
            )}
            
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 rounded text-red-400 text-xs">
                {error}
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: OUTPUTS */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: THINKING LOADER */}
            {step === 'THINKING' && (
              <motion.div 
                key="thinking"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit size={24} className="text-violet-400" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white">Aligning with Brand DNA...</h3>
                <p className="text-slate-500 text-sm max-w-md">The Strategist is analyzing market vectors and safety constraints.</p>
              </motion.div>
            )}

            {/* STEP 2: STRATEGY REVIEW */}
            {step === 'REVIEW' && strategy && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard gradient className="p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <ShieldAlert className="text-violet-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Strategic Assessment</h3>
                      <p className="text-xs text-violet-300">System 2 Logic Gate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Market Reality</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{strategy.marketAnalysis}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Our Angle</p>
                      <p className="text-sm text-white font-medium leading-relaxed border-l-2 border-violet-500 pl-3">
                        {strategy.strategicAngle}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2">
                      <CheckCircle2 size={12} /> Alignment Check
                    </p>
                    <p className="text-sm text-slate-400">{strategy.alignmentCheck}</p>
                  </div>

                  <div className="pt-4 flex justify-end gap-4">
                    <button 
                      onClick={() => setStep('INPUT')}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                    >
                      Refine Input
                    </button>
                    <button 
                      onClick={handleExecute}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-violet-900/20"
                    >
                      <Wand2 size={16} />
                      Approve & Generate
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

             {/* STEP 3: GENERATING LOADER */}
             {step === 'GENERATING' && (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <Loader2 size={48} className="text-fuchsia-500 animate-spin" />
                <h3 className="text-xl font-medium text-white">Synthesizing Assets...</h3>
                <p className="text-slate-500 text-sm">Rendering high-fidelity visuals and copywriting.</p>
              </motion.div>
            )}

            {/* STEP 4: FINAL OUTPUT */}
            {step === 'DONE' && content && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Visual */}
                <GlassCard className="p-2 h-fit">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                     {content.imageUrl ? (
                        <img 
                          src={content.imageUrl} 
                          alt="AI Generated" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">Generating Image...</div>
                     )}
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-[10px] text-slate-300 font-mono line-clamp-2 opacity-70">
                          PROMPT: {content.imagePrompt}
                        </p>
                     </div>
                  </div>
                </GlassCard>

                {/* Copy */}
                <div className="space-y-6">
                  <GlassCard className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white leading-tight">{content.headline}</h2>
                    <div className="prose prose-invert prose-sm">
                      <p className="whitespace-pre-wrap text-slate-300">{content.body}</p>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-4 bg-slate-900/30 border-dashed border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Safety Rationale</p>
                    <p className="text-xs text-slate-400 italic">{content.rationale}</p>
                  </GlassCard>

                  <button 
                    onClick={() => setStep('INPUT')}
                    className="w-full py-3 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw size={14} /> Start New Campaign
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};