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
    Rocket,
    Star,
    GitFork,
    ExternalLink,
    Heart,
    Clock,
    Hash,
    ArrowUpRight,
    RefreshCw,
    BarChart2,
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

// Relevant tech tags for engineering students
const ARTICLE_TAGS = ['webdev', 'ai', 'programming', 'career'];

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

        // Fetch from multiple relevant tags, merge and deduplicate
        Promise.all(ARTICLE_TAGS.map(tag => fetchDevToArticles(tag, 4)))
            .then(results => {
                const all = results.flat();
                // Deduplicate by id, sort by reactions (most popular first)
                const unique = Array.from(new Map(all.map(a => [a.id, a])).values());
                unique.sort((a, b) => b.reactions - a.reactions);
                setArticles(unique.slice(0, 8));
            })
            .finally(() => setLoading(p => ({ ...p, articles: false })));

        fetchStackOverflowTags(15)
            .then(setTags)
            .finally(() => setLoading(p => ({ ...p, tags: false })));
    };

    useEffect(() => { loadAll(); }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAll();
        setTimeout(() => setRefreshing(false), 800);
    };

    const formatCount = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return n.toLocaleString();
    };

    return (
        <div className="space-y-10">
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

            {/* ===== 🚀 INDUSTRY INSIGHTS — Dev.to ===== */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Rocket size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Industry Insights</h4>
                        <p className="text-zinc-500 text-xs">Trending articles from the developer community</p>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 ml-auto">Dev.to API</span>
                </div>

                {/* Category pills */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {ARTICLE_TAGS.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/10 capitalize">
                            {tag}
                        </span>
                    ))}
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
                                className="group flex gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-emerald-500/20 transition-all overflow-hidden"
                            >
                                {article.coverImage && (
                                    <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 hidden sm:block relative">
                                        <img
                                            src={article.coverImage}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    </div>
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
                        <BarChart2 size={20} className="text-violet-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">Most In-Demand Skills</h4>
                        <p className="text-zinc-500 text-xs">Technologies ranked by developer activity on Stack Overflow</p>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 ml-auto">Stack Overflow</span>
                </div>

                {loading.tags ? (
                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => <Shimmer key={i} className="h-12" />)}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tags.slice(0, 15).map((tag, i) => {
                            const maxCount = tags[0]?.count || 1;
                            const pct = Math.round((tag.count / maxCount) * 100);
                            // Color gradient based on rank
                            const colors = [
                                'from-violet-500 to-purple-500',
                                'from-indigo-500 to-violet-500',
                                'from-blue-500 to-indigo-500',
                            ];
                            const colorClass = colors[Math.min(Math.floor(i / 5), colors.length - 1)];

                            return (
                                <motion.div
                                    key={tag.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group relative p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-violet-500/20 transition-all overflow-hidden"
                                >
                                    {/* Background fill bar */}
                                    <motion.div
                                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClass} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                                    />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <span className="text-zinc-600 text-[10px] font-bold w-5 text-right shrink-0">#{i + 1}</span>
                                        <Hash size={12} className="text-violet-400 shrink-0" />
                                        <span className="text-white font-bold text-sm flex-1">{tag.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-500 text-xs">{formatCount(tag.count)} questions</span>
                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                <motion.div
                                                    className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                                />
                                            </div>
                                        </div>
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

