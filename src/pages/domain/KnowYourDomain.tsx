// =============================================
// SUB-PAGE 3: Know Your Domain
// Interactive Competency & Interest Matrix
// Dual-Axis Career Mapping System
// APIs: Optional Gemini for AI advice
// =============================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Palette,
    BarChart3,
    Bot,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    Target,
    Lightbulb,
    CheckCircle2,
    Zap,
    BookOpen,
    Loader2,
    RotateCcw,
    Play,
    ChevronDown,
    ExternalLink,
    Check,
} from 'lucide-react';
import { fetchGeminiInsight, fetchYouTubeVideos, type YouTubeVideo } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

// =============================================
// DATA
// =============================================
interface ProblemType {
    id: string;
    label: string;
    icon: any;
    color: string;
    accent: string;
    description: string;
    domains: string[];
    skills: string[];
    roles: string[];
    roadmap: string[];
    roadmapVideos: string[];  // YouTube search queries per step
}

const PROBLEM_TYPES: ProblemType[] = [
    {
        id: 'systems',
        label: 'I like making systems faster and efficient.',
        icon: Settings,
        color: 'from-blue-500 to-indigo-600',
        accent: 'blue',
        description: 'You think in terms of performance, scalability, and elegance. You love optimizing things.',
        domains: ['Backend Development', 'Systems Programming', 'DevOps', 'Cloud Computing', 'Database Engineering'],
        skills: ['Go / Rust / C++', 'Docker & Kubernetes', 'Linux & Networking', 'CI/CD Pipelines', 'System Design'],
        roles: ['Backend Engineer', 'DevOps Engineer', 'SRE', 'Platform Engineer', 'Systems Architect'],
        roadmap: [
            'Learn a systems language (Go, Rust, or C++)',
            'Master Linux fundamentals & shell scripting',
            'Build a REST/gRPC API from scratch',
            'Learn Docker, then Kubernetes',
            'Practice system design (Grokking System Design)',
            'Contribute to open-source infrastructure projects',
        ],
        roadmapVideos: [
            'Go programming language full course beginners',
            'Linux command line tutorial beginners',
            'Build REST API Go from scratch',
            'Docker and Kubernetes full course',
            'System design interview concepts',
            'How to contribute to open source projects',
        ],
    },
    {
        id: 'design',
        label: 'I care about how users interact with technology.',
        icon: Palette,
        color: 'from-pink-500 to-rose-600',
        accent: 'pink',
        description: 'You notice when buttons are 2px off. Users\' experience is your obsession.',
        domains: ['Frontend Development', 'UI/UX Design', 'Mobile Development', 'Product Design', 'Accessibility'],
        skills: ['React / Vue / Svelte', 'Figma & Design Systems', 'CSS Animations', 'Mobile (React Native / Flutter)', 'User Research'],
        roles: ['Frontend Engineer', 'UI/UX Designer', 'Product Designer', 'Mobile Developer', 'Design Engineer'],
        roadmap: [
            'Master HTML, CSS, and JavaScript fundamentals',
            'Learn React and build 3 real projects',
            'Study design principles (Refactoring UI)',
            'Learn Figma and create a design system',
            'Build a portfolio website',
            'Learn accessibility (WCAG) standards',
        ],
        roadmapVideos: [
            'HTML CSS JavaScript full course beginners 2024',
            'React JS full course project tutorial',
            'UI UX design principles beginners',
            'Figma tutorial design system from scratch',
            'Build portfolio website React tutorial',
            'Web accessibility WCAG tutorial developers',
        ],
    },
    {
        id: 'data',
        label: 'I enjoy discovering patterns in data.',
        icon: BarChart3,
        color: 'from-emerald-500 to-teal-600',
        accent: 'emerald',
        description: 'Numbers speak to you. You see stories hidden in spreadsheets and datasets.',
        domains: ['Machine Learning', 'Data Science', 'Data Engineering', 'Business Intelligence', 'NLP'],
        skills: ['Python & NumPy', 'TensorFlow / PyTorch', 'SQL & Data Pipelines', 'Statistics & Probability', 'Data Visualization'],
        roles: ['Data Scientist', 'ML Engineer', 'Data Analyst', 'AI Researcher', 'BI Developer'],
        roadmap: [
            'Master Python and statistics fundamentals',
            'Learn pandas, NumPy, and matplotlib',
            'Take Andrew Ng\'s ML course',
            'Build 3 ML projects with real datasets',
            'Learn SQL and data engineering basics',
            'Participate in Kaggle competitions',
        ],
        roadmapVideos: [
            'Python for data science full course',
            'Pandas NumPy matplotlib tutorial',
            'Machine learning Andrew Ng course overview',
            'Machine learning project tutorial Python',
            'SQL for data engineering tutorial',
            'Kaggle competition walkthrough beginners',
        ],
    },
    {
        id: 'hardware',
        label: 'I want code to control real-world devices.',
        icon: Bot,
        color: 'from-amber-500 to-orange-600',
        accent: 'amber',
        description: 'You want your code to move motors, blink LEDs, and interact with the physical world.',
        domains: ['Robotics', 'IoT', 'Embedded Systems', 'Computer Vision', 'VLSI Design'],
        skills: ['C/C++ & Arduino', 'Raspberry Pi & ESP32', 'ROS (Robot OS)', 'Sensor Integration', 'PCB Design'],
        roles: ['Embedded Engineer', 'Robotics Engineer', 'IoT Developer', 'Firmware Developer', 'Hardware Engineer'],
        roadmap: [
            'Learn C/C++ for embedded programming',
            'Get an Arduino Uno — build 5 projects',
            'Move to Raspberry Pi and learn Linux',
            'Study ROS for robotics',
            'Build an IoT project (sensor → cloud → dashboard)',
            'Learn basic electronics and PCB design',
        ],
        roadmapVideos: [
            'C++ embedded programming tutorial',
            'Arduino projects for beginners tutorial',
            'Raspberry Pi beginner tutorial',
            'ROS robot operating system tutorial',
            'IoT project sensor to cloud tutorial',
            'Electronics PCB design beginners',
        ],
    },
];

interface InterestLevel {
    domain: string;
    skill: number;     // 1-5: how good are you
    interest: number;  // 1-5: how interested are you
}

// =============================================
// MAIN COMPONENT
// =============================================
const KnowYourDomain = () => {
    const [phase, setPhase] = useState<'audit' | 'result'>('audit');
    const [selectedType, setSelectedType] = useState<ProblemType | null>(null);
    const [interestLevels, setInterestLevels] = useState<InterestLevel[]>([]);
    const [geminiAdvice, setGeminiAdvice] = useState('');
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [stepVideos, setStepVideos] = useState<Record<number, YouTubeVideo | null>>({});
    const [loadingVideo, setLoadingVideo] = useState<number | null>(null);

    // Load completed steps from localStorage
    useEffect(() => {
        if (selectedType) {
            const saved = localStorage.getItem(`roadmap_${selectedType.id}`);
            if (saved) setCompletedSteps(JSON.parse(saved));
        }
    }, [selectedType]);

    const toggleStepComplete = (stepIdx: number) => {
        if (!selectedType) return;
        const key = `step_${stepIdx}`;
        const updated = { ...completedSteps, [key]: !completedSteps[key] };
        setCompletedSteps(updated);
        localStorage.setItem(`roadmap_${selectedType.id}`, JSON.stringify(updated));
        trackEvent('roadmap_step_toggle', { type: selectedType.id, step: stepIdx, completed: !completedSteps[key] });
    };

    const handleExpandStep = async (stepIdx: number) => {
        if (expandedStep === stepIdx) {
            setExpandedStep(null);
            return;
        }
        setExpandedStep(stepIdx);

        // Fetch video if not already cached
        if (!stepVideos[stepIdx] && selectedType) {
            setLoadingVideo(stepIdx);
            const query = selectedType.roadmapVideos[stepIdx];
            const videos = await fetchYouTubeVideos(query, 1);
            setStepVideos(prev => ({ ...prev, [stepIdx]: videos[0] || null }));
            setLoadingVideo(null);
        }
    };

    const completedCount = selectedType ? selectedType.roadmap.filter((_, i) => completedSteps[`step_${i}`]).length : 0;
    const totalSteps = selectedType ? selectedType.roadmap.length : 0;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    const handleTypeSelect = (type: ProblemType) => {
        setSelectedType(type);
        setInterestLevels(
            type.domains.map(d => ({ domain: d, skill: 3, interest: 3 }))
        );
        trackEvent('problem_type_selected', { type: type.id });
    };

    const updateLevel = (idx: number, field: 'skill' | 'interest', value: number) => {
        setInterestLevels(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
    };

    const handleSubmitMatrix = async () => {
        setPhase('result');
        trackEvent('competency_matrix_submitted', { type: selectedType?.id });

        // Get AI advice if available
        if (selectedType) {
            setLoadingAdvice(true);
            const topDomains = [...interestLevels]
                .sort((a, b) => (b.skill + b.interest) - (a.skill + a.interest))
                .slice(0, 3)
                .map(d => d.domain);

            const prompt = `A student who enjoys "${selectedType.label}" has rated their top interests as: ${topDomains.join(', ')}. In 3-4 sentences, give them specific, actionable career advice. Be encouraging, mention a specific emerging job role, and suggest one unconventional project they could build. Address them directly using "you".`;

            fetchGeminiInsight(prompt)
                .then(r => setGeminiAdvice(r?.text || ''))
                .finally(() => setLoadingAdvice(false));
        }
    };

    const handleReset = () => {
        setPhase('audit');
        setSelectedType(null);
        setInterestLevels([]);
        setGeminiAdvice('');
    };

    // Sort domains by combined score for results
    const rankedDomains = [...interestLevels].sort(
        (a, b) => (b.skill + b.interest) - (a.skill + a.interest)
    );

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {/* ===== PHASE A: Problem-Solving Audit ===== */}
                {phase === 'audit' && !selectedType && (
                    <motion.div
                        key="audit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -30 }}
                    >
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                                <Target size={16} />
                                Problem-Solving Audit
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">What kind of problems excite you?</h3>
                            <p className="text-zinc-500 max-w-lg mx-auto">Pick the statement that resonates most with you. This maps your personality to the best career domains.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {PROBLEM_TYPES.map((type, i) => (
                                <motion.button
                                    key={type.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    onClick={() => handleTypeSelect(type)}
                                    className="text-left group relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5 p-1"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="p-8 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform`}>
                                            <type.icon size={28} className="text-white" />
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">{type.label}</h4>
                                        <p className="text-zinc-500 text-sm mb-4">{type.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {type.domains.slice(0, 3).map(d => (
                                                <span key={d} className="px-2 py-1 bg-white/5 text-zinc-500 rounded-lg text-[10px]">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ===== COMPETENCY MATRIX ===== */}
                {phase === 'audit' && selectedType && (
                    <motion.div
                        key="matrix"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setSelectedType(null)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <ArrowLeft size={20} className="text-zinc-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center`}>
                                    <selectedType.icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Competency & Interest Matrix</h3>
                                    <p className="text-zinc-500 text-sm">Rate your skill level AND interest for each domain</p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* Axis Legend */}
                            <div className="flex items-center gap-8 text-xs text-zinc-500 mb-2 justify-center">
                                <span className="flex items-center gap-1.5"><Zap size={12} className="text-violet-400" /> Skill Level (How good are you?)</span>
                                <span className="flex items-center gap-1.5"><Lightbulb size={12} className="text-amber-400" /> Interest Level (How much do you want this?)</span>
                            </div>

                            {interestLevels.map((level, idx) => (
                                <motion.div
                                    key={level.domain}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 rounded-2xl bg-zinc-900/80 border border-white/5"
                                >
                                    <h5 className="text-white font-bold mb-4 text-sm">{level.domain}</h5>

                                    {/* Skill slider */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <Zap size={14} className="text-violet-400 shrink-0" />
                                        <span className="text-zinc-500 text-xs w-16 shrink-0">Skill</span>
                                        <div className="flex gap-2 flex-1">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => updateLevel(idx, 'skill', v)}
                                                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${v <= level.skill
                                                        ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                                                        : 'bg-white/5 text-zinc-600 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-zinc-600 w-12 text-right">
                                            {level.skill <= 2 ? 'Beginner' : level.skill <= 3 ? 'Mid' : level.skill <= 4 ? 'Good' : 'Expert'}
                                        </span>
                                    </div>

                                    {/* Interest slider */}
                                    <div className="flex items-center gap-4">
                                        <Lightbulb size={14} className="text-amber-400 shrink-0" />
                                        <span className="text-zinc-500 text-xs w-16 shrink-0">Interest</span>
                                        <div className="flex gap-2 flex-1">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => updateLevel(idx, 'interest', v)}
                                                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${v <= level.interest
                                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                                        : 'bg-white/5 text-zinc-600 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-zinc-600 w-12 text-right">
                                            {level.interest <= 2 ? 'Meh' : level.interest <= 3 ? 'OK' : level.interest <= 4 ? 'High' : 'Obsessed'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            <button
                                onClick={handleSubmitMatrix}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-600/20 mt-8"
                            >
                                <Target size={18} />
                                Map My Career Path
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ===== RESULT PAGE ===== */}
                {phase === 'result' && selectedType && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 mb-6 shadow-2xl shadow-violet-600/30"
                            >
                                <CheckCircle2 size={40} className="text-white" />
                            </motion.div>
                            <h3 className="text-3xl font-black text-white mb-2">Your Career Map</h3>
                            <p className="text-zinc-500">Based on your competency & interest ratings</p>
                        </div>

                        {/* Domain ranking */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Your Domains — Ranked</h4>
                            {rankedDomains.map((d, i) => {
                                const totalScore = d.skill + d.interest;
                                const pct = Math.round((totalScore / 10) * 100);
                                const isTop = i === 0;
                                return (
                                    <motion.div
                                        key={d.domain}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`p-5 rounded-2xl border transition-all ${isTop ? 'bg-violet-500/10 border-violet-500/20' : 'bg-zinc-900/80 border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isTop ? 'bg-violet-500 text-white' : 'bg-white/5 text-zinc-500'
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <span className={`font-bold ${isTop ? 'text-white text-lg' : 'text-zinc-300'}`}>{d.domain}</span>
                                                {isTop && <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold">🏆 BEST MATCH</span>}
                                            </div>
                                            <span className={`text-sm font-bold ${isTop ? 'text-violet-400' : 'text-zinc-500'}`}>{pct}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                                                className={`h-full rounded-full ${isTop ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-zinc-600'}`}
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-2 text-[10px] text-zinc-500">
                                            <span>Skill: <strong className="text-violet-400">{d.skill}/5</strong></span>
                                            <span>Interest: <strong className="text-amber-400">{d.interest}/5</strong></span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* AI Advice */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                                <Sparkles size={16} className="text-violet-400" />
                                AI Career Advice
                                <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">Gemini</span>
                            </h4>
                            {loadingAdvice ? (
                                <div className="flex items-center gap-3 text-zinc-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Generating personalized advice...</span>
                                </div>
                            ) : geminiAdvice ? (
                                <p className="text-zinc-300 text-sm leading-relaxed">{geminiAdvice}</p>
                            ) : (
                                <p className="text-zinc-400 text-sm italic">
                                    Based on your profile, focus on {rankedDomains[0]?.domain} to align your strongest skills with your interests.
                                    Start with online courses and build at least 2-3 real projects to stand out.
                                </p>
                            )}
                        </div>

                        {/* Roadmap with YouTube Videos */}
                        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    <BookOpen size={16} className="text-emerald-500" />
                                    Your Learning Roadmap
                                </h4>
                                <span className="text-xs text-zinc-500">{completedCount}/{totalSteps} completed</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>

                            <div className="space-y-3">
                                {selectedType.roadmap.map((step, i) => {
                                    const isCompleted = completedSteps[`step_${i}`];
                                    const isExpanded = expandedStep === i;
                                    const video = stepVideos[i];
                                    const isLoading = loadingVideo === i;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.1 }}
                                            className={`rounded-2xl border transition-all duration-300 ${isCompleted
                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                    : isExpanded
                                                        ? 'bg-violet-500/5 border-violet-500/20'
                                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            {/* Step Header */}
                                            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => handleExpandStep(i)}>
                                                {/* Checkbox */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleStepComplete(i); }}
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isCompleted
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                                                        }`}
                                                >
                                                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                                </button>

                                                {/* Step Text */}
                                                <p className={`flex-1 text-sm transition-all ${isCompleted ? 'text-emerald-400 line-through opacity-70' : 'text-zinc-300'
                                                    }`}>{step}</p>

                                                {/* Watch / Expand Button */}
                                                <div className="flex items-center gap-2">
                                                    {!isExpanded && (
                                                        <span className="text-[10px] text-zinc-500 hidden sm:block">Watch video</span>
                                                    )}
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-violet-500/20 text-violet-400 rotate-180' : 'bg-white/5 text-zinc-500 hover:text-white'
                                                        }`}>
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Video Section */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-4">
                                                            {isLoading ? (
                                                                <div className="flex items-center justify-center py-12 bg-black/20 rounded-xl">
                                                                    <Loader2 className="animate-spin text-violet-500 mr-2" size={20} />
                                                                    <span className="text-zinc-400 text-sm">Finding the best tutorial...</span>
                                                                </div>
                                                            ) : video ? (
                                                                <div className="space-y-3">
                                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                                                                        <iframe
                                                                            src={`${video.embedUrl}?autoplay=1&rel=0`}
                                                                            title={video.title}
                                                                            className="w-full h-full"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 flex-1">{video.title}</p>
                                                                        <a
                                                                            href={`https://www.youtube.com/watch?v=${video.embedUrl.split('/').pop()}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="shrink-0 flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                                                                        >
                                                                            <ExternalLink size={10} />
                                                                            YouTube
                                                                        </a>
                                                                    </div>
                                                                    {!isCompleted && (
                                                                        <button
                                                                            onClick={() => toggleStepComplete(i)}
                                                                            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                                                        >
                                                                            <Check size={12} />
                                                                            Mark as Completed
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center py-10 bg-black/20 rounded-xl gap-2">
                                                                    <Play size={24} className="text-zinc-600" />
                                                                    <p className="text-zinc-500 text-xs">No video found. Try searching on YouTube.</p>
                                                                    <a
                                                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedType.roadmapVideos[i])}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-violet-400 text-xs hover:underline flex items-center gap-1 mt-1"
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                        Search on YouTube
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Roles & Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                                <h5 className="text-white font-bold mb-4 text-sm">🎯 Recommended Roles</h5>
                                <ul className="space-y-2">
                                    {selectedType.roles.map(role => (
                                        <li key={role} className="flex items-center gap-2 text-zinc-400 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            {role}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                                <h5 className="text-white font-bold mb-4 text-sm">🛠 Skills to Build</h5>
                                <div className="flex flex-wrap gap-2">
                                    {selectedType.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-white/5 text-zinc-400 rounded-xl text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full py-4 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={16} />
                            Retake the Audit
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KnowYourDomain;
