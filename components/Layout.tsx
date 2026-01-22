
import React from 'react';
import { AppSection } from '../types';
import BrandLogo from './BrandLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: AppSection.DASHBOARD, label: 'Home', icon: 'fa-house' },
    { id: AppSection.CURRICULUM, label: 'Path', icon: 'fa-calendar-check' },
    { id: AppSection.WORKSPACE, label: 'Creator', icon: 'fa-hammer' },
    { id: AppSection.ECOSYSTEM, label: 'Labs', icon: 'fa-network-wired' },
    { id: AppSection.VAULT, label: 'Vault', icon: 'fa-box-archive' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 text-slate-900 flex-col shadow-sm z-10">
        <div className="p-8">
          <BrandLogo showText size="md" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 ${activeSection === item.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Minimal Footer */}
        <div className="p-8 border-t border-slate-100/50">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center">v2.0 System</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Adaptive padding */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-50 flex items-center justify-between px-6 lg:px-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] shrink-0 z-20">
          <div className="flex items-center space-x-3 lg:hidden">
            <BrandLogo size="sm" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
              {menuItems.find(i => i.id === activeSection)?.label}
            </h2>
          </div>
          <div className="hidden lg:flex flex-1 justify-end items-center space-x-6">
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
              <i className="fa-regular fa-bell"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24 lg:pb-10 bg-[#f8fafc]">
          {children}
        </main>

        {/* Bottom Nav - Mobile Only */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center transition-all ${activeSection === item.id
                  ? 'text-indigo-600 scale-110'
                  : 'text-slate-400'
                }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-[8px] font-black uppercase tracking-tight mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
