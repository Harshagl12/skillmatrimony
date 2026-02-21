import { useState, useEffect, useCallback } from 'react';
import {
    fetchYouTubeVideos,
    fetchWikipediaSummary,
    fetchTrendingRepos,
    fetchGeminiInsight,
    fetchDevToArticles,
    fetchStackOverflowTags,
    fetchUnsplashPhotos,
    fetchPexelsPhotos,
    type YouTubeVideo,
    type WikiSummary,
    type GitHubRepo,
    type GeminiResponse,
    type DevToArticle,
    type StackOverflowTag,
    type UnsplashPhoto,
    type PexelsPhoto,
} from '../lib/api';

// =============================================
// Generic hook for async API data
// =============================================
function useApiData<T>(
    fetcher: () => Promise<T>,
    deps: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// =============================================
// YouTube — Skill showcase videos
// =============================================
export function useYouTubeVideos(query: string, maxResults = 3) {
    return useApiData<YouTubeVideo[]>(
        () => fetchYouTubeVideos(query, maxResults),
        [query, maxResults]
    );
}

// =============================================
// Wikipedia — Skill definitions
// =============================================
export function useWikipediaSummary(topic: string) {
    return useApiData<WikiSummary | null>(
        () => fetchWikipediaSummary(topic),
        [topic]
    );
}

// =============================================
// GitHub — Trending repos/tools
// =============================================
export function useGitHubTrending(topic: string, limit = 6) {
    return useApiData<GitHubRepo[]>(
        () => fetchTrendingRepos(topic, limit),
        [topic, limit]
    );
}

// =============================================
// Gemini — AI generated descriptions
// =============================================
export function useGeminiInsight(prompt: string) {
    return useApiData<GeminiResponse | null>(
        () => fetchGeminiInsight(prompt),
        [prompt]
    );
}

// =============================================
// Dev.to — Latest articles
// =============================================
export function useDevToArticles(tag: string, limit = 6) {
    return useApiData<DevToArticle[]>(
        () => fetchDevToArticles(tag, limit),
        [tag, limit]
    );
}

// =============================================
// Stack Overflow — Popular tags
// =============================================
export function useStackOverflowTags(limit = 10) {
    return useApiData<StackOverflowTag[]>(
        () => fetchStackOverflowTags(limit),
        [limit]
    );
}

// =============================================
// Unsplash — Dynamic photos
// =============================================
export function useUnsplashPhotos(query: string, count = 6) {
    return useApiData<UnsplashPhoto[]>(
        () => fetchUnsplashPhotos(query, count),
        [query, count]
    );
}

// =============================================
// Pexels — Fallback photos
// =============================================
export function usePexelsPhotos(query: string, count = 6) {
    return useApiData<PexelsPhoto[]>(
        () => fetchPexelsPhotos(query, count),
        [query, count]
    );
}
