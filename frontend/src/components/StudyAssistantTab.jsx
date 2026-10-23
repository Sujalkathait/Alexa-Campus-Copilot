import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  HelpCircle,
  FileText,
  Lightbulb,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Send,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export function StudyAssistantTab({ onAddToast }) {
  const [subTab, setSubTab] = useState('explain'); // 'explain' | 'quiz' | 'summarize'
  const [loading, setLoading] = useState(false);

  // Concept Explainer State
  const [topic, setTopic] = useState('Virtual Memory and Paging');
  const [difficulty, setDifficulty] = useState('undergraduate');
  const [explanation, setExplanation] = useState(null);

  // Quiz State
  const [quizTopic, setQuizTopic] = useState('Database Normalization');
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Notes Summarizer State
  const [notesContent, setNotesContent] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);

  // Handle Explain
  const handleExplain = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.explainConcept(topic, difficulty);
      setExplanation(res);
    } catch (err) {
      onAddToast?.('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quiz Generate
  const handleGenerateQuiz = async (e) => {
    e?.preventDefault();
    if (!quizTopic.trim()) return;
    setLoading(true);
    setUserAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await api.generateQuiz(quizTopic, 3);
      setQuizQuestions(res.questions);
    } catch (err) {
      onAddToast?.('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    if (!quizQuestions) return 0;
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_index) correct++;
    });
    return correct;
  };

  // Handle Summarize
  const handleSummarize = async (e) => {
    e?.preventDefault();
    if (!notesContent.trim()) return;
    setLoading(true);
    try {
      const res = await api.summarizeNotes(notesContent);
      setSummaryResult(res);
    } catch (err) {
      onAddToast?.('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Study Hub</h1>
        <p className="text-xs text-slate-400">Deep concept explanations, interactive practice quizzes, and lecture summarization</p>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'explain', label: 'Concept Explainer', icon: Lightbulb },
          { id: 'quiz', label: 'Practice Quiz Generator', icon: HelpCircle },
          { id: 'summarize', label: 'Lecture Summarizer', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Concept Explainer */}
      {subTab === 'explain' && (
        <div className="space-y-6">
          <form onSubmit={handleExplain} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter academic concept (e.g. Dijkstra's Algorithm, Virtual Memory, BCNF)..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="beginner">Beginner</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
              >
                {loading ? 'Synthesizing...' : 'Explain Topic'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Popular:</span>
              {['Virtual Memory', 'Database Normalization', "Dijkstra's Algorithm", 'Dynamic Programming'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTopic(t);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>

          {explanation && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6 animate-in slide-in-from-bottom-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Concept Breakdown
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{explanation.topic}</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{explanation.summary}</p>
              </div>

              {/* Key Points */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Key Principles</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-200">
                  {explanation.key_points.map((pt, i) => (
                    <li key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                      <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Analogy & Pitfalls Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-indigo-400" />
                    <span>Real-World Analogy</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{explanation.real_world_analogy}</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>Common Exam Traps & Pitfalls</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                    {explanation.common_pitfalls.map((pf, idx) => (
                      <li key={idx}>{pf}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Recap */}
              <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Quick Revision Recap</div>
                <p className="text-xs text-slate-200 italic">{explanation.quick_recap}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Practice Quiz Generator */}
      {subTab === 'quiz' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateQuiz} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Quiz topic (e.g. Relational Normalization, Operating Systems Paging)..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
            >
              {loading ? 'Generating Quiz...' : 'Generate 3 Questions'}
            </button>
          </form>

          {quizQuestions && (
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => {
                const selectedOpt = userAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div key={q.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        <span className="text-purple-400 font-bold mr-2">Q{qIndex + 1}.</span>
                        {q.question}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        const isCorrect = optIdx === q.correct_index;

                        let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/40';
                        if (quizSubmitted) {
                          if (isCorrect) style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                          else if (isSelected && !isCorrect) style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        } else if (isSelected) {
                          style = 'bg-purple-900/40 border-purple-500 text-white';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-purple-400">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-slate-800">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    Submit Quiz & View Score
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-bold text-white">
                      Your Score: <span className="text-emerald-400">{calculateScore()} / {quizQuestions.length}</span>
                    </div>
                    <button
                      onClick={handleGenerateQuiz}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                    >
                      Try New Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Lecture Summarizer */}
      {subTab === 'summarize' && (
        <div className="space-y-6">
          <form onSubmit={handleSummarize} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1">
                Paste Lecture Transcript or Textbook Excerpt
              </label>
              <textarea
                rows="6"
                required
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Paste lecture notes or text here (e.g. Operating system paging involves page tables, MMU translations, and replacement strategies like FIFO and LRU...)..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !notesContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synthesizing...' : 'Summarize Notes'}
            </button>
          </form>

          {summaryResult && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">Exam Revision Summary</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-600/20 text-purple-200">
                  Target Study: ~{summaryResult.recommended_study_time_minutes} min
                </span>
              </div>

              <h2 className="text-lg font-bold text-white">{summaryResult.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-purple-500 pl-3">
                {summaryResult.tldr}
              </p>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">High-Yield Points</h3>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {summaryResult.bullet_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
