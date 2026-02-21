import ReactGA from 'react-ga4';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export function initGoogleAnalytics(): void {
    if (!GA_ID) {
        console.warn('[GA] No measurement ID found. Set VITE_GA_MEASUREMENT_ID in .env');
        return;
    }

    // Initialize GA4
    ReactGA.initialize(GA_ID);
}

// Track custom events
export function trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!GA_ID) return;

    ReactGA.event(eventName, params);
}

// Track page views
export function trackPageView(path: string): void {
    if (!GA_ID) return;

    ReactGA.send({ hitType: "pageview", page: path, title: document.title });
}
