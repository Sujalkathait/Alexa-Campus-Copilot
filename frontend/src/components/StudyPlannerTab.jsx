import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight
} from 'lucide-react';

export function StudyPlannerTab({
  sessions,
  loading,
  onGeneratePlan,
  onSavePlanToSchedule,
  onUpdateSessionStatus,
  onDeleteSession,
}) {
  const [strategy, setStrategy] = useState('deadline_first');
  const [availableMinutes, setAvailableMinutes] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const strategies = [
    {
      id: 'deadline_first',
      name: 'Deadline-First',
      icon: Clock,
      badge: 'Urgent Prevention',
      description: 'Prioritizes assignments closest to their deadline to prevent late penalties and overdue submissions.',
    },
    {
      id: 'priority_first',
      name: 'Priority-First',
      icon: Zap,
      badge: 'High Impact',
      description: 'Focuses on high-stakes examinations and high-credit coursework first, regardless of deadline.',
    },
    {
      id: 'workload_balance',
      name: 'Workload-Balanced',
      icon: Coffee,
      badge: 'Burnout Shield',
      description: 'Evenly distributes focus across multiple subjects with 10-minute restorative intervals to prevent cognitive fatigue.',
    },
  ];

  const handleGenerateClick = async () => {
    setGenerating(true);
    try {
      const planRes = await onGeneratePlan(availableMinutes, strategy, false);
      setGeneratedPlan(planRes);
    } finally {
      setGenerating(false);
    }
  };

  const handleCommitSchedule = async () => {
    if (!generatedPlan) return;
    setGenerating(true);
    try {
      await onSavePlanToSchedule(availableMinutes, strategy, true);
      setGeneratedPlan(null); // Cleared after saved
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Personalized Study Planner</h1>
        <p className="text-xs text-slate-400">Algorithmic schedule optimization based on deadlines, effort, and available hours</p>
      </div>

      {/* Strategy Selector & Parameters Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Select Planning Strategy (Strategy Pattern)</h2>
          </div>
          <p className="text-xs text-slate-400">Choose the scheduling algorithm best suited for your study goals today.</p>
        </div>

        {/* 3 Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = strategy === strat.id;

            return (
              <div
                key={strat.id}
                onClick={() => setStrategy(strat.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {strat.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{strat.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{strat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Duration Slider & Action */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Available Study Time Today:</span>
              <span className="font-mono text-purple-300 font-bold text-sm">
                {Math.floor(availableMinutes / 60)}h {availableMinutes % 60}m ({availableMinutes} mins)
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="360"
              step="15"
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>30m</span>
              <span>2 Hours</span>
              <span>4 Hours</span>
              <span>6 Hours</span>
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Calculating Schedule...' : 'Generate Optimized Plan'}</span>
          </button>
        </div>
      </div>

      {/* Generated Proposed Plan (Preview & Commit) */}
      {generatedPlan && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-purple-950/20 space-y-5 animate-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">Proposed Schedule Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-200 font-semibold">
                  {generatedPlan.strategy_used.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {generatedPlan.sessions_count} Sessions Planned ({generatedPlan.total_study_minutes} Minutes Study Time)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={handleCommitSchedule}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-transform hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to My Calendar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlan.plan.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Session {idx + 1}</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-600/20 text-purple-200">
                    {item.duration_minutes} min
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  {new Date(item.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(item.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Sessions Calendar List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Scheduled Sessions</h2>
          </div>
          <span className="text-xs text-slate-400">{sessions.length} total sessions booked</span>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center border border-slate-800 text-slate-400">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-slate-300">No scheduled sessions in your calendar.</p>
            <p className="text-xs text-slate-500 mt-1">Generate a study plan above to automatically book focused blocks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => {
              const isCompleted = sess.status === 'COMPLETED';
              const isInProgress = sess.status === 'IN_PROGRESS';

              return (
                <div
                  key={sess.id}
                  className={`glass-card p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'border-slate-800/60 bg-slate-900/30 opacity-75'
                      : isInProgress
                      ? 'border-purple-500/40 bg-purple-950/20'
                      : 'border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                              : isInProgress
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {sess.status}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(sess.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className={`text-sm font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {sess.title}
                      </h3>

                      {sess.notes && <p className="text-xs text-slate-400 leading-relaxed">{sess.notes}</p>}

                      <div className="text-xs text-purple-300/90 font-mono flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          {new Date(sess.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {new Date(sess.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({sess.duration_minutes || 60}m)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          onUpdateSessionStatus(sess.id, isCompleted ? 'SCHEDULED' : 'COMPLETED')
                        }
                        className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                        title={isCompleted ? 'Mark scheduled' : 'Mark completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteSession(sess.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent transition-colors"
                        title="Remove session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
