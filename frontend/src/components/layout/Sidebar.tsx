import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  Bell,
  BarChart3,
  Settings,
  GraduationCap,
  Target,
  ChevronRight,
  LogOut,
  LogIn
} from 'lucide-react';
import { UserProfile } from '@/types';

export type SectionTab = 'dashboard' | 'chat' | 'assignments' | 'planner' | 'reminders' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: SectionTab;
  onTabChange: (tab: SectionTab) => void;
  overdueCount?: number;
  onQuickAddAssignment: () => void;
  weeklyHoursStudied?: number;
  weeklyTargetHours?: number;
  user?: UserProfile;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  overdueCount = 0,
  onQuickAddAssignment,
  weeklyHoursStudied = 15.8,
  weeklyTargetHours = 20,
  user,
  onOpenLoginModal,
  onLogout,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as SectionTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as SectionTab, label: 'AI Campus Assistant', icon: MessageSquare, badge: 'AI' },
    { id: 'assignments' as SectionTab, label: 'Assignments', icon: CheckSquare, count: overdueCount },
    { id: 'planner' as SectionTab, label: 'Study Planner', icon: CalendarDays },
    { id: 'reminders' as SectionTab, label: 'Reminders', icon: Bell },
    { id: 'analytics' as SectionTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as SectionTab, label: 'Settings', icon: Settings },
  ];

  const goalPercentage = Math.min(100, Math.round((weeklyHoursStudied / weeklyTargetHours) * 100));
  const isAuthenticated = user?.isAuthenticated !== false;

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between p-4 z-30 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Campus Copilot</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wide">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Alexa+ Academic Engine</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-white font-semibold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] shadow-lg shadow-purple-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count && item.count > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.count}
                  </span>
                ) : item.badge ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Weekly Study Goal & Profile Card */}
      <div className="space-y-3">
        {/* Weekly Study Goal Card */}
        <div className="p-3.5 rounded-2xl bg-[#0f1423] border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>Weekly Goal</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {weeklyHoursStudied}h / {weeklyTargetHours}h
            </span>
          </div>

          <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-sm transition-all duration-300"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>

          <div className="text-[10px] flex items-center justify-between">
            <span className="text-slate-400">{goalPercentage}% achieved</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              On Track
            </span>
          </div>
        </div>

        {/* User Card */}
        {isAuthenticated && user ? (
          <div
            onClick={onLogout}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0f1423] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
            title="Click to manage account / sign out"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'AM'}
              </div>
              <div className="truncate">
                <div className="text-slate-200 font-semibold truncate text-xs group-hover:text-white">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#0f1423] hover:bg-slate-800/80 border border-slate-800 text-xs text-purple-300 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Account</span>
          </button>
        )}
      </div>
    </aside>
  );
}
