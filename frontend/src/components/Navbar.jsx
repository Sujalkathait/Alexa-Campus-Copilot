import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  Brain,
  Bell,
  Mic,
  MicOff,
  UserCheck
} from 'lucide-react';

export function Navbar({
  activeTab,
  setActiveTab,
  isListening,
  onToggleVoice,
  studentName = 'Alex Morgan',
  studentTimezone = 'Asia/Kolkata',
  overdueCount = 0
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Copilot & Voice', icon: MessageSquare, badge: isListening ? 'Listening' : null },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, alertCount: overdueCount },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'hub', label: 'AI Study Hub', icon: Brain },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500 to-sky-400 opacity-30 blur-sm -z-10"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  Alexa+ Campus Copilot
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Bedrock AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Academic Productivity & Scheduling Assistant</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>

                  {tab.alertCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {tab.alertCount}
                    </span>
                  )}

                  {tab.badge && (
                    <span className="ml-0.5 flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Quick Voice Button & Student Profile */}
          <div className="flex items-center gap-3">
            {/* Hands-Free Voice Button */}
            <button
              onClick={onToggleVoice}
              title={isListening ? 'Click to stop listening' : 'Click to talk to Copilot'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                isListening
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-purple-500/50 hover:text-purple-300'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="hidden sm:inline">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Voice Input</span>
                </>
              )}
            </button>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AM
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {studentName}
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400">{studentTimezone}</div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.alertCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white">
                    {tab.alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
