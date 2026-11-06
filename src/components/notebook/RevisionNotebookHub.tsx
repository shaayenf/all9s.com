import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId } from '../../types';
import {
  RevisionNote,
  NoteComment,
  SEED_COMMUNITY_NOTES,
  SEED_NOTE_COMMENTS,
  createForkedNote,
  toggleNoteLike,
  extractFlashcardsFromNote,
} from '../../utils/notebook';
import { Flashcard } from '../../utils/flashcards';
import {
  BookOpen,
  Heart,
  MessageCircle,
  GitFork,
  Share2,
  Lock,
  Globe,
  Plus,
  Search,
  Sparkles,
  Layers,
  Send,
  Trash2,
  Edit3,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Download,
} from 'lucide-react';

interface RevisionNotebookHubProps {
  onStudyFlashcards?: (cards: Flashcard[]) => void;
}

export const RevisionNotebookHub: React.FC<RevisionNotebookHubProps> = ({ onStudyFlashcards }) => {
  const { user, nickname, olGrade, activeSubjectId, addXp } = useApp();

  const [activeTab, setActiveTab] = useState<'community' | 'my_notes' | 'create'>('community');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'liked'>('trending');

  // Community notes & comments state (seeded + persisted in localStorage)
  const [communityNotes, setCommunityNotes] = useState<RevisionNote[]>(() => {
    try {
      const saved = localStorage.getItem('all9s_community_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_COMMUNITY_NOTES;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, NoteComment[]>>(() => {
    try {
      const saved = localStorage.getItem('all9s_note_comments');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_NOTE_COMMENTS;
  });

  const [likedNoteIds, setLikedNoteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('all9s_liked_notes');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // User's personal notebook notes
  const [userNotes, setUserNotes] = useState<RevisionNote[]>(() => {
    try {
      const saved = localStorage.getItem('all9s_user_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'note-default-mine',
        userId: user?.uid || 'curr-user',
        authorNickname: nickname,
        authorGrade: olGrade,
        title: 'My Physics Kinematics & SUVAT Notes',
        subjectId: 'physics',
        topic: 'Forces & Motion',
        content: `### My Core Equations Checklist
- **Newton Second Law**: Resultant Force F = m * a.
- **Thinking Distance**: Factors include fatigue, reaction time, speed.
- **Braking Distance**: Factors include tire tread, brake condition, ice/water on road.

### Examiner Reminders
Always specify SI units (Newtons, m/s^2, kg). Never forget the direction when quoting velocity!`,
        tags: ['MyPersonalNotes', 'SUVAT', 'Physics'],
        isPublic: false,
        likesCount: 0,
        forkCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  // Editor form state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState<SubjectId>('physics');
  const [formTopic, setFormTopic] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Active expanded comments drawer
  const [expandedCommentNoteId, setExpandedCommentNoteId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Persist community notes
  useEffect(() => {
    try {
      localStorage.setItem('all9s_community_notes', JSON.stringify(communityNotes));
    } catch {
      // ignore
    }
  }, [communityNotes]);

  // Persist user personal notes
  useEffect(() => {
    try {
      localStorage.setItem('all9s_user_notes', JSON.stringify(userNotes));
    } catch {
      // ignore
    }
  }, [userNotes]);

  // Persist comments
  useEffect(() => {
    try {
      localStorage.setItem('all9s_note_comments', JSON.stringify(commentsMap));
    } catch {
      // ignore
    }
  }, [commentsMap]);

  // Persist liked notes
  useEffect(() => {
    try {
      localStorage.setItem('all9s_liked_notes', JSON.stringify(Array.from(likedNoteIds)));
    } catch {
      // ignore
    }
  }, [likedNoteIds]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleLike = (note: RevisionNote) => {
    const { isLiked, newLikesCount, updatedLikedSet } = toggleNoteLike(
      likedNoteIds,
      note.id,
      note.likesCount
    );

    setLikedNoteIds(updatedLikedSet);

    // Update community notes state
    setCommunityNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, likesCount: newLikesCount } : n))
    );

    // Update personal notes state if it's there
    setUserNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, likesCount: newLikesCount } : n))
    );

    if (isLiked) {
      addXp(10);
      showNotification('Liked note! +10 XP awarded');
    }
  };

  const handleForkNote = (sourceNote: RevisionNote) => {
    const forked = createForkedNote(
      sourceNote,
      user?.uid || 'curr-user',
      nickname,
      olGrade
    );

    setUserNotes((prev) => [forked, ...prev]);

    // Increment fork count on community note
    setCommunityNotes((prev) =>
      prev.map((n) => (n.id === sourceNote.id ? { ...n, forkCount: n.forkCount + 1 } : n))
    );

    addXp(25);
    showNotification(`Cloned "${sourceNote.title}" to your Notebook! You can now edit your own copy (+25 XP).`);
    setActiveTab('my_notes');
  };

  const handleAddComment = (noteId: string) => {
    if (!newCommentText.trim()) return;

    const newComment: NoteComment = {
      id: `comm-${Date.now()}`,
      noteId,
      userId: user?.uid || 'curr-user',
      authorNickname: nickname,
      text: newCommentText.trim(),
      createdAt: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [noteId]: [...(prev[noteId] || []), newComment],
    }));

    setNewCommentText('');
    addXp(15);
    showNotification('Comment posted to student community! +15 XP awarded');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tagList = formTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (editingNoteId) {
      // Editing existing note
      const updatedNotes = userNotes.map((n) => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            title: formTitle.trim(),
            subjectId: formSubject,
            topic: formTopic.trim() || 'General Revision',
            content: formContent.trim(),
            tags: tagList,
            isPublic: formIsPublic,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      setUserNotes(updatedNotes);

      // If it was public, also update in community notes
      if (formIsPublic) {
        setCommunityNotes((prev) => {
          const exists = prev.some((n) => n.id === editingNoteId);
          const edited = updatedNotes.find((n) => n.id === editingNoteId)!;
          return exists ? prev.map((n) => (n.id === editingNoteId ? edited : n)) : [edited, ...prev];
        });
      }

      showNotification('Note updated successfully!');
    } else {
      // Creating new note
      const newNote: RevisionNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: user?.uid || 'curr-user',
        authorNickname: nickname,
        authorGrade: olGrade,
        title: formTitle.trim(),
        subjectId: formSubject,
        topic: formTopic.trim() || 'General Revision',
        content: formContent.trim(),
        tags: tagList.length > 0 ? tagList : ['EdexcelRevision'],
        isPublic: formIsPublic,
        likesCount: 0,
        forkCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUserNotes((prev) => [newNote, ...prev]);

      if (formIsPublic) {
        setCommunityNotes((prev) => [newNote, ...prev]);
        addXp(50);
        showNotification('Published note to All9s student feed! +50 XP awarded');
      } else {
        addXp(25);
        showNotification('Saved private note to your notebook! +25 XP awarded');
      }
    }

    // Reset form
    setEditingNoteId(null);
    setFormTitle('');
    setFormTopic('');
    setFormContent('');
    setFormTags('');
    setActiveTab('my_notes');
  };

  const handleEditNote = (note: RevisionNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormSubject(note.subjectId);
    setFormTopic(note.topic);
    setFormContent(note.content);
    setFormTags(note.tags.join(', '));
    setFormIsPublic(note.isPublic);
    setActiveTab('create');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm('Delete this revision note from your notebook?')) return;
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
    setCommunityNotes((prev) => prev.filter((n) => n.id !== noteId));
    showNotification('Note deleted.');
  };

  const handleStudyNoteAsFlashcards = (note: RevisionNote) => {
    const extracted = extractFlashcardsFromNote(note.id, note.title, note.content, note.subjectId);
    if (onStudyFlashcards && extracted.length > 0) {
      onStudyFlashcards(extracted);
      showNotification(`Loaded ${extracted.length} flashcards extracted from "${note.title}"!`);
    }
  };

  // Filter & sort community notes
  const filteredCommunityNotes = communityNotes
    .filter((n) => {
      const matchesSubject = selectedSubject === 'all' || n.subjectId === selectedSubject;
      const matchesSearch =
        searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.likesCount + b.forkCount * 2 - (a.likesCount + a.forkCount * 2);
      if (sortBy === 'liked') return b.likesCount - a.likesCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const subjectList: { id: SubjectId | 'all'; label: string }[] = [
    { id: 'all', label: 'All Subjects' },
    { id: 'physics', label: 'Physics' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'biology', label: 'Biology' },
    { id: 'maths', label: 'Maths A' },
    { id: 'french', label: 'French' },
    { id: 'ict', label: 'ICT' },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-lg theme-accent-btn text-xs font-mono font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="opacity-80 hover:opacity-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Hub Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-xl border theme-border theme-subtle">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'theme-accent-btn font-bold shadow-xs'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Community Feed (Instagram-Style)</span>
          </button>

          <button
            onClick={() => setActiveTab('my_notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my_notes'
                ? 'theme-accent-btn font-bold shadow-xs'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Notebook ({userNotes.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingNoteId(null);
            setFormTitle('');
            setFormTopic('');
            setFormContent('');
            setFormTags('');
            setActiveTab('create');
          }}
          className="px-3.5 py-1.5 rounded-lg theme-accent-btn text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Revision Note</span>
        </button>
      </div>

      {/* TAB 1: COMMUNITY NOTES FEED (INSTAGRAM-STYLE) */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          {/* Filter, Search & Sort Bar */}
          <div className="p-3.5 rounded-xl border theme-border theme-card space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Subject Filters */}
              <div className="flex flex-wrap items-center gap-1">
                {subjectList.map((sub) => {
                  const isSelected = selectedSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                        isSelected
                          ? 'theme-accent-btn font-bold shadow-xs'
                          : 'theme-border theme-subtle theme-text-secondary hover:theme-text-primary border'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 text-xs font-mono theme-text-muted">
                <span className="text-[11px]">Sort:</span>
                <button
                  onClick={() => setSortBy('trending')}
                  className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                    sortBy === 'trending' ? 'theme-accent-btn font-bold' : 'theme-border theme-subtle'
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => setSortBy('liked')}
                  className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                    sortBy === 'liked' ? 'theme-accent-btn font-bold' : 'theme-border theme-subtle'
                  }`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                    sortBy === 'recent' ? 'theme-accent-btn font-bold' : 'theme-border theme-subtle'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shared student notes by title, topic, or tags (e.g. #Forces, SUVAT, Half-Equations)..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* Feed Grid of Student Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunityNotes.map((note) => {
              const isLiked = likedNoteIds.has(note.id);
              const comments = commentsMap[note.id] || [];
              const isCommentExpanded = expandedCommentNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className="rounded-xl border theme-border theme-card overflow-hidden flex flex-col justify-between shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  {/* Card Header (Author & Metadata) */}
                  <div className="p-4 border-b theme-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border theme-border theme-subtle flex items-center justify-center text-xs font-mono font-bold theme-text-primary">
                        {note.authorNickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold theme-text-primary">
                            {note.authorNickname}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono border theme-border theme-subtle theme-text-secondary">
                            {note.authorGrade}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono theme-text-muted">
                          {note.subjectId.toUpperCase()} · {note.topic}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border theme-border theme-subtle theme-text-secondary uppercase">
                      {note.subjectId}
                    </span>
                  </div>

                  {/* Note Body Content */}
                  <div className="p-4 space-y-3 flex-1 font-sans">
                    <h3 className="font-bold text-sm sm:text-base theme-text-primary tracking-tight">
                      {note.title}
                    </h3>

                    {/* Markdown snippet container */}
                    <div className="p-3 rounded-lg border theme-border theme-subtle text-xs leading-relaxed theme-text-primary font-mono whitespace-pre-wrap max-h-48 overflow-y-auto selection:bg-zinc-200 dark:selection:bg-zinc-800">
                      {note.content}
                    </div>

                    {/* Tag chips */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono border theme-border theme-card theme-text-secondary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Action Bar (Like, Comment, Fork, Study) */}
                  <div className="px-4 py-3 border-t theme-border theme-subtle flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      {/* Instagram Like Button */}
                      <button
                        onClick={() => handleToggleLike(note)}
                        aria-label="Like Note"
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                          isLiked
                            ? 'text-red-500 font-bold'
                            : 'theme-text-muted hover:theme-text-primary'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{note.likesCount}</span>
                      </button>

                      {/* Comment Thread Toggle */}
                      <button
                        onClick={() =>
                          setExpandedCommentNoteId(isCommentExpanded ? null : note.id)
                        }
                        aria-label="View Comments"
                        className="flex items-center gap-1 theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{comments.length}</span>
                      </button>

                      {/* Fork / Clone Button */}
                      <button
                        onClick={() => handleForkNote(note)}
                        title="Download & Fork editable copy to My Notebook (+25 XP)"
                        className="flex items-center gap-1 theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
                      >
                        <GitFork className="w-4 h-4" />
                        <span>{note.forkCount} forks</span>
                      </button>
                    </div>

                    {/* Study as Flashcards Button */}
                    <button
                      onClick={() => handleStudyNoteAsFlashcards(note)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded theme-accent-btn text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                      title="Convert this note into interactive flashcards"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Study Deck</span>
                    </button>
                  </div>

                  {/* Expandable Comment Section */}
                  {isCommentExpanded && (
                    <div className="p-4 border-t theme-border theme-card space-y-3 font-sans animate-fadeIn">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider theme-text-muted">
                        Student Comments ({comments.length})
                      </h4>

                      {/* Comment list */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {comments.length === 0 ? (
                          <p className="text-xs theme-text-muted italic">
                            No comments yet. Be the first to share feedback or ask a question!
                          </p>
                        ) : (
                          comments.map((c) => (
                            <div
                              key={c.id}
                              className="p-2 rounded border theme-border theme-subtle text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono theme-text-muted">
                                <span className="font-bold theme-text-primary">{c.authorNickname}</span>
                                <span>{c.createdAt}</span>
                              </div>
                              <p className="theme-text-primary">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(note.id);
                          }}
                          placeholder={`Comment as ${nickname}...`}
                          className="flex-1 px-3 py-1.5 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
                        />
                        <button
                          onClick={() => handleAddComment(note.id)}
                          className="px-3 py-1.5 rounded-lg theme-accent-btn text-xs font-mono font-medium cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY PERSONAL NOTEBOOK */}
      {activeTab === 'my_notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border theme-border theme-card text-xs font-mono">
            <div>
              <span className="font-bold theme-text-primary">Candidate Notebook: {nickname}</span>
              <span className="block text-[11px] theme-text-muted">
                Create personal notes, fork community templates, and turn notes into flashcards.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 rounded-md theme-accent-btn text-xs font-bold cursor-pointer"
            >
              + Create Note
            </button>
          </div>

          {userNotes.length === 0 ? (
            <div className="p-8 text-center rounded-xl border theme-border theme-card space-y-3">
              <BookOpen className="w-8 h-8 mx-auto opacity-50 theme-text-muted" />
              <h3 className="font-mono text-sm font-bold theme-text-primary">Your Notebook is Empty</h3>
              <p className="text-xs theme-text-muted max-w-md mx-auto">
                Write your own revision summary, or clone trending notes from the Community Feed to build your personal formula and definition sheets.
              </p>
              <button
                onClick={() => setActiveTab('community')}
                className="px-4 py-2 rounded-md theme-accent-btn text-xs font-mono font-medium cursor-pointer"
              >
                Explore Community Notes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border theme-border theme-card p-4 space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border theme-border theme-subtle theme-text-primary">
                        {note.subjectId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {note.isPublic ? (
                          <span className="flex items-center gap-1 text-[10px] theme-accent-text font-bold">
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] theme-text-muted font-bold">
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        )}
                        {note.forkSourceAuthor && (
                          <span className="text-[10px] theme-text-muted">
                            (Forked from {note.forkSourceAuthor})
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-base theme-text-primary">{note.title}</h3>
                    <p className="text-xs theme-text-muted font-mono">{note.topic}</p>

                    <div className="p-3 rounded-lg border theme-border theme-subtle text-xs leading-relaxed theme-text-primary font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {note.content}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono border theme-border theme-subtle theme-text-secondary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions for personal note */}
                  <div className="pt-3 border-t theme-border flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1.5 rounded border theme-border theme-subtle hover:theme-card theme-text-primary transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded border theme-border theme-subtle hover:text-red-500 theme-text-muted transition-colors cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleStudyNoteAsFlashcards(note)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded theme-accent-btn text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Study as Flashcards</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATE / EDIT NOTE (GEMINI NOTEBOOK STYLE) */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveNote} className="p-5 rounded-xl border theme-border theme-card space-y-4">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <div>
              <h3 className="font-mono text-sm font-bold theme-text-primary">
                {editingNoteId ? 'Edit Revision Note' : 'Create Gemini-Style Revision Note'}
              </h3>
              <p className="text-xs theme-text-muted">
                Synthesize high-yield formulas, mark-scheme definitions, and examiner techniques
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('my_notes')}
              className="text-xs font-mono theme-text-muted hover:theme-text-primary underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold theme-text-primary">Note Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Newton's Laws & Kinematics Mastery Sheet"
                className="w-full px-3 py-2 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
              />
            </div>

            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold theme-text-primary">Edexcel Subject</label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value as SubjectId)}
                className="w-full px-3 py-2 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-mono cursor-pointer"
              >
                <option value="physics">Physics (4PH1)</option>
                <option value="chemistry">Chemistry (4CH1)</option>
                <option value="biology">Biology (4BI1)</option>
                <option value="maths">Mathematics A (4MA1)</option>
                <option value="french">French (4FR1)</option>
                <option value="ict">ICT (4IT1)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Topic / Spec Code */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold theme-text-primary">Topic / Spec Code</label>
              <input
                type="text"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="e.g. Section 1: Forces & Motion (1.12)"
                className="w-full px-3 py-2 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold theme-text-primary">Tags (comma-separated)</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. Paper1, Formulas, Grade9Target"
                className="w-full px-3 py-2 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* Note Content Textarea with Helper Buttons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold theme-text-primary">
                Revision Notes Content (Supports Term: Definition for Flashcard Extraction)
              </label>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() =>
                    setFormContent(
                      (prev) =>
                        prev +
                        '\n- **Term**: Mark-scheme precise definition or equation breakdown here.'
                    )
                  }
                  className="px-2 py-0.5 rounded border theme-border theme-subtle hover:theme-card cursor-pointer"
                >
                  + Add Term Template
                </button>
              </div>
            </div>

            <textarea
              required
              rows={8}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder={`### Core Revision Insights\n- **Newton Second Law**: Resultant force F = m * a where acceleration is proportional to net force.\n- **Hooke Law**: Force is directly proportional to extension provided elastic limit is not exceeded.\n\n### Common Examiner Traps\nRemember that stopping distance combines both thinking and braking components!`}
              className="w-full p-3 rounded-lg border theme-border theme-input text-xs theme-text-primary focus:outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Privacy & Social Sharing Options */}
          <div className="p-3.5 rounded-lg border theme-border theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sharePublicly"
                checked={formIsPublic}
                onChange={(e) => setFormIsPublic(e.target.checked)}
                className="rounded border theme-border cursor-pointer w-4 h-4"
              />
              <label htmlFor="sharePublicly" className="cursor-pointer">
                <span className="font-bold theme-text-primary block">
                  Share with All9s Student Community (Public)
                </span>
                <span className="text-[11px] theme-text-muted">
                  Other students can view, like, comment, and fork copies to their own notebooks (+50 XP).
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="py-2 px-5 rounded-lg theme-accent-btn text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{editingNoteId ? 'Save Changes' : formIsPublic ? 'Publish to Community' : 'Save Private Note'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
