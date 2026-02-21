// =============================================
// SUB-PAGE 2: Current Trends
// Career News Feed — Live-updating trends
// APIs: GitHub, Dev.to, Stack Overflow
// =============================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Flame,
    Briefcase,
    Rocket,
    Star,
    GitFork,
    ExternalLink,
    Heart,
    Clock,
    Hash,
    ArrowUpRight,
    RefreshCw,
} from 'lucide-react';
import {
    fetchTrendingRepos,
    fetchDevToArticles,
    fetchStackOverflowTags,
    type GitHubRepo,
    type DevToArticle,
    type StackOverflowTag,
} from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

const Shimmer = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

const CurrentTrends = () => {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [articles, setArticles] = useState<DevToArticle[]>([]);
    const [tags, setTags] = useState<StackOverflowTag[]>([]);
    const [loading, setLoading] = useState({ repos: true, articles: true, tags: true });
    const [refreshing, setRefreshing] = useState(false);

    const loadAll = async () => {
        setLoading({ repos: true, articles: true, tags: true });
        trackEvent('trends_loaded');

        fetchTrendingRepos('technology', 8)
            .then(setRepos)
            .finally(() => setLoading(p => ({ ...p, repos: false })));

        fetchDevToArticles('technology', 8)
            .then(setArticles)
            .finally(() => setLoading(p => ({ ...p, articles: false })));

        fetchStackOverflowTags(20)
            .then(setTags)
            .finally(() => setLoading(p => ({ ...p, tags: false })));
    };

    useEffect(() => { loadAll(); }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAll();
        setTimeout(() => setRefreshing(false), 800);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Career Trend Feed</h3>
                    <p className="text-zinc-500 text-sm">Live technology trends from across the industry.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-sm disabled:opacity-40"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* ===== 🔥 FASTEST GROWING TECH — GitHub ===== */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Flame size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Fastest Growing Tech</h4>
                        <p className="text-zinc-500 text-xs">Trending repositories by stars</p>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 ml-auto">GitHub API</span>
                </div>

                {loading.repos ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-36" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {repos.slice(0, 8).map((repo, i) => (
                            <motion.a
                                key={repo.fullName}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -4 }}
                                className="group p-5 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-orange-500/20 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <img src={repo.owner.avatar} alt="" className="w-6 h-6 rounded-full" />
                                    <span className="text-zinc-400 font-mono text-[11px] truncate flex-1">{repo.fullName}</span>
                                    <ArrowUpRight size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <p className="text-zinc-500 text-[11px] line-clamp-2 mb-3 min-h-[2.5em]">{repo.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                    <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" />{repo.stars.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><GitFork size={10} />{repo.forks.toLocaleString()}</span>
                                    {repo.language && <span className="px-1.5 py-0.5 bg-white/5 rounded-md">{repo.language}</span>}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== 🚀 EMERGING DOMAINS — Dev.to ===== */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Rocket size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Emerging Domains</h4>
                        <p className="text-zinc-500 text-xs">Future-ready fields trending in the developer community</p>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 ml-auto">Dev.to API</span>
                </div>

                {loading.articles ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-32" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {articles.slice(0, 8).map((article, i) => (
                            <motion.a
                                key={article.id}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -3 }}
                                className="group flex gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-emerald-500/20 transition-all"
                            >
                                {article.coverImage && (
                                    <img src={article.coverImage} alt="" className="w-24 h-20 rounded-xl object-cover shrink-0 hidden sm:block" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-white text-sm font-bold line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">
                                        {article.title}
                                    </h5>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                        <span className="flex items-center gap-1"><Heart size={10} className="text-red-400" />{article.reactions}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} />{article.readingTime}m read</span>
                                        {article.tags.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-white/5 rounded-md">{article.tags[0]}</span>
                                        )}
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                            </motion.a>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== 💼 MOST IN-DEMAND SKILLS — Stack Overflow ===== */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Briefcase size={20} className="text-violet-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Most In-Demand Skills</h4>
                        <p className="text-zinc-500 text-xs">Top technologies developers are asking about</p>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 ml-auto">Stack Overflow</span>
                </div>

                {loading.tags ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {[...Array(10)].map((_, i) => <Shimmer key={i} className="h-20" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {tags.map((tag, i) => {
                            const maxCount = tags[0]?.count || 1;
                            const pct = Math.round((tag.count / maxCount) * 100);
                            return (
                                <motion.div
                                    key={tag.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-violet-500/20 transition-all relative overflow-hidden group"
                                >
                                    {/* Background fill bar */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700 group-hover:h-full group-hover:opacity-10"
                                        style={{ width: `${pct}%` }}
                                    />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash size={12} className="text-violet-400" />
                                            <span className="text-white font-bold text-xs">{tag.name}</span>
                                        </div>
                                        <p className="text-zinc-500 text-[10px]">{tag.count.toLocaleString()} questions</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 text-[10px] text-zinc-600 pt-4">
                <span className="flex items-center gap-1.5"><Flame size={10} className="text-orange-500" />GitHub Trending</span>
                <span className="flex items-center gap-1.5"><Rocket size={10} className="text-emerald-500" />Dev.to Articles</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={10} className="text-violet-500" />Stack Overflow Tags</span>
            </div>
        </div>
    );
};

export default CurrentTrends;
