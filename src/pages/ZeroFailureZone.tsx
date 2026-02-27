import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bot,
  BrainCircuit,
  FileText,
  Download,
  BookOpen,
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  analyzeDocumentForBot,
  generateExamQuestions,
  type BotAnalysisResult,
  type ExamResult
} from '../lib/api';
import { trackEvent } from '../lib/analytics';
import { parseDocument } from '../utils/documentParser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';


// --- Components ---

const ScoreCircle = ({ score }: { score: number }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={55}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#333" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[10px] text-zinc-500 uppercase">Score</span>
      </div>
    </div>
  );
};

// --- Main Page ---

const ZeroFailureZone = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'checker' | 'exam'>('checker');

  // Checker State
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [checkerResult, setCheckerResult] = useState<BotAnalysisResult | null>(null);
  const [docType, setDocType] = useState('Assignment');
  const [checkerError, setCheckerError] = useState<string | null>(null);

  // Exam State
  const [topic, setTopic] = useState('');
  const [examLoading, setExamLoading] = useState(false);
  const [examData, setExamData] = useState<ExamResult | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  // --- File Checker Logic ---

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setCheckerResult(null);
    setCheckerError(null);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setCheckerError(null);
    trackEvent('checker_analysis_start', { type: docType });

    try {
      const text = await parseDocument(file);
      const result = await analyzeDocumentForBot(text, docType);
      if (result) {
        setCheckerResult(result);
        trackEvent('checker_analysis_complete', { score: result.score });
      } else {
        setCheckerError("Failed to analyze document. Please try again or use a different file.");
      }
    } catch (err: any) {
      console.error("Analysis failed", err);
      setCheckerError(err.message || "An error occurred during analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!checkerResult) return;
    const content = `
    ZERO-FAILURE ZONE REPORT
    ========================
    Overall Score: ${checkerResult.score}/100
    Verdict: ${checkerResult.overall_verdict}

    ERRORS:
    ${checkerResult.errors.map(e => `- [${e.type}] ${e.description} (Fix: ${e.fix})`).join('\n')}

    WARNINGS:
    ${checkerResult.warnings.map(w => `- [${w.type}] ${w.suggestion}`).join('\n')}

    STRENGTHS:
    ${checkerResult.strengths.map(s => `- ${s}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ZeroFailure_Report.txt'; // Simple text download for now, can upgrade to PDF library later
    a.click();
  };

  // --- Exam Prep Logic ---

  const startExam = async () => {
    if (!topic) return;
    setExamLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIdx(0);
    setExamData(null);
    setExamError(null);
    trackEvent('exam_start', { topic });

    try {
      const data = await generateExamQuestions(topic);
      if (data && data.questions && data.questions.length > 0) {
        setExamData(data);
      } else {
        setExamError("Failed to generate questions. API returned empty or invalid data.");
      }
    } catch (err: any) {
      console.error("Exam generation failed", err);
      setExamError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setExamLoading(false);
    }
  };

  const handleAnswer = (option: string, correct: string) => {
    if (selectedOption) return; // Prevent double clicking
    setSelectedOption(option);
    setShowExplanation(true);
    if (option === correct) setQuizScore(prev => prev + 1);
  };



  const saveQuizResult = async (score: number, total: number, topic: string) => {
    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert([
          {
            user_id: user?.id,
            topic,
            score,
            total_questions: total,
            timestamp: new Date().toISOString()
          }
        ]);
      if (error) console.error('Error saving quiz result:', error);
    } catch (err) {
      console.error('Supabase connection failed:', err);
    }
  };

  const nextQuestion = () => {
    if (!examData) return;
    if (currentQuestionIdx < examData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      saveQuizResult(quizScore, examData.questions.length, topic);
    }
  };

  const resetExam = () => {
    setQuizFinished(false);
    setExamData(null);
    setTopic('');
    setExamError(null);
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-10 text-center">
        <h2 className={`text-4xl font-black tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Zero-Failure <span className={isDark ? 'text-violet-500' : 'text-violet-600'}>Zone</span>
        </h2>
        <p className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Precision Analysis & Exam Readiness</p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab('checker')}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'checker'
            ? (isDark ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20')
            : (isDark ? 'bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'bg-white/50 text-gray-500 hover:text-gray-700')
            }`}
        >
          <FileText size={18} /> File Checker Bot
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'exam'
            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
            : (isDark ? 'bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'bg-white/50 text-gray-500 hover:text-gray-700')
            }`}
        >
          <BookOpen size={18} /> Exam Prep Bot
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'checker' ? (
          <motion.div
            key="checker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Upload Area */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Upload size={20} className="text-violet-500" /> Upload Document
                </h3>

                <div className="mb-4">
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-violet-500"
                  >
                    <option>Assignment</option>
                    <option>Resume</option>
                    <option>Lab Report</option>
                    <option>Project Report</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 bg-black/20 hover:border-violet-500/30 transition-colors relative cursor-pointer text-center group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  />
                  <Bot className="mx-auto text-zinc-600 mb-4 group-hover:scale-110 transition-transform" size={40} />
                  <p className="text-sm text-zinc-300 font-medium">{file ? file.name : 'Drag & Drop PDF/DOCX'}</p>
                  <p className="text-xs text-zinc-600 mt-1">{file ? 'File selected' : 'Get instant feedback'}</p>
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={!file || analyzing}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Document'}
                  {!analyzing && <ArrowRight size={18} />}
                </button>

                {checkerError && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {checkerError}
                  </div>
                )}
              </div>
            </div>

            {/* Results Area */}
            <div className="lg:col-span-8">
              {!checkerResult ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/30 rounded-3xl border border-white/5">
                  <BrainCircuit size={64} className="mb-4 opacity-20" />
                  <p>Upload a document and click Analyze.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score Card */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Analysis Report</h3>
                      <p className="text-zinc-400 text-sm max-w-md">{checkerResult.overall_verdict}</p>
                    </div>
                    <ScoreCircle score={checkerResult.score} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-3xl p-6">
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <CheckCircle size={18} /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {checkerResult.strengths.map((s, i) => (
                          <li key={i} className="text-zinc-300 text-sm flex gap-2">
                            <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Warnings */}
                    <div className="bg-amber-900/10 border border-amber-500/20 rounded-3xl p-6">
                      <h4 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} /> Improvements Needed
                      </h4>
                      <ul className="space-y-3">
                        {checkerResult.warnings.map((w, i) => (
                          <li key={i} className="text-zinc-300 text-sm border-b border-amber-500/10 pb-2 last:border-0">
                            <strong>{w.type}:</strong> {w.suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Errors */}
                  {checkerResult.errors.length > 0 && (
                    <div className="bg-red-900/10 border border-red-500/20 rounded-3xl p-6">
                      <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                        <XCircle size={18} /> Critical Errors & Fixes
                      </h4>
                      <div className="space-y-4">
                        {checkerResult.errors.map((e, i) => (
                          <div key={i} className="bg-black/20 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-red-400 text-xs font-bold uppercase">{e.type}</span>
                              {e.location && <span className="text-zinc-500 text-xs">{e.location}</span>}
                            </div>
                            <p className="text-white text-sm mb-2">{e.description}</p>
                            <div className="text-emerald-400 text-xs bg-emerald-900/20 p-2 rounded border border-emerald-500/10">
                              <strong>Fix:</strong> {e.fix}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={downloadReport}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={18} /> Download Detailed Report
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto"
          >
            {!examData && !quizFinished ? (
              <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-10 text-center">
                <BrainCircuit size={64} className="mx-auto text-amber-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Exam Prep Bot</h3>
                <p className="text-zinc-400 mb-8">Generate confidence-checking questions for any topic.</p>

                <div className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter Result / Topic (e.g. Thermodynamics)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startExam()}
                  />
                  <button
                    onClick={startExam}
                    disabled={examLoading}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {examLoading ? 'Generating...' : 'Start'}
                  </button>
                </div>
                {examError && (
                  <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {examError}
                  </div>
                )}
              </div>
            ) : !quizFinished && examData ? (
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Question {currentQuestionIdx + 1} of {examData.questions.length}</span>
                  <div className="flex items-center gap-2 text-amber-500 text-sm font-bold">
                    <Clock size={16} /> Exam Mode
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">{examData.questions[currentQuestionIdx].question}</h3>
                  <div className="space-y-3">
                    {examData.questions[currentQuestionIdx].type === 'MCQ' ? (
                      examData.questions[currentQuestionIdx].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt, examData.questions[currentQuestionIdx].correct_answer)}
                          disabled={showExplanation}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${showExplanation
                            ? opt === examData.questions[currentQuestionIdx].correct_answer
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : opt === selectedOption
                                ? 'bg-red-500/20 border-red-500 text-red-300'
                                : 'bg-black/20 border-white/5 text-zinc-500'
                            : 'bg-black/20 border-white/5 text-zinc-300 hover:bg-white/5'
                            }`}
                        >
                          {opt}
                        </button>
                      ))
                    ) : (
                      <div className="space-y-4">
                        <textarea
                          placeholder="Type your answer here..."
                          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-amber-500/50"
                          rows={3}
                        />
                        {!showExplanation && (
                          <button
                            onClick={() => { setShowExplanation(true); setSelectedOption('revealed'); }}
                            className="text-amber-500 text-sm font-bold hover:underline"
                          >
                            Reveal Model Answer
                          </button>
                        )}
                        {showExplanation && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm">
                            <strong>Answer:</strong> {examData.questions[currentQuestionIdx].correct_answer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-zinc-800/50 rounded-xl p-5 mb-6 border border-white/5"
                  >
                    <p className="text-sm text-zinc-300 mb-2"><strong className="text-white">Explanation:</strong> {examData.questions[currentQuestionIdx].explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200"
                  >
                    {currentQuestionIdx === examData.questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 text-center">
                <CheckCircle size={64} className="mx-auto text-emerald-500 mb-6" />
                <h3 className="text-3xl font-bold text-white mb-2">Exam Completed!</h3>
                <p className="text-zinc-400 mb-8">You scored {quizScore} / {examData?.questions.length}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={resetExam} className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold">New Topic</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZeroFailureZone;
