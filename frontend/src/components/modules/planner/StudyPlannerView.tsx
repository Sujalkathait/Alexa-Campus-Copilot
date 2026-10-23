import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Plus
} from 'lucide-react';
import { StudySession, StudyPlanResponse, PlanningStrategyId } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface StudyPlannerViewProps {
  sessions: StudySession[];
  loading: boolean;
  onGeneratePlan: (availableMinutes: number, strategy: PlanningStrategyId, saveToSchedule: boolean) => Promise<StudyPlanResponse>;
  onSavePlanToSchedule: (availableMinutes: number, strategy: PlanningStrategyId) => Promise<void>;
  onUpdateSessionStatus: (id: string, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
}

export function StudyPlannerView({
  sessions,
  loading,
  onGeneratePlan,
  onSavePlanToSchedule,
  onUpdateSessionStatus,
  onDeleteSession,
}: StudyPlannerViewProps) {
  const [strategy, setStrategy] = useState<PlanningStrategyId>('deadline_first');
  const [availableMinutes, setAvailableMinutes] = useState<number>(150);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanResponse | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const strategies = [
    {
      id: 'deadline_first' as PlanningStrategyId,
      name: 'Deadline-First',
      icon: Clock,
      badge: 'Urgent Prevention',
      description: 'Prioritizes assignments closest to their deadline to prevent overdue submissions and late penalties.',
    },
    {
      id: 'priority_first' as PlanningStrategyId,
      name: 'Priority-First',
      icon: Zap,
      badge: 'High Impact',
      description: 'Focuses on high-stakes examinations and high-credit coursework first, regardless of deadline proximity.',
    },
    {
      id: 'workload_balance' as PlanningStrategyId,
      name: 'Workload-Balanced',
      icon: Coffee,
      badge: 'Burnout Shield',
      description: 'Evenly distributes effort across multiple subjects with 10-minute restorative intervals to prevent mental fatigue.',
    },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await onGeneratePlan(availableMinutes, strategy, false);
      setGeneratedPlan(res);
    } finally {
      setGenerating(false);
    }
  };

  const handleCommit = async () => {
    if (!generatedPlan) return;
    setGenerating(true);
    try {
      await onSavePlanToSchedule(availableMinutes, strategy);
      setGeneratedPlan(null);
    } finally {
      setGenerating(false);
    }
  };

  // Days of the week for the calendar view
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Smart Study Planner & Weekly Schedule</h1>
        <p className="text-xs text-slate-400">Algorithmic schedule optimization based on deadlines, effort, and available hours</p>
      </div>

      {/* AI Strategy Selection Panel */}
      <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Planning Strategy Engine</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Strategy Pattern Enabled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = strategy === strat.id;

            return (
              <div
                key={strat.id}
                onClick={() => setStrategy(strat.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {strat.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{strat.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{strat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Time Slider & Action Button */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-xs">
          <div className="space-y-1.5 flex-1 max-w-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Available Study Time Today:</span>
              <span className="font-mono text-blue-300 font-bold">
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
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Calculating Schedule...' : 'Generate Optimized Plan'}</span>
          </button>
        </div>
      </div>

      {/* Generated Proposed Plan Preview Card */}
      {generatedPlan && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Proposed Plan ({generatedPlan.strategy_used.replace('_', ' ').toUpperCase()})
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {generatedPlan.sessions_count} Sessions Planned ({generatedPlan.total_study_minutes} Minutes Study Time)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={handleCommit}
                disabled={generating}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to Calendar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedPlan.plan.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{item.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300">
                    {item.duration_minutes}m
                  </span>
                </div>
                {item.notes && <p className="text-[11px] text-slate-400">{item.notes}</p>}
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(item.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar Overview Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Weekly Calendar Matrix</h2>
          </div>
          <span className="text-xs text-slate-400">{sessions.length} sessions booked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {daysOfWeek.map((day, idx) => {
            const daySessions = sessions.filter((_, sIdx) => sIdx % 7 === idx);
            const isToday = idx === 4; // Mock today highlight

            return (
              <div
                key={day}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] ${
                  isToday
                    ? 'bg-blue-950/20 border-blue-500/30'
                    : 'bg-[#0f1422] border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/60">
                  <span className={`font-semibold ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{day}</span>
                  {isToday && (
                    <span className="text-[8px] font-bold px-1 rounded bg-blue-500/20 text-blue-300 uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 py-1.5 flex-1">
                  {daySessions.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
                    >
                      <div className="truncate font-medium">{s.title.replace('Study: ', '')}</div>
                      <div className="text-slate-500 font-mono text-[9px]">{s.duration_minutes || 60}m</div>
                    </div>
                  ))}
                  {daySessions.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center py-4">Free</div>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 text-center font-mono">
                  {daySessions.length} sessions
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Scheduled Sessions List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Active Scheduled Sessions</h2>

        {sessions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0f1422] border border-slate-800 text-slate-400">
            <p className="text-xs">No sessions scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sessions.map((sess) => {
              const isCompleted = sess.status === 'COMPLETED';

              return (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl bg-[#0f1422] border flex items-start justify-between gap-3 ${
                    isCompleted ? 'border-slate-800/60 opacity-70' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {sess.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(sess.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {sess.title}
                    </h4>

                    {sess.notes && <p className="text-[11px] text-slate-400">{sess.notes}</p>}

                    <div className="text-[11px] text-blue-300 font-mono pt-0.5">
                      {new Date(sess.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(sess.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({sess.duration_minutes || 60}m)
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        onUpdateSessionStatus(sess.id, isCompleted ? 'SCHEDULED' : 'COMPLETED')
                      }
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isCompleted
                          ? 'bg-slate-900 border-slate-800 text-slate-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={isCompleted ? 'Mark scheduled' : 'Mark completed'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingSessionId(sess.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSessionId)}
        onClose={() => setDeletingSessionId(null)}
        onConfirm={async () => {
          if (deletingSessionId) {
            await onDeleteSession(deletingSessionId);
            setDeletingSessionId(null);
          }
        }}
        title="Remove Study Session"
        message="Are you sure you want to remove this scheduled session from your study calendar?"
        confirmLabel="Remove"
        isDestructive={true}
      />

    </div>
  );
}
