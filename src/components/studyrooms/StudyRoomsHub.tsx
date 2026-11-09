import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyRoomInfo, StudyChatMessage, SubjectId } from '../../types';
import { DEFAULT_STUDY_ROOMS, INITIAL_STUDY_MESSAGES } from '../../data/studyRoomsData';
import { SUBJECTS } from '../../data/mockData';
import { StudentDirectoryModal } from '../profile/StudentDirectoryModal';
import { formatTimerSeconds } from '../../utils/pomodoro';
import {
  Video,
  Users,
  MessageSquare,
  Plus,
  Send,
  Image as ImageIcon,
  Camera,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Search,
  BookOpen,
  ArrowLeft,
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { OFFICIAL_PAPERLORDS_IGCSE_URL } from '../../utils/paperlords';

export const StudyRoomsHub: React.FC = () => {
  const { user, nickname, level, xp, addXp, activeSubjectId, setActiveView } = useApp();

  // Rooms state (persisted in localStorage with fallback to default rooms)
  const [rooms, setRooms] = useState<StudyRoomInfo[]>(() => {
    try {
      const saved = localStorage.getItem('all9s_study_rooms');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_STUDY_ROOMS;
  });

  // Active selected room
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Chat messages per room
  const [messagesMap, setMessagesMap] = useState<Record<string, StudyChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('all9s_study_messages');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STUDY_MESSAGES;
  });

  // New message input & photo upload
  const [inputMessage, setInputMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Room filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create room modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState<SubjectId>(activeSubjectId || 'physics');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomMeetLink, setNewRoomMeetLink] = useState('');

  // Edit Google Meet modal in room
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [inputMeetLink, setInputMeetLink] = useState('');

  // Friend search modal trigger
  const [isFriendSearchOpen, setIsFriendSearchOpen] = useState(false);

  // Synced local timer simulation for active room
  const [roomTimerSeconds, setRoomTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const activeRoom = rooms.find((r) => r.roomId === activeRoomId) || null;
  const currentMessages = activeRoomId ? messagesMap[activeRoomId] || [] : [];

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentMessages, activeRoomId]);

  // Pomodoro timer tick for active room
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRoomId && isTimerRunning) {
      interval = setInterval(() => {
        setRoomTimerSeconds((prev) => {
          if (prev <= 1) {
            addXp(100); // award focus XP
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRoomId, isTimerRunning, addXp]);

  const handleSelectRoom = (room: StudyRoomInfo) => {
    setActiveRoomId(room.roomId);
    setRoomTimerSeconds(room.pomodoroRemainingSeconds || 25 * 60);
    setIsTimerRunning(room.isPomodoroActive !== false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: StudyRoomInfo = {
      roomId: `room-custom-${Date.now()}`,
      subjectId: newRoomSubject,
      name: newRoomName.trim(),
      topic: newRoomTopic.trim() || 'General Syllabus Revision & Problem Solving',
      createdBy: user?.uid || 'guest-user',
      creatorNickname: nickname,
      activeParticipants: [
        {
          userId: user?.uid || 'guest-user',
          nickname: nickname,
          avatarSeed: nickname.slice(0, 2).toUpperCase(),
          level: level,
          currentFocusTopic: newRoomTopic.trim() || 'Spec Review',
        },
      ],
      meetLink: newRoomMeetLink.trim() || null,
      pomodoroRemainingSeconds: 25 * 60,
      isPomodoroActive: true,
      createdAt: new Date().toISOString(),
    };

    const nextRooms = [newRoom, ...rooms];
    setRooms(nextRooms);
    localStorage.setItem('all9s_study_rooms', JSON.stringify(nextRooms));

    // Initialize messages
    const welcomeMsg: StudyChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: newRoom.roomId,
      userId: user?.uid || 'guest-user',
      nickname: nickname,
      avatarSeed: nickname.slice(0, 2).toUpperCase(),
      text: `Welcome to ${newRoom.name}! I started this study room for ${newRoom.topic}. Feel free to drop questions, mark schemes, or pictures of your working!`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = { ...messagesMap, [newRoom.roomId]: [welcomeMsg] };
    setMessagesMap(nextMessages);
    localStorage.setItem('all9s_study_messages', JSON.stringify(nextMessages));

    setIsCreateModalOpen(false);
    setNewRoomName('');
    setNewRoomTopic('');
    setNewRoomMeetLink('');
    setActiveRoomId(newRoom.roomId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || (!inputMessage.trim() && !attachmentPreview)) return;

    const newMsg: StudyChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: activeRoomId,
      userId: user?.uid || 'guest-user',
      nickname: nickname,
      avatarSeed: nickname.slice(0, 2).toUpperCase(),
      text: inputMessage.trim() || (attachmentPreview ? 'Shared photo of working for review:' : ''),
      attachmentUrl: attachmentPreview || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextList = [...currentMessages, newMsg];
    const nextMap = { ...messagesMap, [activeRoomId]: nextList };
    setMessagesMap(nextMap);
    localStorage.setItem('all9s_study_messages', JSON.stringify(nextMap));

    setInputMessage('');
    setAttachmentPreview(null);
    addXp(25); // Small XP reward for participation
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        setAttachmentPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMeetLink = () => {
    if (!activeRoomId) return;
    const cleanLink = inputMeetLink.trim() || 'https://meet.google.com/new';
    const nextRooms = rooms.map((r) => {
      if (r.roomId === activeRoomId) {
        return { ...r, meetLink: cleanLink };
      }
      return r;
    });
    setRooms(nextRooms);
    localStorage.setItem('all9s_study_rooms', JSON.stringify(nextRooms));

    // Post announcement in chat
    const alertMsg: StudyChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: activeRoomId,
      userId: user?.uid || 'guest-user',
      nickname: nickname,
      avatarSeed: nickname.slice(0, 2).toUpperCase(),
      text: `🎥 Google Meet link scheduled/updated: ${cleanLink}. Click the "Join Google Meet" button above to jump on the call!`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = { ...messagesMap, [activeRoomId]: [...(messagesMap[activeRoomId] || []), alertMsg] };
    setMessagesMap(nextMessages);
    localStorage.setItem('all9s_study_messages', JSON.stringify(nextMessages));

    setIsMeetModalOpen(false);
    setInputMeetLink('');
  };

  const filteredRooms = rooms.filter((room) => {
    if (selectedSubjectFilter !== 'all' && room.subjectId !== selectedSubjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchTopic = room.topic.toLowerCase().includes(q);
      if (!matchName && !matchTopic) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* 1. ROOM BROWSER VIEW (when no room is active) */}
      {!activeRoom ? (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="rounded-xl border theme-border theme-card p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs theme-text-muted">
                  <span className="px-2 py-0.5 rounded border theme-border theme-subtle font-semibold uppercase tracking-wider">
                    Peer Study Rooms
                  </span>
                  <span>·</span>
                  <span className="font-bold theme-text-primary">Collaborative Revision Hub</span>
                  <span>·</span>
                  <span>Google Meet Sync</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight theme-text-primary flex items-center gap-2.5">
                  <Video className="w-7 h-7 theme-accent-text shrink-0" />
                  <span>Subject Study Rooms</span>
                </h1>

                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-sans max-w-2xl">
                  Revise alongside friends in dedicated subject study rooms. Work through past paper questions together, share photos of your working in the discussion chat, and join voice/video sessions with shared Google Meet links.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={OFFICIAL_PAPERLORDS_IGCSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer shadow-xs"
                  title="Browse Official PaperLords IGCSE Repository"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PaperLords Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setIsFriendSearchOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border theme-border theme-subtle text-xs font-semibold theme-text-primary hover:opacity-100 opacity-90 cursor-pointer shadow-xs"
                >
                  <Users className="w-4 h-4" />
                  <span>Find Friends</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg theme-accent-btn text-xs font-bold cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Study Room</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Subject Tabs Filter */}
          <div className="rounded-xl border theme-border theme-card p-4 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study room by name, syllabus topic (e.g. Kinematics, Maclaurin, Market Failure)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                  selectedSubjectFilter === 'all'
                    ? 'theme-accent-btn font-bold shadow-xs'
                    : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                }`}
              >
                All Subjects ({rooms.length})
              </button>

              {SUBJECTS.map((sub) => {
                const count = rooms.filter((r) => r.subjectId === sub.id).length;
                if (count === 0 && selectedSubjectFilter !== sub.id) return null;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectFilter(sub.id)}
                    className={`px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedSubjectFilter === sub.id
                        ? 'theme-accent-btn font-bold shadow-xs'
                        : 'border theme-border theme-subtle theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const subInfo = SUBJECTS.find((s) => s.id === room.subjectId);
              const hasMeet = Boolean(room.meetLink);

              return (
                <div
                  key={room.roomId}
                  className="rounded-xl border theme-border theme-card p-5 hover:border-zinc-500 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] theme-text-muted">
                          <span className="font-bold theme-text-primary">{subInfo?.code || 'IGCSE'}</span>
                          <span>·</span>
                          <span>{subInfo?.department || 'Subject'}</span>
                        </div>
                        <h3 className="text-base font-bold theme-text-primary tracking-tight">
                          {room.name}
                        </h3>
                      </div>

                      {hasMeet && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold shrink-0">
                          <Video className="w-3 h-3" />
                          <span>Meet Live</span>
                        </span>
                      )}
                    </div>

                    {/* Topic */}
                    <div className="p-2.5 rounded border theme-border theme-subtle text-xs space-y-1">
                      <div className="text-[10px] theme-text-muted uppercase tracking-wider font-semibold">
                        Syllabus Focus:
                      </div>
                      <p className="theme-text-secondary font-sans leading-snug line-clamp-2">
                        {room.topic}
                      </p>
                    </div>

                    {/* Participants & Host */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {room.activeParticipants.slice(0, 3).map((p, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full theme-accent-btn flex items-center justify-center text-[10px] font-bold border border-zinc-950"
                              title={p.nickname}
                            >
                              {p.avatarSeed}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] theme-text-muted">
                          {room.activeParticipants.length} Studying
                        </span>
                      </div>

                      <div className="text-[10px] theme-text-muted">
                        Host: <span className="theme-text-primary font-semibold">{room.creatorNickname}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-4 pt-3 border-t theme-border flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] theme-text-secondary">
                      <Timer className="w-3.5 h-3.5" />
                      <span>Synced 25m Focus</span>
                    </div>

                    <button
                      onClick={() => handleSelectRoom(room)}
                      className="px-4 py-1.5 rounded theme-accent-btn text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Enter Room →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-16 rounded-xl border theme-border theme-card space-y-3">
              <Video className="w-10 h-10 mx-auto theme-text-muted opacity-40" />
              <div className="text-sm font-bold theme-text-primary">No Study Rooms Found</div>
              <p className="text-xs theme-text-muted max-w-sm mx-auto font-sans">
                No active rooms matched your query. Click &quot;Create Study Room&quot; to start the first room for this subject!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded theme-accent-btn text-xs font-bold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Study Room Now</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 2. INSIDE ACTIVE STUDY ROOM VIEW */
        <div className="space-y-5">
          {/* Room Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b theme-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveRoomId(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border theme-border theme-subtle text-xs theme-text-secondary hover:theme-text-primary cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Rooms</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold theme-text-primary tracking-tight">
                    {activeRoom.name}
                  </h2>
                  <span className="text-[10px] px-2 py-0.2 rounded border theme-border theme-subtle font-bold">
                    {activeRoom.subjectId.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs theme-text-muted">
                  Focus: <span className="theme-text-secondary font-sans">{activeRoom.topic}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFriendSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border theme-border theme-subtle text-xs font-semibold theme-text-primary cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Invite Friend</span>
              </button>
            </div>
          </div>

          {/* Google Meet Scheduled / Active Banner */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <span>Google Meet Video & Audio Room</span>
                  {activeRoom.meetLink && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 text-[10px]">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-200/80 font-sans mt-0.5">
                  {activeRoom.meetLink
                    ? `Live call is active for this study room. Click below to join your study buddies on Google Meet!`
                    : `No Google Meet link scheduled yet. Schedule one now so everyone in this room can talk and screenshare.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {activeRoom.meetLink ? (
                <>
                  <a
                    href={activeRoom.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-xs hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Google Meet</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  <button
                    onClick={() => {
                      setInputMeetLink(activeRoom.meetLink || '');
                      setIsMeetModalOpen(true);
                    }}
                    className="px-2.5 py-2 rounded-lg border border-blue-500/40 text-blue-300 hover:text-white text-xs cursor-pointer"
                  >
                    Change Link
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setInputMeetLink('https://meet.google.com/new');
                    setIsMeetModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Google Meet</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Room Layout: Left (Study Timer & Participants) | Right (Interactive Discussion Chat) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Group Pomodoro & Room Details */}
            <div className="lg:col-span-4 space-y-4">
              {/* Group Pomodoro Timer Box */}
              <div className="rounded-xl border theme-border theme-card p-5 space-y-4 shadow-xs text-center">
                <div className="flex items-center justify-between text-xs theme-text-muted pb-2 border-b theme-border">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 theme-accent-text" />
                    <span>Synchronized Focus</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.2 rounded theme-subtle font-semibold">
                    {isTimerRunning ? 'Studying' : 'Paused'}
                  </span>
                </div>

                <div className="text-4xl font-bold theme-text-primary tracking-tight font-mono py-1 tabular-nums">
                  {formatTimerSeconds(roomTimerSeconds)}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded theme-accent-btn text-xs font-bold cursor-pointer shadow-xs"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTimerRunning ? 'Pause Session' : 'Start Focus'}</span>
                  </button>

                  <button
                    onClick={() => setRoomTimerSeconds(25 * 60)}
                    className="p-1.5 rounded border theme-border theme-subtle theme-text-secondary hover:theme-text-primary cursor-pointer"
                    title="Reset to 25m"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] theme-text-muted font-sans">
                  Complete 25m focus together to earn <span className="font-bold text-amber-400">+100 XP</span>!
                </div>
              </div>

              {/* Study Buddies In Room */}
              <div className="rounded-xl border theme-border theme-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <div className="flex items-center gap-2 text-xs font-bold theme-text-primary">
                    <Users className="w-4 h-4 theme-accent-text" />
                    <span>Study Buddies Online ({activeRoom.activeParticipants.length + 1})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Current User */}
                  <div className="p-2.5 rounded-lg border theme-border bg-zinc-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full theme-accent-btn flex items-center justify-center font-bold text-xs shadow-xs">
                        {nickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold theme-text-primary flex items-center gap-1">
                          <span>{nickname}</span>
                          <span className="text-[9px] px-1 rounded theme-accent-btn">You</span>
                        </div>
                        <div className="text-[10px] theme-text-muted">Focusing on {activeRoom.topic.slice(0, 20)}...</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold theme-text-secondary">Lv.{level}</span>
                  </div>

                  {/* Room participants */}
                  {activeRoom.activeParticipants.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border theme-border theme-subtle flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs theme-text-primary">
                          {p.avatarSeed}
                        </div>
                        <div>
                          <div className="font-bold theme-text-primary">{p.nickname}</div>
                          <div className="text-[10px] theme-text-muted truncate max-w-[140px]">
                            {p.currentFocusTopic || 'Active in room'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold theme-text-muted">Lv.{p.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PaperLords Subject Past Papers Widget */}
              <div className="rounded-xl border theme-border theme-card p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <div className="flex items-center gap-2 text-xs font-bold theme-text-primary">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>PaperLords Repository</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">
                    {activeRoom.subjectId.toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] font-sans theme-text-secondary leading-relaxed">
                  Official Pearson Edexcel past papers repository for {activeRoom.name}. Download session papers or mark solutions together.
                </p>

                <div className="space-y-2 pt-1">
                  <a
                    href={OFFICIAL_PAPERLORDS_IGCSE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg theme-accent-btn text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Open PaperLords IGCSE repository in clean new tab"
                  >
                    <span>Browse PaperLords Archive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setActiveView('pastpapers')}
                    className="w-full py-2 px-3 rounded-lg border theme-border theme-subtle text-xs font-semibold theme-text-primary hover:theme-accent-btn transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Marking Companion</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Discussion Chat & Working Pictures */}
            <div className="lg:col-span-8 rounded-xl border theme-border theme-card flex flex-col h-[600px] shadow-xs overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b theme-border flex items-center justify-between bg-zinc-950/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 theme-accent-text" />
                  <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider">
                    Room Discussion & Mark Scheme Debates
                  </h3>
                </div>
                <span className="text-[11px] theme-text-muted">
                  {currentMessages.length} messages
                </span>
              </div>

              {/* Chat Messages Body */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20"
              >
                {currentMessages.map((msg) => {
                  const isMe = msg.nickname === nickname;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full theme-accent-btn flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {msg.avatarSeed}
                      </div>

                      <div className={`max-w-[80%] space-y-1.5 ${isMe ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 text-[10px] theme-text-muted">
                          <span className="font-bold theme-text-primary">{msg.nickname}</span>
                          <span>·</span>
                          <span>{msg.createdAt}</span>
                        </div>

                        {/* Text bubble */}
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed font-sans text-left ${
                            isMe
                              ? 'theme-accent-btn text-white'
                              : 'rounded-tl-none border theme-border theme-subtle theme-text-primary'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Image attachment if student uploaded working */}
                        {msg.attachmentUrl && (
                          <div className="mt-2 rounded-lg border theme-border overflow-hidden bg-black/60 p-1">
                            <img
                              src={msg.attachmentUrl}
                              alt="Handwritten working"
                              className="max-h-56 max-w-full rounded object-contain mx-auto"
                            />
                            <div className="text-[10px] theme-text-muted text-center pt-1 font-mono">
                              📷 Handwritten Working Photo
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Image Preview if chosen */}
              {attachmentPreview && (
                <div className="p-3 border-t theme-border bg-zinc-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={attachmentPreview}
                      alt="Attachment Preview"
                      className="w-12 h-12 rounded object-cover border theme-border"
                    />
                    <div className="text-xs">
                      <div className="font-bold theme-text-primary">Photo ready to send</div>
                      <div className="text-[10px] theme-text-muted">Handwritten working / calculation snapshot</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachmentPreview(null)}
                    className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t theme-border bg-zinc-950/40 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg border theme-border theme-subtle text-zinc-300 hover:text-white hover:border-zinc-500 cursor-pointer"
                  title="Upload picture of handwritten paper / working"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question, discuss mark schemes, or share equations..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !attachmentPreview}
                  className="p-2 rounded-lg theme-accent-btn disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl border theme-border theme-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 theme-accent-text" />
                <h3 className="text-base font-bold theme-text-primary">Create New Study Room</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold theme-text-primary mb-1">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Pure Maths Derivation Den, Physics Paper 1P Sprint"
                  maxLength={64}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold theme-text-primary mb-1">Subject (11A Timetable)</label>
                <select
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value as SubjectId)}
                  className="w-full px-3.5 py-2 rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) — {sub.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold theme-text-primary mb-1">Syllabus Topic</label>
                <input
                  type="text"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  placeholder="e.g. SUVAT Kinematics, Equilibrium & Le Chatelier, Maclaurin Series"
                  maxLength={100}
                  className="w-full px-3.5 py-2 rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold theme-text-primary mb-1">
                  Google Meet Link (Optional)
                </label>
                <input
                  type="url"
                  value={newRoomMeetLink}
                  onChange={(e) => setNewRoomMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or leave empty to schedule later"
                  className="w-full px-3.5 py-2 rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                />
                <p className="text-[11px] theme-text-muted mt-1">
                  You can also click &quot;Schedule Google Meet&quot; inside the room at any time.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded border theme-border theme-subtle theme-text-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-5 py-2 rounded theme-accent-btn font-bold disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Launch Study Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE GOOGLE MEET MODAL */}
      {isMeetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-xl border theme-border theme-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold theme-text-primary">Schedule Google Meet</h3>
              </div>
              <button
                onClick={() => setIsMeetModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs theme-text-secondary leading-relaxed font-sans">
              Enter your Google Meet meeting link URL. It will be immediately pinned to the top of the room so all your study buddies can join with one click.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold theme-text-primary mb-1">
                  Meeting Link URL
                </label>
                <input
                  type="url"
                  value={inputMeetLink}
                  onChange={(e) => setInputMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border theme-border theme-input theme-text-primary focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/10 text-[11px] theme-text-secondary font-sans flex items-center justify-between">
                <span>Need to generate an instant link?</span>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open meet.new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMeetModalOpen(false)}
                className="px-4 py-1.5 rounded border theme-border theme-subtle text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeetLink}
                className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Save & Broadcast Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FRIEND DIRECTORY MODAL */}
      <StudentDirectoryModal
        isOpen={isFriendSearchOpen}
        onClose={() => setIsFriendSearchOpen(false)}
      />
    </div>
  );
};
