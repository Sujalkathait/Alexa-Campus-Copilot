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
  TrendingUp,
  Target
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
        <div className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const {
    user_name = 'Alex Morgan',
    total_assignments = 0,
    pending_assignments_count = 0,
    completed_assignments_count = 0,
    overdue_assignments_count = 0,
    today_study_minutes_planned = 0,
    productivity_score = 82,
    urgent_assignments = [],
    today_sessions = [],
  } = summary || {};

  const plannedHours = (today_study_minutes_planned / 60).toFixed(1);
  const completionRate = total_assignments > 0 ? Math.round((completed_assignments_count / total_assignments) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Daily Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f1422] border border-slate-800/90 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Fall Semester • Week 8
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good morning, {user_name}
          </h1>

          <p className="text-xs text-slate-400 max-w-xl">
            You have <strong className="text-slate-200">{pending_assignments_count} active assignments</strong> with{' '}
            <strong className="text-blue-400">{plannedHours} hours</strong> scheduled for study today.
            {overdue_assignments_count > 0 && (
              <span className="text-rose-400 font-medium ml-1">
                ⚠️ {overdue_assignments_count} task is overdue.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Copilot</span>
          </button>
          <button
            onClick={onQuickAddAssignment}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Deadlines */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pending Deadlines</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{pending_assignments_count}</span>
            <span className="text-xs text-slate-400 font-mono">/ {total_assignments} total</span>
          </div>
          <div className="text-[11px]">
            {overdue_assignments_count > 0 ? (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {overdue_assignments_count} Overdue
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">Deadlines on track</span>
            )}
          </div>
        </div>

        {/* Today's Study Schedule */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Study Planned Today</span>
            <Calendar className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{plannedHours}h</span>
            <span className="text-xs text-slate-400 font-mono">({today_sessions.length} sessions)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            <span>Target: 2.5h daily pace</span>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Completion Velocity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{completionRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">{completed_assignments_count} completed</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Productivity Index */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Productivity Score</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{productivity_score}</span>
            <span className="text-xs text-amber-300 font-semibold font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400">
            <span>Top 10% academic momentum</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Deadlines + Intelligent Recommendation & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Upcoming Deadlines & AI Recommendation */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Intelligent Study Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-violet-950/20 to-slate-900 border border-blue-500/20 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                  Copilot Study Recommendation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Prioritize <strong>CS301 Virtual Memory Lab</strong> tonight. Based on the deadline and 90-minute estimated effort, schedule session between <strong>2:00 PM and 3:30 PM</strong> to maintain submission buffer.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('planner')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Auto-schedule this block</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines Header */}
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
                <span>View all ({total_assignments})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {urgent_assignments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0f1422] border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-medium text-slate-300">No pressing deadlines right now.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">All assignments are submitted or planned.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgent_assignments.map((asg) => {
                  const isOverdue = asg.is_overdue;
                  const isHigh = asg.priority === 'HIGH';

                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800/90 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs font-semibold text-slate-100 truncate">{asg.title}</h3>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isHigh
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {asg.priority}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Est: {asg.estimated_minutes} min</span>
                          <span>•</span>
                          <span>
                            Due: {new Date(asg.due_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onCompleteAssignment(asg.id)}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-400 transition-colors shrink-0"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Today's Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Today's Study Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Planner &rarr;
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
            {today_sessions.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <BookOpen className="w-7 h-7 text-slate-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-medium text-slate-300">No sessions scheduled today.</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 text-xs font-semibold transition-colors"
                >
                  Generate Plan
                </button>
              </div>
            ) : (
              today_sessions.map((sess) => {
                const startStr = new Date(sess.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endStr = new Date(sess.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-200">{sess.title}</h4>
                      <div className="text-[11px] font-mono text-blue-300">
                        {startStr} – {endStr} ({sess.duration_minutes || 60}m)
                      </div>
                      {sess.notes && <p className="text-[11px] text-slate-400 line-clamp-1">{sess.notes}</p>}
                    </div>

                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sess.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
