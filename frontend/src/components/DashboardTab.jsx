import React from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  Sparkles,
  BookOpen,
  Activity,
  PlusCircle,
  PlayCircle
} from 'lucide-react';

export function DashboardTab({
  summary,
  loading,
  onNavigate,
  onOpenNewAssignment,
  onCompleteAssignment,
}) {
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Loading your academic cockpit...</p>
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
    productivity_score = 75,
    urgent_assignments = [],
    today_sessions = [],
    recent_activities = [],
  } = summary || {};

  const plannedHours = (today_study_minutes_planned / 60).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus AI Active & Ready</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">{user_name}</span>!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              You have <span className="text-white font-semibold">{pending_assignments_count} pending tasks</span> and{' '}
              <span className="text-purple-300 font-semibold">{plannedHours} hours</span> of focused study planned today.
              {overdue_assignments_count > 0 && (
                <span className="text-rose-400 font-medium ml-1">
                  ⚠️ {overdue_assignments_count} assignment requires urgent attention.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Copilot</span>
            </button>
            <button
              onClick={onOpenNewAssignment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{pending_assignments_count}</span>
            <span className="text-xs text-slate-400">/ {total_assignments} total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            {overdue_assignments_count > 0 ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {overdue_assignments_count} Overdue
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">All deadlines on track</span>
            )}
            <button
              onClick={() => onNavigate('assignments')}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              View all &rarr;
            </button>
          </div>
        </div>

        {/* Today's Study Schedule */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Planned Today</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{plannedHours}</span>
            <span className="text-xs text-slate-400">hours ({today_sessions.length} sessions)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Balanced pacing</span>
            <button
              onClick={() => onNavigate('planner')}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Adjust plan &rarr;
            </button>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Index</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{productivity_score}</span>
            <span className="text-xs text-amber-300 font-semibold">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${productivity_score}%` }}
            ></div>
          </div>
        </div>

        {/* Completed Coursework */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{completed_assignments_count}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {total_assignments > 0 ? `${Math.round((completed_assignments_count / total_assignments) * 100)}% done` : 'No tasks'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Keep up the momentum!</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Urgency Radar & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Urgency Radar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Urgency Radar & Deadlines</h2>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {urgent_assignments.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-300">All caught up! No urgent assignments pending.</p>
                <p className="text-xs text-slate-500 mt-1">Enjoy your free time or get ahead on upcoming lectures.</p>
              </div>
            ) : (
              urgent_assignments.map((task) => {
                const isOverdue = task.is_overdue;
                const hoursRemaining = task.hours_remaining;
                const isUrgent = hoursRemaining != null && hoursRemaining <= 24;

                return (
                  <div
                    key={task.id}
                    className={`glass-card p-4 rounded-2xl border transition-all ${
                      isOverdue
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : isUrgent
                        ? 'border-amber-500/40 bg-amber-950/15'
                        : 'border-slate-800 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-slate-100">{task.title}</h3>
                          
                          {/* Priority badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              task.priority === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : task.priority === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/40 text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Overdue / Due Time badge */}
                          {isOverdue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              {hoursRemaining != null && hoursRemaining <= 48
                                ? `Due in ${Math.round(hoursRemaining)}h`
                                : new Date(task.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Est: {task.estimated_minutes} min
                          </span>
                        </div>
                      </div>

                      {/* Quick Complete Action */}
                      <button
                        onClick={() => onCompleteAssignment(task.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 border border-slate-700 transition-colors shrink-0"
                        title="Mark as completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Today's Timeline & Live Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Today's Schedule Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Today's Study Schedule</h2>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                Planner &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {today_sessions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-medium">No sessions scheduled for today yet.</p>
                  <button
                    onClick={() => onNavigate('planner')}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-semibold transition-colors"
                  >
                    Auto-Generate Schedule
                  </button>
                </div>
              ) : (
                today_sessions.map((sess) => {
                  const start = new Date(sess.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const end = new Date(sess.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-200">{sess.title}</div>
                        <div className="text-[11px] text-purple-300/90 font-mono">
                          {start} – {end} ({sess.duration_minutes || 60}m)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                        {sess.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Domain Event Activity Feed (Observer Pattern) */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Academic Activity Feed</h2>
            </div>
            
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {recent_activities.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No events recorded yet.</p>
              ) : (
                recent_activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="text-xs flex items-start gap-2.5 py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <p className="text-slate-200">{act.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
