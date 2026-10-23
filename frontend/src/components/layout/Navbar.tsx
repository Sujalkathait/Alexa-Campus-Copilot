import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Search,
  LogOut,
  Trash2,
  Settings,
  ChevronDown,
  UserCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '@/types';
import { SectionTab } from './Sidebar';

interface NavbarProps {
  onToggleVoice: () => void;
  isListening: boolean;
  user: UserProfile;
  onOpenQuickSearch?: () => void;
  pendingCount?: number;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
  onLogout?: () => void;
  onOpenDeleteAccountModal?: () => void;
  onNavigateTab?: (tab: SectionTab) => void;
}

export function Navbar({
  onToggleVoice,
  isListening,
  user,
  onOpenQuickSearch,
  pendingCount = 0,
  onOpenLoginModal,
  onOpenRegisterModal,
  onLogout,
  onOpenDeleteAccountModal,
  onNavigateTab,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isAuthenticated = user.isAuthenticated !== false;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-800/80 bg-[#0a0d14]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Search / Command Bar trigger - Jakob's Law & Fitts's Law */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenQuickSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          title="Open Command Palette (⌘K or Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex-1 text-left">Search coursework, commands, study sessions...</span>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Prominent Voice Assistant Button */}
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
            isListening
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-blue-500/40 hover:text-blue-300'
          }`}
          title={isListening ? 'Click to stop listening' : 'Spoken Voice Assistant (Speech Recognition)'}
        >
          {isListening ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </>
          )}
        </button>

        {/* Authentication Controls: User Dropdown or Sign In CTA */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2.5 py-1 pr-1.5 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/60 transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                {/* Online indicator dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#0a0d14]" />
              </div>

              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{user.timezone}</div>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Visual Hierarchy & Gestalt Proximity */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-1.5 text-xs text-slate-300 z-50 animate-in fade-in zoom-in-95">
                {/* User Header Summary */}
                <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                    <UserCheck className="w-3 h-3" />
                    <span>Active Student</span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateTab?.('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenQuickSearch?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>Command Menu</span>
                    </div>
                    <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 my-1.5" />

                {/* Sign Out Action */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 text-amber-300 hover:text-amber-200 transition-colors text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign Out</span>
                </button>

                {/* Danger Zone: Delete Account */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenDeleteAccountModal?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors text-left font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Account</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={onOpenRegisterModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
