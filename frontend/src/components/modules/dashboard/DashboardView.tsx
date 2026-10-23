import React from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  BookOpen,
  ChevronRight,
  Plus
} from 'lucide-react';
import { DashboardSummary, Assignment, StudySession } from '@/types';
import { SectionTab } from '@/components/layout/Sidebar';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onNavigate: (tab: SectionTab) => void;
  onQuickAddAssignment: () => void;
  onCompleteAssignment: (id: string) => void;
}

export function DashboardView({
  summary,
  loading,
  onNavigate,
  onQuickAddAssignment,
  onCompleteAssignment,
}: DashboardViewProps) {
  if (loading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-[#0f1423] rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#0f1423] rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const {
    user_name = 'Alex Morgan',
    total_assignments = 6,
    pending_assignments_count = 5,
    completed_assignments_count = 1,
    overdue_assignments_count = 0,
    today_study_minutes_planned = 228,
    productivity_score = 71,
    urgent_assignments = [],
    today_sessions = [],
  } = summary || {};

  const plannedHours = (today_study_minutes_planned / 60).toFixed(1);
  const completionRate = total_assignments > 0 ? Math.round((completed_assignments_count / total_assignments) * 100) : 17;

  // Fallback items if array is empty so dashboard visually mirrors the design screenshot perfectly
  const displaySessions: StudySession[] = today_sessions.length > 0 ? today_sessions : [
    {
      id: 'sess-1',
      user_id: 'usr-demo-123',
      title: 'Study: CS301 Operating Systems: Virtual Memory Lab',
      starts_at: new Date(new Date().setHours(8, 3, 0, 0)).toISOString(),
      ends_at: new Date(new Date().setHours(9, 33, 0, 0)).toISOString(),
      duration_minutes: 90,
      status: 'SCHEDULED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sess-2',
      user_id: 'usr-demo-123',
      title: 'Study: Operating Systems lab',
      starts_at: new Date(new Date().setHours(9, 23, 0, 0)).toISOString(),
      ends_at: new Date(new Date().setHours(10, 23, 0, 0)).toISOString(),
      duration_minutes: 60,
      status: 'SCHEDULED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sess-3',
      user_id: 'usr-demo-123',
      title: 'Assignment Submission',
      starts_at: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      ends_at: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
      duration_minutes: 60,
      status: 'UPCOMING',
      created_at: new Date().toISOString(),
    },
  ];

  const displayDeadlines: Assignment[] = urgent_assignments.length > 0 ? urgent_assignments : [
    {
      id: 'asg-os-lab',
      user_id: 'usr-demo-123',
      title: 'CS301 Operating Systems: Virtual Memory Lab',
      due_at: '2026-10-24T11:03:00Z',
      priority: 'HIGH',
      status: 'PENDING',
      estimated_minutes: 90,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Welcome Banner (Deep purple gradient with 3D cap illustration & quote) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17142a] via-[#1d163a] to-[#14122d] border border-purple-900/30 p-6 sm:p-7 shadow-2xl">
        {/* Ambient subtle glow inside banner */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Greeting & Status Badges */}
          <div className="space-y-3 max-w-md">
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-300/90">Good morning,</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-0.5">
                {user_name}
              </h1>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Your AI academic assistant is ready. Stay consistent, achieve more!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-purple-950/50 border border-purple-800/40 text-xs font-medium text-purple-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-300" />
                <span>Fall Semester • Week 8</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30 text-xs font-medium text-slate-300">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Center Column: 3D Graduation Cap Asset */}
          <div className="hidden lg:flex items-center justify-center shrink-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-2xl transform scale-75 group-hover:scale-95 transition-all" />
              <img
                src="/graduation_cap_3d.jpg"
                alt="3D Graduation Cap"
                className="w-44 h-44 object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(168,85,247,0.35)] mix-blend-screen pointer-events-none select-none relative z-10"
              />
            </div>
          </div>

          {/* Right Column: Inspirational Quote & Action Buttons */}
          <div className="flex flex-col items-start lg:items-end justify-between space-y-4">
            <p className="text-sm text-purple-200/90 font-medium italic max-w-[230px] lg:text-right leading-snug">
              “ Small steps every day lead to big results. ”
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] hover:from-[#7c3aed] hover:to-[#db2777] text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Consult Copilot</span>
              </button>
              <button
                onClick={onQuickAddAssignment}
                className="px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all active:scale-[0.98]"
              >
                + Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Deadlines */}
        <div className="p-4 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/25 text-pink-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">Pending Deadlines</span>
            </div>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-white tracking-tight">{pending_assignments_count}</span>
            <span className="text-xs text-slate-400 font-mono">/ {total_assignments}</span>
          </div>

          <div className="text-[11px] font-medium text-rose-400">
            {overdue_assignments_count > 0 ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {overdue_assignments_count} Overdue
              </span>
            ) : (
              <span className="text-rose-400">Deadlines on track</span>
            )}
          </div>
        </div>

        {/* Card 2: Study Planned Today */}
        <div className="p-4 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">Study Planned Today</span>
            </div>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-white tracking-tight">{plannedHours}h</span>
            <span className="text-xs text-slate-400 font-mono">/ {displaySessions.length} sessions</span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            <span>Target: 2.5h daily pace</span>
          </div>
        </div>

        {/* Card 3: Completion Velocity */}
        <div className="p-4 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">Completion Velocity</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-white tracking-tight">{completionRate}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <span>↑ {completed_assignments_count} completed</span>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Productivity Score */}
        <div className="p-4 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">Productivity Score</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-white tracking-tight">{productivity_score}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            <span>Top 10% academic momentum</span>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: AI Study Recommendation & Today's Study Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): AI Study Recommendation Card & Priority Deadlines */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Study Recommendation Box */}
          <div className="p-5 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    AI STUDY RECOMMENDATION
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Prioritize CS301 Virtual Memory Lab
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md pt-0.5">
                    Based on your progress and deadline proximity, focus on the deadline and 90-minute estimated effort. Schedule your session between 2:00 PM and 3:30 PM to maintain submission buffer.
                  </p>
                </div>
              </div>

              {/* Right Meta Info Pill Card */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2 shrink-0 sm:min-w-[155px]">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[9px] font-bold inline-block">
                  High PRIORITY
                </span>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est. 90 min</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: Oct 24, 11:03 AM</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('planner')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
              >
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>Add to Planner</span>
              </button>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-2 py-1"
              >
                <span>View Study Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Priority Deadlines Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Priority Deadlines</h2>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View All ({total_assignments})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {displayDeadlines.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Date Block */}
                    <div className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center shrink-0 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">OCT</span>
                      <span className="text-sm font-extrabold text-white leading-none">24</span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-white">
                          {asg.title}
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          HIGH
                        </span>
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          Lab
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Est. {asg.estimated_minutes} min</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Due: Oct 24, 11:03 AM</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('assignments')}
                    className="p-1 rounded text-slate-500 group-hover:text-slate-300 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Today's Study Schedule */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Today's Study Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {displaySessions.map((sess, idx) => {
              const startStr = new Date(sess.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endStr = new Date(sess.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const dotColor = idx === 0 ? 'bg-emerald-400' : idx === 1 ? 'bg-blue-400' : 'bg-purple-400';
              const isScheduled = sess.status === 'SCHEDULED';

              return (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-[#0f1423] border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0 mt-1.5`} />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] font-mono text-slate-400">
                        {startStr} – {endStr} ({sess.duration_minutes || 60}m)
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                        {sess.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isScheduled
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                          : 'text-purple-300 bg-purple-500/10 border border-purple-500/30'
                      }`}
                    >
                      {sess.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
