import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { quizData } from '../data/quizData';
import { CheckCircle2, XCircle, Trophy, ArrowRight, Timer, ChevronLeft } from 'lucide-react';

const DB_COLOR = { postgres: '#3B82F6', mongo: '#10B981', neo4j: '#8B5CF6' };
const TIMER_SECONDS = 60;

const QuizView = () => {
  const { db, topicSlug } = useParams();
  const navigate = useNavigate();
  const { markComplete } = useProgress();
  const color = DB_COLOR[db] || '#3B82F6';

  // Build key: "postgres-SELECT Basics" etc.
  const key = `${db}-${decodeURIComponent(topicSlug)}`;
  const questions = quizData[key] || quizData[Object.keys(quizData).find(k => k.startsWith(db)) || Object.keys(quizData)[0]];

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answered, setAnswered]   = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [timeLeft, setTimeLeft]   = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (answered || done) return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setAnswered(true); setSelected(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, done]);

  const handleAnswer = (i) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(i);
    setAnswered(true);
    if (i === questions[currentQ].ans) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
      const pct = score / questions.length;
      const xp = pct >= 0.8 ? (pct === 1 ? 50 : 25) : 5;
      markComplete(db, `quiz-${topicSlug}`, xp);
    }
  };

  // Summary screen
  if (done) {
    const passed = score / questions.length >= 0.8;
    const xpEarned = score === questions.length ? 50 : score / questions.length >= 0.8 ? 25 : 5;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[#111827] border border-borderLine rounded-2xl max-w-md w-full p-8 text-center">
          <Trophy className={`w-20 h-20 mx-auto mb-4 ${passed ? 'text-yellow-400' : 'text-gray-500'}`} />
          <h2 className="text-3xl font-display font-bold text-white mb-1">
            {passed ? 'Well Done!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-400 mb-2">Score: {score} / {questions.length}</p>
          <p className="text-4xl font-bold mb-8" style={{ color }}>+{xpEarned} XP</p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link to={`/learn/${db}`}
              className="px-5 py-2.5 rounded-lg border border-borderLine text-white hover:bg-surface text-sm">
              ← Back to Module
            </Link>
            {!passed && (
              <button onClick={() => { setCurrentQ(0); setScore(0); setSelected(null); setAnswered(false); setDone(false); }}
                className="px-5 py-2.5 rounded-lg font-bold text-white text-sm"
                style={{ backgroundColor: color }}>
                Try Again
              </button>
            )}
            {passed && (
              <Link to={`/learn/${db}`}
                className="px-5 py-2.5 rounded-lg font-bold text-white text-sm"
                style={{ backgroundColor: color }}>
                Next Topic →
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <Link to={`/learn/${db}`} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <span className="text-sm text-gray-400 font-medium capitalize">{db} — {decodeURIComponent(topicSlug)}</span>
        <div className="flex items-center gap-1.5 text-sm font-mono"
          style={{ color: timeLeft <= 10 ? '#EF4444' : '#6B7280' }}>
          <Timer className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-2xl h-1 bg-surface rounded-full mb-8 overflow-hidden">
        <motion.div className="h-full rounded-full transition-all"
          style={{ width: `${timerPct}%`, backgroundColor: timeLeft <= 10 ? '#EF4444' : color }} />
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {questions.map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ backgroundColor: i < currentQ ? '#10B981' : i === currentQ ? color : '#1E2D40' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }} className="w-full max-w-2xl">

          <div className="bg-[#111827] border border-borderLine rounded-2xl p-8 mb-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">
              Question {currentQ + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-display font-bold text-white mb-6 leading-relaxed">{q.q}</h2>

            <div className="space-y-3">
              {q.opts.map((opt, i) => {
                let cls = 'w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ';
                if (!answered) {
                  cls += 'border-borderLine bg-surface/40 hover:bg-surface hover:border-gray-500 text-gray-300 cursor-pointer';
                } else {
                  if (i === q.ans) cls += 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                  else if (i === selected) cls += 'border-red-500 bg-red-500/10 text-red-300';
                  else cls += 'border-borderLine bg-surface/20 text-gray-500 opacity-50';
                }
                return (
                  <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={cls}>
                    <div className="flex justify-between items-center">
                      <span>{opt}</span>
                      {answered && i === q.ans && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {answered && i === selected && i !== q.ans && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border flex justify-between items-center gap-4 ${
                  selected === q.ans ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                <div>
                  <p className={`font-bold text-sm mb-1 ${selected === q.ans ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selected === -1 ? '⏱ Time Up!' : selected === q.ans ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="text-gray-300 text-sm">{q.exp}</p>
                </div>
                <button onClick={handleNext}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white text-sm"
                  style={{ backgroundColor: color }}>
                  {currentQ < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizView;
