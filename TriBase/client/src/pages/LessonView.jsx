import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { postgresLessons } from '../data/postgresLessons';
import { mongoLessons } from '../data/mongoLessons';
import { neo4jLessons } from '../data/neo4jLessons';
import {
  ChevronLeft, ChevronRight, Check, Copy, CheckCircle2,
  BookOpen, Lightbulb, Code2, Menu, X
} from 'lucide-react';

const DB_CONFIG = {
  postgres: { color: '#3B82F6', label: 'PostgreSQL', lessons: postgresLessons },
  mongo:    { color: '#10B981', label: 'MongoDB',    lessons: mongoLessons },
  neo4j:    { color: '#8B5CF6', label: 'Neo4j',      lessons: neo4jLessons },
};

const DifficultyDots = ({ level }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`w-2 h-2 rounded-full ${i <= level ? 'bg-current' : 'bg-gray-700'}`} />
    ))}
  </span>
);

const LessonView = () => {
  const { db, lessonId } = useParams();
  const navigate = useNavigate();
  const { markComplete, isCompleted } = useProgress();
  const cfg = DB_CONFIG[db];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!cfg) return <div className="p-10 text-white">Module not found.</div>;

  const lessons = cfg.lessons;
  const lesson = lessons.find(l => l.id === lessonId) || lessons[0];
  const currentIdx = lessons.findIndex(l => l.id === lesson.id);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];
  const completed = isCompleted(db, lesson.id);

  // Group lessons for sidebar
  const grouped = useMemo(() => {
    const map = {};
    lessons.forEach(l => {
      if (!map[l.group]) map[l.group] = [];
      map[l.group].push(l);
    });
    return map;
  }, [lessons]);

  const handleComplete = async () => {
    if (!completed) await markComplete(db, lesson.id, 10);
    if (nextLesson) navigate(`/learn/${db}/lesson/${nextLesson.id}`);
    else navigate(`/learn/${db}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lesson.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Sidebar = () => (
    <div className="w-72 flex-shrink-0 border-r border-borderLine bg-[#0d121c] overflow-y-auto">
      <div className="p-4 border-b border-borderLine flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Learning Path</p>
          <p className="font-bold text-white mt-0.5">{cfg.label}</p>
        </div>
        <span className="text-xs text-gray-400">{lessons.filter(l => isCompleted(db, l.id)).length}/{lessons.length}</span>
      </div>
      <div className="p-2">
        {Object.entries(grouped).map(([group, groupLessons]) => (
          <div key={group} className="mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">{group}</p>
            {groupLessons.map(l => {
              const done = isCompleted(db, l.id);
              const active = l.id === lesson.id;
              return (
                <Link
                  key={l.id}
                  to={`/learn/${db}/lesson/${l.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                    active ? 'text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-surface/50'
                  }`}
                  style={active ? { backgroundColor: cfg.color + '22', borderLeft: `3px solid ${cfg.color}` } : {}}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    done ? 'bg-emerald-500/20 text-emerald-400' : active ? 'text-white' : 'text-gray-600'
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : groupLessons.indexOf(l) + 1 + Object.entries(grouped).slice(0, Object.keys(grouped).indexOf(group)).reduce((a, [,v]) => a + v.length, 0)}
                  </span>
                  <span className="truncate">{l.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex" style={{ height: '100vh' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block"><Sidebar /></div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar />
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-[-48px] bg-surface border border-borderLine p-2 rounded-lg text-white">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-borderLine bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <Link to={`/learn/${db}`} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
              <ChevronLeft className="w-4 h-4" /> {cfg.label}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 text-sm truncate max-w-xs">{lesson.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{currentIdx + 1} / {lessons.length}</span>
            {completed && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <motion.div key={lesson.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-borderLine"
                style={{ color: cfg.color, borderColor: cfg.color + '44', backgroundColor: cfg.color + '11' }}>
                {lesson.group}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                Difficulty: <DifficultyDots level={lesson.difficulty} style={{ color: cfg.color }} />
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-4">{lesson.title}</h1>
            <p className="text-lg text-gray-300 leading-relaxed">{lesson.explanation}</p>
          </div>

          {/* Syntax Box */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4" style={{ color: cfg.color }} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Syntax Template</h3>
            </div>
            <pre className="bg-[#0d121c] border border-borderLine rounded-xl p-5 text-sm font-mono overflow-x-auto"
              style={{ color: cfg.color }}>
              {lesson.syntax}
            </pre>
          </div>

          {/* Example Query */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Example Query</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-borderLine text-gray-400 hover:text-white transition-colors">
                  {copied ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                <Link
                  to={`/learn/${db}/practice`}
                  state={{ query: lesson.example }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-medium text-white transition-colors"
                  style={{ backgroundColor: cfg.color }}>
                  ▶ Run in Sandbox
                </Link>
              </div>
            </div>
            <pre className="bg-[#0d121c] border border-borderLine rounded-xl p-5 text-sm font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap">
              {lesson.example}
            </pre>
          </div>

          {/* Pro Tip */}
          <div className="mb-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Pro Tip</p>
              <p className="text-sm text-amber-200/80">{lesson.proTip}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-borderLine">
            {prevLesson ? (
              <Link to={`/learn/${db}/lesson/${prevLesson.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-borderLine text-white hover:bg-surface transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" /> {prevLesson.title}
              </Link>
            ) : <div />}

            <button onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5 text-sm"
              style={{ backgroundColor: completed ? '#1E2D40' : cfg.color, border: completed ? '1px solid #1E2D40' : 'none' }}>
              {completed ? (
                nextLesson ? <>Next: {nextLesson.title.substring(0, 20)}… <ChevronRight className="w-4 h-4" /></> : 'Module Complete ✓'
              ) : (
                <><Check className="w-4 h-4" /> Mark Complete & Next</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonView;
