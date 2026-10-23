import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  Bell,
  BarChart3,
  Settings,
  Sparkles,
  Plus,
  Flame,
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
  weeklyHoursStudied = 14.5,
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
    <aside className="w-64 h-screen sticky top-0 bg-[#0a0d14] border-r border-slate-800/80 flex flex-col justify-between p-4 z-30 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Campus Copilot</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Alexa+ Academic Engine</p>
          </div>
        </div>

        {/* Quick Add Action Button - Fitts's Law (Generous click target) */}
        <button
          onClick={onQuickAddAssignment}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>

        {/* Navigation Items - Gestalt Continuity and Common Region */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-white font-semibold bg-slate-800/90 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count && item.count > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.count}
                  </span>
                ) : item.badge ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/20">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Weekly Study Goal & Session Card */}
      <div className="space-y-3">
        {/* Weekly Study Goal Progress */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Weekly Goal</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {weeklyHoursStudied}h / {weeklyTargetHours}h
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>{goalPercentage}% achieved</span>
            <span className="text-emerald-400 font-medium">On Track</span>
          </div>
        </div>

        {/* User Session Quick Switcher */}
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                {user.name[0]}
              </div>
              <div className="truncate">
                <div className="text-slate-200 font-medium truncate text-[11px]">{user.name}</div>
                <div className="text-[9px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-blue-400 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Account</span>
          </button>
        )}
      </div>
    </aside>
  );
}
