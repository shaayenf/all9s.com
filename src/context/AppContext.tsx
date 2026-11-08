import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppView, SubjectId, Quest, GuiSettings, LeaderboardUser, PomodoroState, PomodoroMode, PomodoroSessionRecord } from '../types';
import { DAILY_QUESTS, LEADERBOARD_USERS } from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { calculateLevelAndProgress, getContrastColor, hexToRgba } from '../utils/revisionMath';
import {
  initPomodoroState,
  startPomodoro,
  pausePomodoro,
  resetPomodoro,
  tickPomodoro,
  changePomodoroMode,
  changePomodoroSubject,
  completeFocusSession,
  playChimeSound,
  INITIAL_SUBJECT_STATS,
} from '../utils/pomodoro';

interface AppContextType {
  // Navigation & View
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  activeSubjectId: SubjectId;
  setActiveSubjectId: (id: SubjectId) => void;

  // Authentication & Profile
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuestSandbox: () => void;
  logout: () => Promise<void>;
  nickname: string;
  setNickname: (name: string) => Promise<void>;
  olGrade: string;
  setOlGrade: (grade: string) => Promise<void>;
  primarySubjectId: SubjectId;
  setPrimarySubject: (subjectId: SubjectId) => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (customNickname: string, chosenSubject?: SubjectId, chosenGrade?: string) => Promise<void>;
  resetToLevelOne: () => Promise<void>;

  // GUI & Appearance Settings
  guiSettings: GuiSettings;
  updateGuiSettings: (settings: Partial<GuiSettings>) => Promise<void>;
  toggleTheme: () => void;

  // Gamification Metrics (Starts at Level 1)
  xp: number;
  addXp: (amount: number) => void;
  streak: number;
  level: number;
  levelTitle: string;
  hearts: number;
  decrementHeart: () => void;
  refillHearts: () => void;

  // Leaderboard (Level & O/L grade based)
  leaderboardUsers: LeaderboardUser[];

  // Opencode AI Drawer
  isOpencodeOpen: boolean;
  setIsOpencodeOpen: (open: boolean) => void;
  toggleOpencode: () => void;
  opencodeContextPrompt: string;
  triggerOpencodeWithPrompt: (prompt: string) => void;

  // Exam Arena
  activeExamPaperId: string | null;
  setActiveExamPaperId: (id: string | null) => void;

  // Quests & Checkpoints
  quests: Quest[];
  claimQuestReward: (id: string) => void;
  completedCheckpoints: Set<string>;
  toggleCheckpointCompleted: (id: string) => void;

  // Persistent Pomodoro Focus Study Timer
  pomodoro: PomodoroState;
  startPomodoroTimer: () => void;
  pausePomodoroTimer: () => void;
  resetPomodoroTimer: () => void;
  setPomodoroMode: (mode: PomodoroMode, customDurationSecs?: number) => void;
  setPomodoroSubject: (subjectId: SubjectId) => void;
  completeCurrentPomodoroSession: () => void;
  clearPomodoroHistory: () => void;
}

const DEFAULT_GUI_SETTINGS: GuiSettings = {
  themeMode: 'dark',
  palette: 'monochrome',
  accentColor: '#ffffff',
  fontSize: 'standard',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(() => {
    const saved = localStorage.getItem('all9s_primary_subject') as SubjectId;
    return saved || 'physics';
  });
  const [primarySubjectId, setPrimarySubjectState] = useState<SubjectId>(() => {
    const saved = localStorage.getItem('all9s_primary_subject') as SubjectId;
    return saved || 'physics';
  });

  // Auth & Profile
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isGuestSession, setIsGuestSession] = useState<boolean>(false);
  const [nickname, setNicknameState] = useState<string>('Alex_OLevel');
  const [olGrade, setOlGradeState] = useState<string>('Grade 11');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('all9s_onboarding_completed') === 'true';
  });

  // GUI Settings
  const [guiSettings, setGuiSettings] = useState<GuiSettings>(() => {
    try {
      const saved = localStorage.getItem('all9s_gui_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_GUI_SETTINGS;
  });

  // Gamification: Starts fresh at Level 1 (0 XP, 1-day login streak)
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('all9s_student_xp');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState<number>(1);
  const [hearts, setHearts] = useState<number>(5);
  const [quests, setQuests] = useState<Quest[]>(DAILY_QUESTS);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());

  // Live Leaderboard data
  const [firestoreLeaderboard, setFirestoreLeaderboard] = useState<LeaderboardUser[]>([]);

  // Opencode state
  const [isOpencodeOpen, setIsOpencodeOpen] = useState<boolean>(false);
  const [opencodeContextPrompt, setOpencodeContextPrompt] = useState<string>('');
  const [activeExamPaperId, setActiveExamPaperId] = useState<string | null>('pp-phys-2025-1h');

  // Persistent Pomodoro Focus Study Timer State
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    try {
      const saved = localStorage.getItem('all9s_pomodoro_state');
      if (saved) {
        return initPomodoroState(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return initPomodoroState();
  });

  const { level, title: levelTitle } = calculateLevelAndProgress(xp);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        setIsGuestSession(false);
        const profilePath = `publicProfiles/${currentUser.uid}`;
        try {
          const profileDoc = await getDoc(doc(db, 'publicProfiles', currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (data.nickname) setNicknameState(data.nickname);
            if (data.olGrade) setOlGradeState(data.olGrade);
            if (data.primarySubjectId) {
              setPrimarySubjectState(data.primarySubjectId as SubjectId);
              setActiveSubjectId(data.primarySubjectId as SubjectId);
              localStorage.setItem('all9s_primary_subject', data.primarySubjectId);
            }
            if (typeof data.xp === 'number') {
              setXp(data.xp);
              localStorage.setItem('all9s_student_xp', data.xp.toString());
            }
            if (typeof data.streak === 'number') setStreak(data.streak);
            setHasCompletedOnboarding(true);
            localStorage.setItem('all9s_onboarding_completed', 'true');
          } else {
            // New student: needs to pick a nickname and see how the website works, starting at Level 1
            const suggestedNick =
              currentUser.displayName?.replace(/\s+/g, '_').slice(0, 20) ||
              'Candidate_' + currentUser.uid.slice(0, 5);
            setNicknameState(suggestedNick);
            setXp(0);
            localStorage.setItem('all9s_student_xp', '0');
            setHasCompletedOnboarding(false);
            localStorage.removeItem('all9s_onboarding_completed');
          }
        } catch (err: any) {
          if (err?.message?.includes('offline') || err?.code === 'unavailable') {
            console.warn('Firestore temporarily offline, using cached local student profile.');
            setHasCompletedOnboarding(localStorage.getItem('all9s_onboarding_completed') === 'true');
          } else {
            handleFirestoreError(err, OperationType.GET, profilePath);
          }
        }

        // Fetch user custom GUI settings
        const settingsPath = `userSettings/${currentUser.uid}`;
        try {
          const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data() as Partial<GuiSettings>;
            setGuiSettings((prev) => ({
              ...prev,
              ...data,
            }));
          }
        } catch (err: any) {
          if (err?.message?.includes('offline') || err?.code === 'unavailable') {
            console.warn('Firestore temporarily offline, using cached GUI settings.');
          } else {
            handleFirestoreError(err, OperationType.GET, settingsPath);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync public profiles for real-time leaderboard
  useEffect(() => {
    const profilesCol = collection(db, 'publicProfiles');
    const q = query(profilesCol, orderBy('xp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: LeaderboardUser[] = [];
        snapshot.docs.forEach((docSnap, index) => {
          const data = docSnap.data();
          users.push({
            id: docSnap.id,
            rank: index + 1,
            name: data.nickname || 'Candidate',
            avatarSeed: data.avatarSeed || 'C',
            xp: data.xp || 0,
            streak: data.streak || 1,
            level: data.level || 1,
            olGrade: data.olGrade || 'Grade 11',
            league: 'Diamond',
            badgeTitle: data.badgeTitle || 'Grade 7 Novice',
            isCurrentUser: user ? docSnap.id === user.uid : false,
          });
        });
        setFirestoreLeaderboard(users);
      },
      (error) => {
        if (error?.message?.includes('offline') || error?.code === 'unavailable') {
          console.warn('Leaderboard snapshot listener offline, using fallback rankings.');
        } else {
          handleFirestoreError(error, OperationType.LIST, 'publicProfiles');
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Apply theme & font scale & palette classes to root DOM element
  useEffect(() => {
    const root = document.documentElement;

    if (guiSettings.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (guiSettings.fontSize === 'compact') {
      root.style.fontSize = '14px';
    } else if (guiSettings.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }

    root.setAttribute('data-palette', guiSettings.palette);

    // Compute accessible accent color
    let effectiveAccent = guiSettings.accentColor || '#ffffff';
    if (guiSettings.themeMode === 'light' && (effectiveAccent === '#ffffff' || effectiveAccent.toLowerCase() === '#fff')) {
      effectiveAccent = '#09090b';
    } else if (guiSettings.themeMode === 'dark' && (effectiveAccent === '#000000' || effectiveAccent === '#09090b')) {
      effectiveAccent = '#ffffff';
    }

    const contrastColor = getContrastColor(effectiveAccent);
    const subtleBg = hexToRgba(effectiveAccent, 0.12);
    const subtleBorder = hexToRgba(effectiveAccent, 0.28);

    root.style.setProperty('--user-accent-color', effectiveAccent);
    root.style.setProperty('--user-accent-contrast', contrastColor);
    root.style.setProperty('--user-accent-subtle', subtleBg);
    root.style.setProperty('--user-accent-subtle-border', subtleBorder);

    try {
      localStorage.setItem('all9s_gui_settings', JSON.stringify(guiSettings));
    } catch {
      // ignore
    }
  }, [guiSettings]);

  const toggleTheme = () => {
    updateGuiSettings({
      themeMode: guiSettings.themeMode === 'dark' ? 'light' : 'dark',
    });
  };

  const updateGuiSettings = async (partial: Partial<GuiSettings>) => {
    const next = { ...guiSettings, ...partial };
    setGuiSettings(next);

    if (user) {
      const path = `userSettings/${user.uid}`;
      try {
        await setDoc(doc(db, 'userSettings', user.uid), {
          userId: user.uid,
          themeMode: next.themeMode,
          palette: next.palette,
          accentColor: next.accentColor,
          fontSize: next.fontSize,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const loginAsGuestSandbox = () => {
    setIsGuestSession(true);
    setIsAuthLoading(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuestSession(false);
      setHasCompletedOnboarding(false);
      localStorage.removeItem('all9s_onboarding_completed');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const completeOnboarding = async (
    customNickname: string,
    chosenSubject: SubjectId = 'physics',
    chosenGrade: string = 'Grade 11'
  ) => {
    const cleanNick = customNickname.trim().slice(0, 24) || 'Candidate_1';
    const cleanGrade = chosenGrade || 'Grade 11';
    const cleanSubject = chosenSubject || 'physics';

    setNicknameState(cleanNick);
    setOlGradeState(cleanGrade);
    setPrimarySubjectState(cleanSubject);
    setActiveSubjectId(cleanSubject);
    setXp(0);
    setStreak(1);
    setHasCompletedOnboarding(true);
    localStorage.setItem('all9s_onboarding_completed', 'true');
    localStorage.setItem('all9s_student_xp', '0');
    localStorage.setItem('all9s_primary_subject', cleanSubject);

    if (user) {
      const profilePath = `publicProfiles/${user.uid}`;
      try {
        await setDoc(doc(db, 'publicProfiles', user.uid), {
          userId: user.uid,
          nickname: cleanNick,
          level: 1,
          xp: 0,
          streak: 1,
          olGrade: cleanGrade,
          primarySubjectId: cleanSubject,
          badgeTitle: 'Grade 7 Novice',
          avatarSeed: cleanNick.slice(0, 2).toUpperCase(),
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: user.email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        if (err?.message?.includes('offline') || err?.code === 'unavailable') {
          console.warn('Firestore offline while saving profile during onboarding');
        } else {
          handleFirestoreError(err, OperationType.WRITE, profilePath);
        }
      }
    }
  };

  const setPrimarySubject = async (subjectId: SubjectId) => {
    setPrimarySubjectState(subjectId);
    setActiveSubjectId(subjectId);
    localStorage.setItem('all9s_primary_subject', subjectId);

    if (user) {
      const path = `publicProfiles/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            primarySubjectId: subjectId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err: any) {
        if (err?.message?.includes('offline') || err?.code === 'unavailable') {
          console.warn('Firestore offline while updating primary subject');
        } else {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
    }
  };

  const resetToLevelOne = async () => {
    setXp(0);
    localStorage.setItem('all9s_student_xp', '0');

    if (user) {
      const path = `publicProfiles/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            level: 1,
            xp: 0,
            badgeTitle: 'Grade 7 Novice',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const setNickname = async (newNickname: string) => {
    const trimmed = newNickname.trim().slice(0, 24);
    if (trimmed.length < 2) return;

    setNicknameState(trimmed);

    if (user) {
      const path = `publicProfiles/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            userId: user.uid,
            nickname: trimmed,
            level,
            xp,
            streak,
            olGrade,
            badgeTitle: levelTitle,
            avatarSeed: trimmed.slice(0, 2).toUpperCase(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const setOlGrade = async (grade: string) => {
    setOlGradeState(grade);

    if (user) {
      const path = `publicProfiles/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            olGrade: grade,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const addXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem('all9s_student_xp', next.toString());
      if (user) {
        const path = `publicProfiles/${user.uid}`;
        setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            xp: next,
            level: calculateLevelAndProgress(next).level,
            badgeTitle: calculateLevelAndProgress(next).title,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => handleFirestoreError(err, OperationType.UPDATE, path));
      }
      return next;
    });
  };

  const decrementHeart = () => {
    setHearts((prev) => Math.max(0, prev - 1));
  };

  const refillHearts = () => {
    setHearts(5);
  };

  const toggleOpencode = () => {
    setIsOpencodeOpen((prev) => !prev);
  };

  const triggerOpencodeWithPrompt = (prompt: string) => {
    setOpencodeContextPrompt(prompt);
    setIsOpencodeOpen(true);
  };

  const claimQuestReward = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id && q.completed && !q.claimed) {
          addXp(q.xpReward);
          return { ...q, claimed: true };
        }
        return q;
      })
    );
  };

  const toggleCheckpointCompleted = (id: string) => {
    setCompletedCheckpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        addXp(40);
      }
      return next;
    });
  };

  // Merge leaderboard users: current user starts at Level 1 and is ranked among peers
  const combinedLeaderboard: LeaderboardUser[] = React.useMemo(() => {
    const currentUserItem: LeaderboardUser = {
      rank: 1,
      name: nickname,
      avatarSeed: nickname.slice(0, 2).toUpperCase(),
      xp,
      streak,
      level,
      olGrade,
      league: 'Diamond',
      badgeTitle: levelTitle,
      isCurrentUser: true,
    };

    const otherMocks = LEADERBOARD_USERS.filter((u) => !u.isCurrentUser);
    const otherFirestore = firestoreLeaderboard.filter(
      (u) => (!user || u.id !== user.uid) && u.name !== nickname
    );

    const all = [currentUserItem, ...otherFirestore, ...otherMocks];

    all.sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return b.xp - a.xp;
    });

    return all.map((userItem, idx) => ({
      ...userItem,
      rank: idx + 1,
    }));
  }, [nickname, xp, streak, level, olGrade, levelTitle, firestoreLeaderboard, user]);

  // Save pomodoro state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('all9s_pomodoro_state', JSON.stringify(pomodoro));
    } catch {
      // ignore
    }
  }, [pomodoro]);

  // Pomodoro background ticking engine - calculates wall clock delta accurately
  useEffect(() => {
    if (!pomodoro.isRunning) return;

    const intervalId = setInterval(() => {
      setPomodoro((prev) => {
        const { nextState, justCompleted } = tickPomodoro(prev);
        if (justCompleted) {
          playChimeSound();
          if (prev.mode === 'focus') {
            const { nextState: completedState, xpEarned } = completeFocusSession(prev);
            addXp(xpEarned);
            return completedState;
          }
        }
        return nextState;
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, [pomodoro.isRunning]);

  const startPomodoroTimer = () => {
    setPomodoro((prev) => startPomodoro(prev));
  };

  const pausePomodoroTimer = () => {
    setPomodoro((prev) => pausePomodoro(prev));
  };

  const resetPomodoroTimer = () => {
    setPomodoro((prev) => resetPomodoro(prev));
  };

  const setPomodoroMode = (mode: PomodoroMode, customDurationSecs?: number) => {
    setPomodoro((prev) => changePomodoroMode(prev, mode, customDurationSecs));
  };

  const setPomodoroSubject = (subjectId: SubjectId) => {
    setPomodoro((prev) => changePomodoroSubject(prev, subjectId));
  };

  const completeCurrentPomodoroSession = () => {
    setPomodoro((prev) => {
      const elapsed = Math.max(60, prev.durationSeconds - prev.remainingSeconds);
      playChimeSound();
      const { nextState, xpEarned } = completeFocusSession(prev, elapsed);
      addXp(xpEarned);
      return nextState;
    });
  };

  const clearPomodoroHistory = () => {
    setPomodoro((prev) => ({
      ...prev,
      subjectStats: { ...INITIAL_SUBJECT_STATS },
      sessionHistory: [],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        activeSubjectId,
        setActiveSubjectId,
        user: user || (isGuestSession ? ({ uid: 'guest-session', email: 'guest@all9s.edu', displayName: nickname } as any) : null),
        isAuthLoading,
        loginWithGoogle,
        loginAsGuestSandbox,
        logout,
        nickname,
        setNickname,
        olGrade,
        setOlGrade,
        primarySubjectId,
        setPrimarySubject,
        hasCompletedOnboarding,
        completeOnboarding,
        resetToLevelOne,
        guiSettings,
        updateGuiSettings,
        toggleTheme,
        xp,
        addXp,
        streak,
        level,
        levelTitle,
        hearts,
        decrementHeart,
        refillHearts,
        leaderboardUsers: combinedLeaderboard,
        isOpencodeOpen,
        setIsOpencodeOpen,
        toggleOpencode,
        opencodeContextPrompt,
        triggerOpencodeWithPrompt,
        activeExamPaperId,
        setActiveExamPaperId,
        quests,
        claimQuestReward,
        completedCheckpoints,
        toggleCheckpointCompleted,
        pomodoro,
        startPomodoroTimer,
        pausePomodoroTimer,
        resetPomodoroTimer,
        setPomodoroMode,
        setPomodoroSubject,
        completeCurrentPomodoroSession,
        clearPomodoroHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
