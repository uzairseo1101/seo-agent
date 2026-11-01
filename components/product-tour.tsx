'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bot,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Search,
  Sparkles,
  Download,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourScene {
  id: number;
  title: string;
  stepName: string;
  shortDesc: string;
  callout: string;
}

const scenes: TourScene[] = [
  {
    id: 1,
    stepName: '1. Ask the agent',
    title: 'Give your SEO task in plain English',
    shortDesc: 'Type naturally. No complex query syntax or SEO code required.',
    callout: '1. Type your task in plain English',
  },
  {
    id: 2,
    stepName: '2. Agent is working',
    title: 'Watch the agent crawl and analyze live',
    shortDesc: 'Autonomous background tasks inspect speed, links, and schemas.',
    callout: '2. Watch the agent work live',
  },
  {
    id: 3,
    stepName: '3. See what to fix',
    title: 'Prioritized fixes and live health scores',
    shortDesc: 'Evidence-backed deductions with one-click fix prompts.',
    callout: '3. Fix issues with one click',
  },
  {
    id: 4,
    stepName: '4. Find keywords',
    title: 'Uncover striking-distance rank targets',
    shortDesc: 'Queries on positions 5–20 with high impression volume.',
    callout: '4. Target fast ranking wins',
  },
  {
    id: 5,
    stepName: '5. Share with clients',
    title: 'Client-ready reports in one click',
    shortDesc: 'White-label executive summaries proving verified growth.',
    callout: '5. Export branded client report',
  },
];

export default function ProductTour() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [animatedScore, setAnimatedScore] = useState(62);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneDuration = 5000; // 5 seconds per scene

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setIsPlaying(false);

      const handleChange = () => {
        setPrefersReducedMotion(mediaQuery.matches);
        if (mediaQuery.matches) setIsPlaying(false);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // IntersectionObserver to only autoplay when visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scene timer loop
  useEffect(() => {
    if (!isPlaying || isHovered || !isInView || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, sceneDuration);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isInView, prefersReducedMotion]);

  // Typing animation for Scene 1
  useEffect(() => {
    if (currentScene === 0) {
      setTypedText('');
      const fullText = 'Audit example.com and find the top SEO fixes';
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 70);
      return () => clearInterval(typeInterval);
    }
  }, [currentScene]);

  // Counting score animation for Scene 3
  useEffect(() => {
    if (currentScene === 2) {
      setAnimatedScore(62);
      let s = 62;
      const countInterval = setInterval(() => {
        if (s < 84) {
          s += 2;
          setAnimatedScore(s);
        } else {
          clearInterval(countInterval);
        }
      }, 100);
      return () => clearInterval(countInterval);
    }
  }, [currentScene]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    } else if (e.key === 'ArrowLeft') {
      setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Interactive Product Tour"
      className="space-y-6 focus:outline-none"
    >
      {/* Stepper Tabs (Clickable, accessible navigation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pb-2">
        {scenes.map((scene, idx) => {
          const isActive = idx === currentScene;
          return (
            <button
              key={scene.id}
              onClick={() => setCurrentScene(idx)}
              className={cn(
                'text-left p-3 rounded-md border transition-all text-xs relative overflow-hidden',
                isActive
                  ? 'bg-card border-primary text-text shadow-xs'
                  : 'bg-card/60 hover:bg-card border-border text-muted hover:text-text'
              )}
            >
              {/* Active thin green progress bar */}
              {isActive && isPlaying && !isHovered && isInView && !prefersReducedMotion && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary animate-progress"
                  style={{ animationDuration: `${sceneDuration}ms` }}
                />
              )}
              {isActive && (isPlaying ? isHovered : true) && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
              )}
              <span
                className={cn(
                  'block font-head font-bold text-xs',
                  isActive ? 'text-primary' : 'text-text'
                )}
              >
                {scene.stepName}
              </span>
              <span className="block text-[11px] text-muted truncate mt-0.5">
                {scene.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Browser Frame */}
      <div
        className="relative bg-card rounded-lg border border-border shadow-pop overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Browser Top Window Bar */}
        <div className="h-10 px-4 bg-slate-100 dark:bg-slate-800/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1 rounded-sm text-[11px] font-mono text-muted w-72 truncate justify-center">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
            <span>rankpilot.ai/app/agent-tour</span>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length)}
              className="p-1 text-muted hover:text-text rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Previous scene"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-muted hover:text-text rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label={isPlaying ? 'Pause tour' : 'Play tour'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setCurrentScene((prev) => (prev + 1) % scenes.length)}
              className="p-1 text-muted hover:text-text rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Next scene"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scene Container with dynamic animated callout badge */}
        <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between relative bg-bg/40">
          {/* Animated Callout Pill */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-card border border-primary/30 shadow-card px-3 py-1.5 rounded-full text-xs font-medium text-text animate-bounce duration-1000">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span>{scenes[currentScene].callout}</span>
          </div>

          {/* SCENE 1: Ask the Agent */}
          {currentScene === 0 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-bold font-head text-text">
                  Step 1: Ask the AI Agent in Natural Language
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Type your objective as if messaging a senior SEO teammate.
                </p>
              </div>

              {/* Chat Container */}
              <div className="bg-card rounded-md border border-border p-4 space-y-4 shadow-xs max-w-xl">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                    AI
                  </div>
                  <div className="bg-bg border border-border rounded-md p-3 text-xs text-text leading-relaxed w-full">
                    Hello! I am ready to inspect your website. What would you like me to prioritize today?
                  </div>
                </div>

                {/* Simulated typed prompt in green-tint bubble */}
                <div className="flex justify-end">
                  <div className="bg-primary-tint border border-emerald-200/80 text-text rounded-md p-3 text-xs max-w-[85%] font-medium">
                    {typedText}
                    <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse align-middle"></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <div className="flex-1 text-xs px-3 py-2 rounded-md border border-border bg-bg text-muted font-mono">
                    {typedText || 'Ask agent to diagnose or craft fixes...'}
                  </div>
                  <button className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center shadow-xs">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: Agent is working */}
          {currentScene === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-bold font-head text-text">
                  Step 2: Real-time Autonomous Task Execution
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  The agent crawls pages, computes Core Web Vitals, and isolates technical debt.
                </p>
              </div>

              <div className="bg-card rounded-md border border-border p-5 space-y-4 shadow-xs max-w-xl">
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="font-semibold text-text flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-primary" />
                    Agent Audit Pipeline
                  </span>
                  <span className="font-mono text-accent text-[11px] bg-accent-tint px-2 py-0.5 rounded-full border border-blue-200">
                    Running Phase 3/4
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-text font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      1. SSRF-Safe Crawler: 25 pages inspected
                    </span>
                    <span className="font-mono text-[11px] text-muted">1.2s · Done</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-text font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      2. Heading & Meta Tag Integrity
                    </span>
                    <span className="font-mono text-[11px] text-muted">0.8s · Done</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-accent font-medium">
                      <RefreshCw className="w-4 h-4 text-accent animate-spin" />
                      3. Schema & AI-Answer (AEO) Readiness
                    </span>
                    <span className="font-mono text-[11px] text-accent">Analyzing...</span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="w-4 h-4 rounded-full border border-border inline-block"></span>
                      4. GSC Striking Distance Opportunity Finder
                    </span>
                    <span className="font-mono text-[11px] text-muted">Queued</span>
                  </div>
                </div>

                {/* Collapsible Log Mockup */}
                <div className="p-2.5 rounded-md bg-[#F1F5F9] dark:bg-slate-800 border border-border font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <p className="text-primary font-semibold">&gt; [Crawler] Extracted 42 internal links</p>
                  <p className="text-muted">&gt; [SSRF Guard] 100% public IP verified</p>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 3: See what to fix */}
          {currentScene === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-bold font-head text-text">
                  Step 3: Clear Findings with Impact Scores
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Every issue includes affected URLs, exact explanations, and one-click agent fixes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                {/* Score Counter Card */}
                <div className="bg-card rounded-md border border-border p-4 shadow-xs flex flex-col justify-between">
                  <span className="text-xs text-muted font-medium">SEO Health Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold font-mono text-primary tnum">
                      {animatedScore}
                    </span>
                    <span className="text-xs font-mono text-muted">/ 100</span>
                  </div>
                  <span className="text-[11px] text-primary font-medium mt-1">
                    +22 points after fixes
                  </span>
                </div>

                {/* Finding 1 */}
                <div className="sm:col-span-2 bg-card rounded-md border border-border p-3.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-error border border-red-200">
                      Critical · -15 pts
                    </span>
                    <span className="text-[11px] text-muted font-mono">3 Affected Pages</span>
                  </div>
                  <p className="text-xs font-semibold text-text">Missing H1 Heading on Core Service URL</p>
                  <p className="text-[11px] text-muted">Answer engines and search crawlers cannot determine primary topic.</p>
                  <div className="pt-1">
                    <button className="text-[11px] font-medium text-white bg-primary px-2.5 py-1 rounded-sm shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Fix with agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 4: Find keywords */}
          {currentScene === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-bold font-head text-text">
                  Step 4: Uncover Striking Distance Search Keywords
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Direct Google Search Console sync finds high-impression queries ranked 5–20.
                </p>
              </div>

              <div className="bg-card rounded-md border border-border shadow-xs overflow-hidden max-w-xl">
                <div className="h-9 px-4 bg-slate-50 dark:bg-slate-800/60 border-b border-border flex items-center justify-between text-[11px] font-mono text-muted uppercase">
                  <span>Target Query</span>
                  <div className="flex items-center gap-6">
                    <span>Rank</span>
                    <span>Change</span>
                    <span>Impressions</span>
                  </div>
                </div>
                <div className="divide-y divide-border text-xs">
                  <div className="h-11 px-4 flex items-center justify-between hover:bg-bg transition-colors">
                    <span className="font-medium text-text truncate max-w-[180px]">b2b seo automation</span>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="w-6 text-right font-bold text-text">6.2</span>
                      <span className="text-primary font-bold">+4</span>
                      <span className="text-muted tnum w-12 text-right">14,200</span>
                    </div>
                  </div>
                  <div className="h-11 px-4 flex items-center justify-between hover:bg-bg transition-colors">
                    <span className="font-medium text-text truncate max-w-[180px]">ai site audit tool</span>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="w-6 text-right font-bold text-text">8.4</span>
                      <span className="text-primary font-bold">+2</span>
                      <span className="text-muted tnum w-12 text-right">9,850</span>
                    </div>
                  </div>
                  <div className="h-11 px-4 flex items-center justify-between hover:bg-bg transition-colors">
                    <span className="font-medium text-text truncate max-w-[180px]">geo optimization guide</span>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="w-6 text-right font-bold text-text">11.1</span>
                      <span className="text-primary font-bold">+5</span>
                      <span className="text-muted tnum w-12 text-right">6,400</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: Share with clients */}
          {currentScene === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-bold font-head text-text">
                  Step 5: Client-Ready Executive Reporting
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Export branded, white-label PDF reports proving verified SEO fixes.
                </p>
              </div>

              <div className="bg-card rounded-md border border-border p-5 shadow-xs max-w-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold font-head text-text">
                      Monthly SEO Performance Report
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Improvements
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-2.5 rounded-md bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Audited URLs</span>
                    <span className="text-base font-bold text-text tnum">25</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Fixes Verified</span>
                    <span className="text-base font-bold text-primary tnum">12</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Organic Clicks</span>
                    <span className="text-base font-bold text-accent tnum">+24.6%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted">Ready to deliver to clients</span>
                  <button className="h-9 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs flex items-center gap-1.5 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Export report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar: Scene Selector Pills */}
          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
            <span className="font-mono text-[11px]">
              Scene {currentScene + 1} of {scenes.length}
            </span>
            <div className="flex items-center gap-1.5">
              {scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentScene(i)}
                  aria-label={`Go to scene ${i + 1}`}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === currentScene ? 'w-6 bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
