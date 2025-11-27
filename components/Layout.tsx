import React from 'react';
import { LayoutDashboard, Box, Users, Settings, ShieldCheck, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-fuchsia-500/30">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full border-r border-white/5 bg-slate-950/50 backdrop-blur-md z-50 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ALIGN</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">SYSTEM 2 CONTENT ENGINE</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Box size={18} />} label="Asset Locker" />
          <NavItem icon={<Users size={18} />} label="Brand DNA" />
          <NavItem icon={<Zap size={18} />} label="Campaigns" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <Settings size={14} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Settings</p>
              <p className="text-xs text-slate-500">API Configured</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
         {/* Top decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-64 bg-violet-900/10 blur-[100px] pointer-events-none" />
        
        <div className="p-6 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`
    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
    ${active 
      ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
      : 'text-slate-400 hover:text-white hover:bg-white/5'}
  `}>
    {icon}
    {label}
  </button>
);