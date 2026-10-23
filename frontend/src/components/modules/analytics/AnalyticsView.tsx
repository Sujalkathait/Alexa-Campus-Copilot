import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  PieChart,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '@/services/api';
import { AnalyticsData } from '@/types';

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const { weeklyHours, subjectDistribution, completionTrend, focusMetrics } = data;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Academic Productivity Analytics</h1>
        <p className="text-xs text-slate-400">Weekly focus trends, subject distribution, and task completion velocity</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Study Hours Logged</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{focusMetrics.totalHoursStudied}h</div>
          <div className="text-[11px] text-emerald-400 font-medium">+2.4h vs last week</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{focusMetrics.streakDays} Days</div>
          <div className="text-[11px] text-amber-300 font-medium">Personal best record!</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{focusMetrics.completionRate}%</div>
          <div className="text-[11px] text-slate-400">On-time submission ratio</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Focus Session</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{focusMetrics.averageSessionMinutes}m</div>
          <div className="text-[11px] text-slate-400">Optimal deep work chunk</div>
        </div>
      </div>

      {/* Charts Section: Weekly Bar Chart & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Hours Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Focus Distribution</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Studied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-700" /> Target
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800/80">
            {weeklyHours.map((wh) => {
              const maxH = 6;
              const barHeightPct = Math.min(100, Math.round((wh.hours / maxH) * 100));
              const targetHeightPct = Math.min(100, Math.round((wh.target / maxH) * 100));

              return (
                <div key={wh.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="relative w-full max-w-[32px] h-full flex items-end justify-center">
                    {/* Target indicator marker */}
                    <div
                      className="absolute w-full border-b border-dashed border-slate-600 z-10"
                      style={{ bottom: `${targetHeightPct}%` }}
                      title={`Target: ${wh.target}h`}
                    />
                    
                    {/* Actual Hours Bar */}
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{wh.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Weekly Target: 20 hours</span>
            <span className="text-emerald-400 font-medium">98.5% of target reached</span>
          </div>
        </div>

        {/* Subject Workload Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Subject Allocation</h2>
          </div>

          <div className="space-y-3.5 pt-2">
            {subjectDistribution.map((subj) => (
              <div key={subj.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{subj.subject}</span>
                  <span className="font-mono text-slate-400 font-bold">{subj.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${subj.percentage}%`, backgroundColor: subj.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-800">
            Workload is highest in systems engineering coursework this week due to mid-semester laboratory deliverables.
          </p>
        </div>

      </div>

      {/* Semester Task Completion Trend Table */}
      <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Semester Coursework Velocity</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0d14] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Assigned Tasks</th>
                <th className="py-2.5 px-3">Completed Tasks</th>
                <th className="py-2.5 px-3">Velocity Rate</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {completionTrend.map((row) => {
                const rate = Math.round((row.completed / row.assigned) * 100);
                return (
                  <tr key={row.week} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{row.week}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.assigned} tasks</td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{row.completed} tasks</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-slate-300">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span className="text-[10px] font-semibold text-emerald-400">Excellent</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
