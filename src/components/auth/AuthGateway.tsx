import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  BookOpen,
  Timer,
  Trophy,
  Bot,
  ArrowRight,
  Check,
} from 'lucide-react';

export const AuthGateway: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    isAuthLoading,
    loginWithGoogle,
    loginAsGuestSandbox,
    hasCompletedOnboarding,
    completeOnboarding,
    nickname,
  } = useApp();

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<'nickname' | 'tour'>('nickname');
  const [inputNickname, setInputNickname] = useState(
    nickname && nickname !== 'Alex M.' ? nickname : ''
  );
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 11');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeChoices = ['Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 9', 'O/L Candidate'];

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-page font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded theme-accent-btn flex items-center justify-center font-bold text-sm shadow-xs">
            9s
          </div>
          <span className="theme-text-muted">Initializing All9s Terminal...</span>
        </div>
      </div>
    );
  }

  // 1. If not signed in at all: Enforce sign-in gateway
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between theme-page p-4 sm:p-8 overflow-x-hidden w-full">
        {/* Top Minimalist Brand */}
        <div className="max-w-md w-full mx-auto flex items-center gap-2.5 pt-4">
          <div className="w-8 h-8 rounded theme-accent-btn flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            9s
          </div>
          <div>
            <span className="font-mono text-base font-bold tracking-tight theme-text-primary">
              All9s
            </span>
            <span className="ml-2 text-[10px] font-mono uppercase tracking-wider theme-text-muted">
              Edexcel IGCSE Terminal
            </span>
          </div>
        </div>

        {/* Central Sign-In Station */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="rounded-xl border theme-border theme-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono theme-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 theme-accent-text" />
                <span>Candidate Access Gate</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight theme-text-primary">
                Sign in to All9s
              </h1>
              <p className="text-xs theme-text-secondary leading-relaxed font-sans">
                Sign in with your Google account to access your revision vault, set your student nickname, start from scratch at Level 1, and compete on the live leaderboard.
              </p>
            </div>

            {/* Platform Feature Checklist */}
            <div className="p-3.5 rounded border theme-border theme-subtle space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-2 theme-text-primary">
                <Check className="w-3.5 h-3.5 theme-accent-text shrink-0" />
                <span>Edexcel IGCSE Syllabus Specification Vault</span>
              </div>
              <div className="flex items-center gap-2 theme-text-primary">
                <Check className="w-3.5 h-3.5 theme-accent-text shrink-0" />
                <span>Grade 1 - 13 Level-Based Student Leaderboard</span>
              </div>
              <div className="flex items-center gap-2 theme-text-primary">
                <Check className="w-3.5 h-3.5 theme-accent-text shrink-0" />
                <span>Opencode AI Companion with Custom Nickname</span>
              </div>
              <div className="flex items-center gap-2 theme-text-primary">
                <Check className="w-3.5 h-3.5 theme-accent-text shrink-0" />
                <span>Split-Screen Exam Simulator with Mark Schemes</span>
              </div>
            </div>

            {/* Google Sign-In Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded theme-accent-btn font-mono text-xs font-semibold cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>

              <button
                onClick={loginAsGuestSandbox}
                className="w-full py-2 px-3 rounded border theme-border theme-subtle theme-text-secondary hover:theme-text-primary font-mono text-[11px] cursor-pointer text-center"
              >
                Or enter as Candidate in Sandbox Mode
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto text-center text-[11px] font-mono theme-text-muted pb-4">
          All9s Edexcel IGCSE Revision Terminal · Grade 9 Target Standard
        </div>
      </div>
    );
  }

  // 2. If signed in, but has not completed the onboarding flow: Ask Nickname & Explain website
  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center theme-page p-4 sm:p-6 overflow-x-hidden w-full">
        <div className="max-w-xl w-full rounded-xl border theme-border theme-card p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b theme-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded theme-accent-btn flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                9s
              </div>
              <span className="font-mono text-xs font-bold theme-text-primary">
                Candidate Onboarding
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono theme-text-muted">
              <span className={onboardingStep === 'nickname' ? 'theme-text-primary font-bold' : ''}>
                1. Nickname
              </span>
              <span>→</span>
              <span className={onboardingStep === 'tour' ? 'theme-text-primary font-bold' : ''}>
                2. How It Works
              </span>
            </div>
          </div>

          {onboardingStep === 'nickname' ? (
            /* Step 1: "What do you want to be called?" */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-xs font-mono theme-text-muted uppercase tracking-wider">
                  Step 1 of 2
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight theme-text-primary">
                  What do you want to be called?
                </h2>
                <p className="text-xs theme-text-secondary leading-relaxed font-sans">
                  Choose a candidate display nickname. Other players will see this nickname on the leaderboard, and your Opencode AI tutor will use it when guiding you.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
                    Your Candidate Nickname
                  </label>
                  <input
                    type="text"
                    value={inputNickname}
                    onChange={(e) => setInputNickname(e.target.value)}
                    maxLength={24}
                    placeholder="e.g. Alex_PhysicsPro, StarCandidate9"
                    className="w-full px-3.5 py-2.5 rounded border theme-border theme-input text-sm font-mono theme-text-primary focus:outline-none"
                  />
                  <p className="text-[11px] font-mono theme-text-muted mt-1">
                    2 to 24 characters. You can change this anytime in settings.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold theme-text-primary mb-1.5">
                    Your Current Grade Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {gradeChoices.map((grade) => (
                      <button
                        type="button"
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-3 py-2 rounded border text-xs font-mono transition-all cursor-pointer text-center ${
                          selectedGrade === grade
                            ? 'theme-accent-btn font-bold shadow-xs'
                            : 'border theme-border theme-subtle theme-text-secondary hover:opacity-85'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-3.5 rounded border theme-border theme-subtle space-y-2">
                  <span className="text-[10px] font-mono uppercase theme-text-muted font-semibold block">
                    Live Preview:
                  </span>
                  <div className="text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="theme-text-muted">Leaderboard:</span>
                      <span className="font-bold theme-text-primary">
                        {inputNickname.trim() || 'YourNickname'}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded theme-subtle font-semibold">
                        {selectedGrade}
                      </span>
                      <span className="theme-text-muted">· Lv.1</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] theme-text-secondary">
                      <span className="theme-text-muted">AI Tutor:</span>
                      <span className="italic">
                        &quot;Welcome back, {inputNickname.trim() || 'Candidate'}!&quot;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={inputNickname.trim().length < 2}
                  onClick={() => setOnboardingStep('tour')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded theme-accent-btn font-mono text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <span>Continue: How All9s Works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: "How the website works & Start from scratch at Level 1" */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-xs font-mono theme-text-muted uppercase tracking-wider">
                  Step 2 of 2
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight theme-text-primary">
                  How the Website Works
                </h2>
                <p className="text-xs theme-text-secondary leading-relaxed font-sans">
                  All9s is an Edexcel IGCSE revision terminal. You start completely from scratch at <strong>Level 1 (0 XP)</strong> and rise by mastering syllabus checkpoints and timed papers.
                </p>
              </div>

              {/* 4 Feature Guide Cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded border theme-border theme-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded border theme-border theme-card flex items-center justify-center shrink-0 theme-accent-text">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono theme-text-primary">
                      1. Specification Revision Vault
                    </h3>
                    <p className="text-[11px] theme-text-secondary mt-0.5 leading-relaxed font-sans">
                      Official Edexcel specification modules, formula decks with one-click derivations, and self-assessment checkpoint questions.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border theme-border theme-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded border theme-border theme-card flex items-center justify-center shrink-0 theme-accent-text">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono theme-text-primary">
                      2. Split-Screen Exam Simulator
                    </h3>
                    <p className="text-[11px] theme-text-secondary mt-0.5 leading-relaxed font-sans">
                      Official IGCSE past papers with an active digital countdown timer, rough calculation scratchpad, and toggleable mark scheme.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border theme-border theme-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded border theme-border theme-card flex items-center justify-center shrink-0 theme-accent-text">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono theme-text-primary">
                      3. Level-Based Leaderboard
                    </h3>
                    <p className="text-[11px] theme-text-secondary mt-0.5 leading-relaxed font-sans">
                      Start at <strong>Level 1 (0 XP)</strong>. Solve questions and complete daily quests to earn XP and advance across Diamond League rankings.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border theme-border theme-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded border theme-border theme-card flex items-center justify-center shrink-0 theme-accent-text">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono theme-text-primary">
                      4. Opencode AI Companion
                    </h3>
                    <p className="text-[11px] theme-text-secondary mt-0.5 leading-relaxed font-sans">
                      Slide over your intelligent tutor anytime. Grounded in Edexcel criteria, Opencode addresses you as <strong>{inputNickname.trim()}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Revision at Level 1 Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep('nickname')}
                  className="px-3 py-2 rounded text-xs font-mono theme-text-muted hover:theme-text-primary cursor-pointer"
                >
                  ← Back to Nickname
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    await completeOnboarding(inputNickname, selectedGrade);
                    setIsSubmitting(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded theme-accent-btn font-mono text-xs font-bold cursor-pointer shadow-xs"
                >
                  <span>Start from Scratch (Level 1)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Authenticated & Onboarding Complete -> Render application
  return <>{children}</>;
};
