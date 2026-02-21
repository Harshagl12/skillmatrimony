// =============================================
// SUB-PAGE 1: Types of Domains
// Netflix-style Skill Exploration
// APIs: YouTube, Wikipedia, GitHub, Gemini
// =============================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    Cpu,
    ChevronRight,
    PlayCircle,
    BookOpen,
    Briefcase,
    Wrench,
    Sparkles,
    Star,
    GitFork,
    ExternalLink,
    ArrowUpRight,
    ArrowLeft,
    Monitor,
    Database,
    Loader2,
} from 'lucide-react';
import {
    fetchYouTubeVideos,
    fetchWikipediaSummary,
    fetchGeminiInsight,
    fetchTrendingRepos,
    type YouTubeVideo,
    type WikiSummary,
    type GitHubRepo,
} from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

// =============================================
// BRANCH & DOMAIN DATA
// =============================================
function Brain(props: any) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
        </svg>
    );
}

interface DomainData {
    name: string;
    desc: string;
    tools: string[];
    roles: string[];
    wikiTopic: string;
    youtubeQuery: string;
    githubQuery: string;
}

interface BranchData {
    id: string;
    name: string;
    icon: any;
    color: string;
    accent: string;
    domains: DomainData[];
}

const BRANCHES: BranchData[] = [
    {
        id: 'cs',
        name: 'Computer Science',
        icon: Code2,
        color: 'from-blue-500 to-indigo-600',
        accent: 'blue',
        domains: [
            {
                name: 'Web Development',
                desc: 'Building modern web applications using cutting edge technologies.',
                tools: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'TypeScript'],
                roles: ['Frontend Engineer', 'Backend Developer', 'Fullstack Engineer', 'Web Architect'],
                wikiTopic: 'Web_development',
                youtubeQuery: 'web development roadmap 2024',
                githubQuery: 'web framework',
            },
            {
                name: 'Cybersecurity',
                desc: 'Protecting systems and networks from digital attacks.',
                tools: ['Kali Linux', 'Burp Suite', 'Wireshark', 'Nmap', 'Metasploit'],
                roles: ['Security Analyst', 'Penetration Tester', 'SOC Engineer', 'Security Architect'],
                wikiTopic: 'Computer_security',
                youtubeQuery: 'cybersecurity career roadmap',
                githubQuery: 'cybersecurity tools',
            },
            {
                name: 'Cloud Computing',
                desc: 'Delivering computing services over the internet at massive scale.',
                tools: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes'],
                roles: ['Cloud Architect', 'Cloud Engineer', 'SRE', 'Platform Engineer'],
                wikiTopic: 'Cloud_computing',
                youtubeQuery: 'cloud computing explained',
                githubQuery: 'cloud native',
            },
            {
                name: 'DevOps',
                desc: 'Combining software development and IT operations for faster delivery.',
                tools: ['Docker', 'Kubernetes', 'Jenkins', 'Git', 'Ansible'],
                roles: ['DevOps Engineer', 'SRE', 'Platform Engineer', 'Release Manager'],
                wikiTopic: 'DevOps',
                youtubeQuery: 'devops roadmap for beginners',
                githubQuery: 'devops automation',
            },
            {
                name: 'Software Engineering',
                desc: 'Designing, developing, testing, and maintaining software systems.',
                tools: ['Git', 'VS Code', 'Jira', 'PostgreSQL', 'Redis'],
                roles: ['Software Engineer', 'Technical Lead', 'Solutions Architect', 'QA Engineer'],
                wikiTopic: 'Software_engineering',
                youtubeQuery: 'software engineering career',
                githubQuery: 'software engineering best practices',
            },
        ],
    },
    {
        id: 'is',
        name: 'Information Science',
        icon: Database,
        color: 'from-teal-500 to-cyan-600',
        accent: 'teal',
        domains: [
            {
                name: 'Database Management',
                desc: 'Designing and managing structured data storage systems.',
                tools: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Neo4j'],
                roles: ['Database Admin', 'Data Engineer', 'Database Architect', 'BI Developer'],
                wikiTopic: 'Database',
                youtubeQuery: 'database management systems',
                githubQuery: 'database management',
            },
            {
                name: 'Information Systems',
                desc: 'Building enterprise systems that manage business processes and data.',
                tools: ['SAP', 'Salesforce', 'Power BI', 'Tableau', 'Oracle ERP'],
                roles: ['Systems Analyst', 'IT Consultant', 'ERP Specialist', 'Business Analyst'],
                wikiTopic: 'Information_system',
                youtubeQuery: 'information systems explained',
                githubQuery: 'enterprise software',
            },
            {
                name: 'Data Analytics',
                desc: 'Transforming raw data into actionable business insights.',
                tools: ['Python', 'R', 'Tableau', 'Power BI', 'Excel'],
                roles: ['Data Analyst', 'BI Engineer', 'Analytics Manager', 'Insights Lead'],
                wikiTopic: 'Data_analysis',
                youtubeQuery: 'data analytics career roadmap',
                githubQuery: 'data analytics',
            },
            {
                name: 'Network Administration',
                desc: 'Managing and maintaining computer network infrastructure.',
                tools: ['Cisco IOS', 'Wireshark', 'pfSense', 'Nagios', 'Zabbix'],
                roles: ['Network Admin', 'Network Engineer', 'IT Manager', 'Infrastructure Lead'],
                wikiTopic: 'Network_administrator',
                youtubeQuery: 'network administration',
                githubQuery: 'network monitoring',
            },
        ],
    },
    {
        id: 'aiml',
        name: 'AI & Machine Learning',
        icon: Brain,
        color: 'from-purple-500 to-pink-600',
        accent: 'purple',
        domains: [
            {
                name: 'Machine Learning',
                desc: 'Teaching computers to learn from data and make predictions.',
                tools: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Python', 'Jupyter'],
                roles: ['ML Engineer', 'Data Scientist', 'Research Scientist', 'ML Ops Engineer'],
                wikiTopic: 'Machine_learning',
                youtubeQuery: 'machine learning roadmap 2024',
                githubQuery: 'machine learning',
            },
            {
                name: 'Data Science',
                desc: 'Extracting knowledge and insights from structured and unstructured data.',
                tools: ['Pandas', 'NumPy', 'Jupyter', 'Tableau', 'SQL'],
                roles: ['Data Scientist', 'Data Analyst', 'Data Engineer', 'BI Developer'],
                wikiTopic: 'Data_science',
                youtubeQuery: 'data science roadmap',
                githubQuery: 'data science',
            },
            {
                name: 'Deep Learning',
                desc: 'Building neural networks that mimic human brain architecture.',
                tools: ['TensorFlow', 'PyTorch', 'Keras', 'CUDA', 'ONNX'],
                roles: ['Deep Learning Engineer', 'AI Researcher', 'Computer Vision Engineer', 'NLP Engineer'],
                wikiTopic: 'Deep_learning',
                youtubeQuery: 'deep learning explained',
                githubQuery: 'deep learning',
            },
            {
                name: 'Natural Language Processing',
                desc: 'Processing and understanding human language with AI.',
                tools: ['spaCy', 'NLTK', 'Hugging Face', 'GPT API', 'LangChain'],
                roles: ['NLP Engineer', 'AI Researcher', 'Conversational AI Dev', 'LLM Engineer'],
                wikiTopic: 'Natural_language_processing',
                youtubeQuery: 'NLP tutorial',
                githubQuery: 'natural language processing',
            },
            {
                name: 'Computer Vision',
                desc: 'Enabling computers to interpret and understand visual data.',
                tools: ['OpenCV', 'YOLO', 'MediaPipe', 'TensorFlow', 'PyTorch'],
                roles: ['CV Engineer', 'Perception Engineer', 'AR/VR Developer', 'Robotics Vision Dev'],
                wikiTopic: 'Computer_vision',
                youtubeQuery: 'computer vision projects',
                githubQuery: 'computer vision',
            },
        ],
    },
    {
        id: 'ec',
        name: 'Electronics & Communication',
        icon: Cpu,
        color: 'from-amber-500 to-orange-600',
        accent: 'amber',
        domains: [
            {
                name: 'Embedded Systems',
                desc: 'Designing computer systems dedicated to specific functions.',
                tools: ['Arduino', 'Raspberry Pi', 'RTOS', 'C/C++', 'STM32'],
                roles: ['Embedded Engineer', 'Firmware Developer', 'IoT Engineer', 'Hardware Engineer'],
                wikiTopic: 'Embedded_system',
                youtubeQuery: 'embedded systems tutorial',
                githubQuery: 'embedded systems',
            },
            {
                name: 'Robotics',
                desc: 'Designing and building autonomous and interactive machines.',
                tools: ['ROS', 'MATLAB', 'Gazebo', 'Python', 'Solidworks'],
                roles: ['Robotics Engineer', 'Automation Engineer', 'Control Systems Engineer', 'Mechatronics Dev'],
                wikiTopic: 'Robotics',
                youtubeQuery: 'robotics engineering',
                githubQuery: 'robotics',
            },
            {
                name: 'Internet of Things',
                desc: 'Network of physical objects embedded with sensors and connectivity.',
                tools: ['MQTT', 'Node-RED', 'AWS IoT', 'ESP32', 'LoRa'],
                roles: ['IoT Developer', 'Edge Computing Engineer', 'Smart Systems Architect', 'IoT Solutions Lead'],
                wikiTopic: 'Internet_of_things',
                youtubeQuery: 'internet of things projects',
                githubQuery: 'internet of things',
            },
            {
                name: 'VLSI Design',
                desc: 'Designing integrated circuits with millions of transistors.',
                tools: ['Cadence', 'Synopsys', 'Verilog', 'VHDL', 'SPICE'],
                roles: ['VLSI Engineer', 'Chip Designer', 'Verification Engineer', 'ASIC Engineer'],
                wikiTopic: 'Very-large-scale_integration',
                youtubeQuery: 'VLSI design tutorial',
                githubQuery: 'VLSI design',
            },
            {
                name: 'Signal Processing',
                desc: 'Analyzing, modifying, and synthesizing signals like audio and images.',
                tools: ['MATLAB', 'SciPy', 'GNU Radio', 'Audacity', 'Octave'],
                roles: ['DSP Engineer', 'Audio Engineer', 'Communications Engineer', 'Radar Systems Engineer'],
                wikiTopic: 'Signal_processing',
                youtubeQuery: 'digital signal processing',
                githubQuery: 'signal processing',
            },
        ],
    },
];

// ---------- SHIMMER LOADER ----------
const Shimmer = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

// =============================================
// SKILL SHOWCASE CARD
// =============================================
const SkillShowcase = ({ domain, onBack }: { domain: DomainData; onBack: () => void }) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [wiki, setWiki] = useState<WikiSummary | null>(null);
    const [geminiText, setGeminiText] = useState('');
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState({ videos: false, wiki: false, gemini: false, repos: false });
    const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        trackEvent('skill_showcase_open', { domain: domain.name });

        // YouTube
        setLoading(p => ({ ...p, videos: true }));
        fetchYouTubeVideos(domain.youtubeQuery, 4)
            .then(v => { setVideos(v); if (v.length > 0) setActiveVideo(v[0]); })
            .finally(() => setLoading(p => ({ ...p, videos: false })));

        // Wikipedia
        setLoading(p => ({ ...p, wiki: true }));
        fetchWikipediaSummary(domain.wikiTopic)
            .then(setWiki)
            .finally(() => setLoading(p => ({ ...p, wiki: false })));

        // Gemini
        setLoading(p => ({ ...p, gemini: true }));
        fetchGeminiInsight(
            `In 4 concise sentences, describe what a ${domain.name} professional actually does day-to-day. Be practical, specific, and inspiring. Include one surprising fact students wouldn't expect. Address the student directly using "you".`
        )
            .then(r => setGeminiText(r?.text || ''))
            .finally(() => setLoading(p => ({ ...p, gemini: false })));

        // GitHub
        setLoading(p => ({ ...p, repos: true }));
        fetchTrendingRepos(domain.githubQuery, 4)
            .then(setRepos)
            .finally(() => setLoading(p => ({ ...p, repos: false })));
    }, [domain]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Back + Title */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-zinc-400" />
                </button>
                <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{domain.name}</h3>
                    <p className="text-zinc-200 text-sm mt-1">{domain.desc}</p>
                </div>
            </div>

            {/* ===== VIDEO PLAYER + AI DESCRIPTION ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Main Video */}
                <div className="lg:col-span-3">
                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-4">
                        {loading.videos ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <Loader2 className="animate-spin text-violet-500" size={40} />
                            </div>
                        ) : activeVideo ? (
                            <iframe
                                src={activeVideo.embedUrl}
                                className="w-full h-full"
                                title={activeVideo.title}
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-900">
                                <PlayCircle size={64} className="mb-4 opacity-20" />
                                <span>No video available</span>
                            </div>
                        )}
                    </div>
                    {/* Video Thumbnails */}
                    {videos.length > 1 && (
                        <div className="grid grid-cols-3 gap-3">
                            {videos.slice(0, 3).map((vid) => (
                                <button
                                    key={vid.id}
                                    onClick={() => setActiveVideo(vid)}
                                    className={`rounded-xl overflow-hidden border-2 transition-all ${activeVideo?.id === vid.id ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-transparent hover:border-white/20'
                                        }`}
                                >
                                    <img src={vid.thumbnail} alt={vid.title} className="w-full h-16 object-cover" />
                                    <p className="text-[10px] text-zinc-200 p-2 bg-zinc-900 line-clamp-1">
                                        {vid.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Description + What You Do */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Gemini: What you actually do */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                        <h5 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                            <Sparkles size={16} className="text-violet-400" />
                            What You Actually Do
                            <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">AI</span>
                        </h5>
                        {loading.gemini ? (
                            <div className="space-y-2">
                                <Shimmer className="h-3 w-full" />
                                <Shimmer className="h-3 w-5/6" />
                                <Shimmer className="h-3 w-4/6" />
                                <Shimmer className="h-3 w-3/4" />
                            </div>
                        ) : geminiText ? (
                            <p className="text-white text-sm leading-relaxed drop-shadow-sm font-medium">{geminiText}</p>
                        ) : (
                            <p className="text-violet-200 text-sm leading-relaxed italic">{domain.desc}</p>
                        )}
                    </div>

                    {/* Wikipedia excerpt */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <h5 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                            <BookOpen size={16} className="text-blue-400" />
                            Overview
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Wikipedia</span>
                        </h5>
                        {loading.wiki ? (
                            <div className="space-y-2">
                                <Shimmer className="h-3 w-full" />
                                <Shimmer className="h-3 w-5/6" />
                            </div>
                        ) : wiki ? (
                            <div>
                                <p className="text-zinc-200 text-xs leading-relaxed mb-2">
                                    {wiki.extract.length > 200 ? wiki.extract.substring(0, 200) + '...' : wiki.extract}
                                </p>
                                {wiki.pageUrl && (
                                    <a href={wiki.pageUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-violet-400 text-xs hover:text-violet-300 flex items-center gap-1">
                                        Read more <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-xs">{domain.desc}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== TOOLS & CAREER ROLES ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                    <h5 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                        <Wrench size={16} className="text-amber-500" /> Tools & Technologies
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {domain.tools.map((tool) => (
                            <span key={tool} className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-xs font-medium hover:bg-violet-500/20 hover:text-violet-300 transition-colors cursor-default">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                    <h5 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                        <Briefcase size={16} className="text-emerald-500" /> Career Roles
                    </h5>
                    <ul className="space-y-2">
                        {domain.roles.map((role) => (
                            <li key={role} className="flex items-center gap-3 text-zinc-200 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {role}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ===== GITHUB TRENDING REPOS ===== */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5">
                <h5 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Monitor size={16} className="text-zinc-300" /> Trending Repositories
                    <span className="text-[9px] bg-zinc-500/20 text-zinc-300 px-2 py-0.5 rounded-full">GitHub</span>
                </h5>
                {loading.repos ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-24" />)}
                    </div>
                ) : repos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {repos.map((repo) => (
                            <a key={repo.fullName} href={repo.url} target="_blank" rel="noopener noreferrer"
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all group">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={repo.owner.avatar} alt="" className="w-5 h-5 rounded-full" />
                                    <span className="text-zinc-500 text-[10px] font-mono truncate">{repo.fullName}</span>
                                    <ArrowUpRight size={12} className="text-zinc-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <p className="text-zinc-300 text-[11px] line-clamp-2 mb-2">{repo.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                                    <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" />{repo.stars.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><GitFork size={10} />{repo.forks.toLocaleString()}</span>
                                    {repo.language && <span className="px-1.5 py-0.5 bg-white/5 rounded">{repo.language}</span>}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-sm">No repos found.</p>
                )}
            </div>
        </motion.div>
    );
};

// =============================================
// MAIN COMPONENT
// =============================================
const DomainExplorer = () => {
    const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<DomainData | null>(null);

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {/* LEVEL 1: Branch Selection */}
                {!selectedBranch && (
                    <motion.div
                        key="branches"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -30 }}
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Choose Your Branch</h3>
                            <p className="text-zinc-300">Select your engineering branch to explore domain specializations.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {BRANCHES.map((branch, i) => (
                                <motion.div
                                    key={branch.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onClick={() => { setSelectedBranch(branch); trackEvent('branch_selected', { branch: branch.name }); }}
                                    className="cursor-pointer group relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5 p-1"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="p-8 flex flex-col items-center text-center relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${branch.color} flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform`}>
                                            <branch.icon size={32} className="text-white" />
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">{branch.name}</h4>
                                        <p className="text-zinc-300 text-sm mb-5">{branch.domains.length} specializations</p>
                                        <div className="w-full py-3 bg-white/10 rounded-xl flex items-center justify-center gap-2 group-hover:bg-violet-600 transition-colors text-sm border border-white/5">
                                            <span className="font-bold text-white">Explore</span>
                                            <ChevronRight size={16} className="text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* LEVEL 2: Domain List within Branch */}
                {selectedBranch && !selectedDomain && (
                    <motion.div
                        key="domains"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setSelectedBranch(null)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <ArrowLeft size={20} className="text-zinc-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedBranch.color} flex items-center justify-center`}>
                                    <selectedBranch.icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedBranch.name}</h3>
                                    <p className="text-zinc-300 text-sm">Select a domain to explore skills & career paths</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {selectedBranch.domains.map((domain, i) => (
                                <motion.button
                                    key={domain.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => setSelectedDomain(domain)}
                                    className="text-left p-6 rounded-2xl bg-zinc-900 border border-white/10 hover:border-violet-500/50 hover:bg-zinc-800 transition-all group shadow-lg shadow-black/50"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{domain.name}</h4>
                                        <ChevronRight size={18} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                                    </div>
                                    <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{domain.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {domain.tools.slice(0, 3).map(tool => (
                                            <span key={tool} className="px-2 py-1 bg-white/10 text-zinc-200 rounded-lg text-[10px] font-medium border border-white/5">{tool}</span>
                                        ))}
                                        {domain.tools.length > 3 && (
                                            <span className="px-2 py-1 bg-white/10 text-zinc-400 rounded-lg text-[10px]">+{domain.tools.length - 3}</span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* LEVEL 3: Skill Showcase */}
                {selectedDomain && (
                    <SkillShowcase
                        key={selectedDomain.name}
                        domain={selectedDomain}
                        onBack={() => setSelectedDomain(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DomainExplorer;
