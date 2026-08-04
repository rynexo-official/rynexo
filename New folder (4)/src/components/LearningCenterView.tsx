import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Play, Clock, Award, ChevronRight, Sparkles, X, Radio, Key, Server } from 'lucide-react';
import { Language, Course } from '../types';
import { getTranslation } from '../i18n/translations';
import { INITIAL_COURSES } from '../data/mockData';

interface LearningCenterViewProps {
  language: Language;
  onOpenIntegrations?: () => void;
}

export const LearningCenterView: React.FC<LearningCenterViewProps> = ({ language, onOpenIntegrations }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hasNewsKey, setHasNewsKey] = useState<boolean>(false);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const categories = ['All', 'AI Services', 'Remote Careers', 'Affiliate Marketing', 'E-Commerce', 'Market Intelligence'];

  useEffect(() => {
    async function checkNewsStatus() {
      try {
        const res = await fetch('/api/integrations/status');
        const data = await res.json();
        if (data.success && Array.isArray(data.integrations)) {
          const newsService = data.integrations.find((i: any) => i.id === 'news');
          setHasNewsKey(Boolean(newsService?.connected));
        }
      } catch (e) {
        console.warn('News status check warning:', e);
      }
    }
    checkNewsStatus();
  }, []);

  const filteredCourses = courses.filter(
    (c) => activeCategory === 'All' || c.category === activeCategory
  );

  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((crs) => {
        if (crs.id !== courseId) return crs;
        const updatedLessons = crs.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: !l.completed } : l
        );
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        const progressPercent = Math.round((completedCount / updatedLessons.length) * 100);
        const updatedCourse = { ...crs, lessons: updatedLessons, progressPercent };

        if (selectedCourse?.id === courseId) {
          setSelectedCourse(updatedCourse);
        }
        return updatedCourse;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>RYNEXO Skill Academy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {getTranslation(language, 'learningTitle')}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              {getTranslation(language, 'learningSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-white text-black font-bold shadow'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Market Intelligence / News API Conditional Render */}
      {activeCategory === 'Market Intelligence' && (
        <div className="space-y-4">
          {!hasNewsKey ? (
            <div className="p-8 sm:p-12 rounded-[32px] bg-white/[0.03] border border-blue-500/30 backdrop-blur-2xl text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Connect News API</h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
                <code className="text-blue-300 font-mono">NEWS_API_KEY</code> is not set in your environment. Live news stream is hidden, but internal market signals are safely active without crashing.
              </p>
              {onOpenIntegrations && (
                <button
                  onClick={onOpenIntegrations}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg transition flex items-center gap-2"
                >
                  <Server className="w-4 h-4" />
                  <span>Configure in Integration Manager</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-[32px] bg-white/[0.03] border border-emerald-500/30 backdrop-blur-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live News API Telemetry Connected</h3>
              </div>
              <p className="text-xs text-slate-300">
                Fetching real-time market intelligence feed using configured <code className="text-emerald-300 font-mono">NEWS_API_KEY</code>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((crs) => (
          <div
            key={crs.id}
            className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative mb-4 overflow-hidden rounded-2xl h-40 border border-white/10">
                <img
                  src={crs.thumbnailUrl}
                  alt={crs.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 uppercase tracking-widest">
                  {crs.level}
                </div>
              </div>

              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                {crs.category}
              </span>

              <h3 className="text-lg font-bold text-white mt-1 mb-2">
                {crs.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {crs.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">
                    {getTranslation(language, 'progress')}
                  </span>
                  <span className="text-purple-300 font-mono">
                    {crs.progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                    style={{ width: `${crs.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCourse(crs)}
              className="w-full py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow"
            >
              <span>
                {crs.progressPercent > 0
                  ? getTranslation(language, 'continueCourse')
                  : getTranslation(language, 'startCourse')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0c0d14] border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                {selectedCourse.category} • {selectedCourse.level}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {selectedCourse.title}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            {/* Lessons Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Module Syllabus ({selectedCourse.lessons.length} Lessons)
              </h4>

              {selectedCourse.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => toggleLessonComplete(selectedCourse.id, lesson.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                    lesson.completed
                      ? 'bg-white/2 border-white/5 text-slate-500'
                      : 'bg-white/5 border-white/10 text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Play className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{lesson.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {lesson.content}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {lesson.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
