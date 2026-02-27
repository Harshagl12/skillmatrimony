// =============================================
// SKILL MATRIMONY — Centralized API Service
// =============================================

// ---------- ENV Keys ----------
const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const HF_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

// =============================================
// 3. YouTube Data API v3
// Page 4 — Skill Showcase videos
// =============================================
export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    embedUrl: string;
}

export async function fetchYouTubeVideos(query: string, maxResults = 3): Promise<YouTubeVideo[]> {
    if (!YOUTUBE_KEY) {
        console.warn('[YouTube] No API key found. Set VITE_YOUTUBE_API_KEY in .env');
        return [];
    }
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + ' tutorial explained')}&maxResults=${maxResults}&key=${YOUTUBE_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`YouTube API ${res.status}`);
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        }));
    } catch (err) {
        console.error('[YouTube] Fetch error:', err);
        return [];
    }
}

// =============================================
// 4. Wikipedia API (NO key needed)
// Page 4 — Skill Descriptions
// =============================================
export interface WikiSummary {
    title: string;
    extract: string;
    thumbnail?: string;
    pageUrl: string;
}

export async function fetchWikipediaSummary(topic: string): Promise<WikiSummary | null> {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
        const data = await res.json();
        return {
            title: data.title,
            extract: data.extract || '',
            thumbnail: data.thumbnail?.source,
            pageUrl: data.content_urls?.desktop?.page || '',
        };
    } catch (err) {
        console.error('[Wikipedia] Fetch error:', err);
        return null;
    }
}

// =============================================
// 5. GitHub API (token optional but recommended)
// Page 4 — Trending tools, repo stars
// =============================================
export interface GitHubRepo {
    name: string;
    fullName: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
    owner: { login: string; avatar: string };
}

export async function fetchTrendingRepos(topic: string, limit = 6): Promise<GitHubRepo[]> {
    try {
        const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
        if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}&sort=stars&order=desc&per_page=${limit}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = await res.json();
        return (data.items || []).map((repo: any) => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || '',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language || 'Unknown',
            url: repo.html_url,
            owner: { login: repo.owner.login, avatar: repo.owner.avatar_url },
        }));
    } catch (err) {
        console.error('[GitHub] Fetch error:', err);
        return [];
    }
}

// =============================================
// 6. Google Gemini API
// Page 4 — "Know Your Domain" + Career Advice
// =============================================
export interface GeminiResponse {
    text: string;
}

export async function fetchGeminiInsight(prompt: string): Promise<GeminiResponse | null> {
    if (!GEMINI_KEY) {
        console.warn('[Gemini] No API key found. Set VITE_GEMINI_API_KEY in .env');
        return null;
    }
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });
        if (!res.ok) throw new Error(`Gemini API ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { text };
    } catch (err) {
        console.error('[Gemini] Fetch error:', err);
        return null;
    }
}

// =============================================
// Zero-Failure Zone: 5.1 File Checker Bot
// =============================================
export interface BotAnalysisResult {
    score: number;
    errors: { type: string; description: string; location?: string; fix: string }[];
    warnings: { type: string; description: string; suggestion: string }[];
    strengths: string[];
    overall_verdict: string;
}
// =============================================
// MOCK DATA FALLBACKS (Only used when all APIs fail)
// =============================================
const MOCK_ANALYSIS_RESULT: BotAnalysisResult = {
    score: 85,
    overall_verdict: "⚠️ DEMO MODE — No LLM API available. This is sample feedback.",
    errors: [
        { type: "Formatting", description: "Inconsistent font sizes used in headers.", location: "Page 1, Header 2", fix: "Standardize all H2 headers to 18pt font." },
        { type: "Grammar", description: "Sentence fragment found.", location: "Introduction, Paragraph 1", fix: "Complete the sentence to ensure clarity." }
    ],
    warnings: [
        { type: "Tone", description: "Passive voice used frequently.", suggestion: "Consider using active voice for a stronger impact." }
    ],
    strengths: [
        "Excellent technical depth in the methodology section.",
        "Clear and concise abstract.",
        "Good use of visual aids to explain complex concepts."
    ]
};

// =============================================
// LLM Call Chain: Groq → Gemini → Fallback
// =============================================
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

async function callGroq(prompt: string, temperature = 0.7, maxTokens = 2048): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Groq API ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string, temperature = 0.7, maxTokens = 2048): Promise<string> {
    const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];
    for (let i = 0; i < models.length; i++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent?key=${GEMINI_KEY}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature, maxOutputTokens: maxTokens },
            }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        if (res.status === 429 && i < models.length - 1) {
            await new Promise(r => setTimeout(r, 2000));
            continue;
        }
    }
    throw new Error('All Gemini models quota exhausted');
}

// Smart LLM caller: tries Groq first (free + fast), then Gemini
async function callLLM(prompt: string, temperature = 0.7, maxTokens = 2048): Promise<string> {
    // 1. Try Groq first (free, fast, high limits)
    if (GROQ_KEY) {
        try {
            const result = await callGroq(prompt, temperature, maxTokens);
            if (result) {
                console.log('[LLM] ✅ Groq responded');
                return result;
            }
        } catch (err) {
            console.warn('[LLM] Groq failed, trying Gemini...', err);
        }
    }

    // 2. Try Gemini as fallback
    if (GEMINI_KEY) {
        try {
            const result = await callGemini(prompt, temperature, maxTokens);
            if (result) {
                console.log('[LLM] ✅ Gemini responded');
                return result;
            }
        } catch (err) {
            console.warn('[LLM] Gemini failed too', err);
        }
    }

    throw new Error('All LLM providers failed. Check your API keys.');
}

// Helper: extract JSON from LLM response
function extractJSON(rawText: string): any {
    let jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(jsonStr);
}

// =============================================
// Zero-Failure Zone: 5.1 File Checker Bot
// =============================================
export async function analyzeDocumentForBot(fileText: string, docType: string): Promise<BotAnalysisResult | null> {
    if (!GROQ_KEY && !GEMINI_KEY) {
        console.warn("No LLM keys found - returning demo data");
        return MOCK_ANALYSIS_RESULT;
    }

    try {
        const prompt = `You are an expert VTU (Visvesvaraya Technological University) academic document reviewer.
Analyze this ${docType} submitted by an engineering student and return ONLY valid JSON:
{
    "score": <0-100>,
    "errors": [{"type": "string", "description": "string", "location": "string", "fix": "string"}],
    "warnings": [{"type": "string", "description": "string", "suggestion": "string"}],
    "strengths": ["string"],
    "overall_verdict": "string"
}

RULES:
- Be SPECIFIC to the actual content. Reference real sections, sentences, and paragraphs from the document
- Evaluate based on VTU academic standards (formatting, technical depth, citations)
- Each error/warning must cite the actual text
- Give actionable suggestions a VTU student can immediately apply
- Be encouraging but honest

Document Text:
${fileText.substring(0, 8000)}`;

        const rawText = await callLLM(prompt, 0.5, 2048);
        return extractJSON(rawText);

    } catch (err: any) {
        console.error('[LLM] Analysis error:', err);
        throw new Error(`Document analysis failed: ${err.message}`);
    }
}

// =============================================
// Zero-Failure Zone: 5.2 Exam Prep Bot
// =============================================
export interface ExamQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty_level: 'Easy' | 'Medium' | 'Hard';
    type: 'MCQ' | 'Short Answer' | 'Application';
}

export interface ExamResult {
    questions: ExamQuestion[];
}

// Topic-specific fallback question banks
const FALLBACK_QUESTION_BANKS: Record<string, ExamQuestion[]> = {
    python: [
        { question: "What is the output of print(type([]) is list)?", options: ["True", "False", "Error", "None"], correct_answer: "True", explanation: "type([]) returns <class 'list'>, which is the same as list, so True.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Which keyword creates a generator in Python?", options: ["generate", "yield", "return", "iter"], correct_answer: "yield", explanation: "yield pauses the function and returns a value, creating a generator.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What does __init__ do in a Python class?", options: ["Destroys the object", "Initializes attributes", "Returns class name", "Creates static method"], correct_answer: "Initializes attributes", explanation: "__init__ is the constructor called when creating an object.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Difference between list and tuple?", options: ["Lists immutable, tuples mutable", "Tuples immutable, lists mutable", "Both mutable", "Both immutable"], correct_answer: "Tuples immutable, lists mutable", explanation: "Lists can be modified, tuples cannot.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is a decorator in Python?", options: ["Modifies another function", "A data structure", "A loop construct", "An error handler"], correct_answer: "Modifies another function", explanation: "Decorators wrap functions to extend behavior using @syntax.", difficulty_level: "Medium", type: "MCQ" },
    ],
    javascript: [
        { question: "What is typeof null in JavaScript?", options: ["null", "undefined", "object", "boolean"], correct_answer: "object", explanation: "typeof null returns 'object' — a historical bug in JS.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What is a closure?", options: ["Function with outer scope access", "Way to close tabs", "A loop type", "Error handler"], correct_answer: "Function with outer scope access", explanation: "Closures remember variables from their enclosing scope.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What does 'use strict' do?", options: ["Faster code", "Strict error checking", "Imports modules", "Private variables"], correct_answer: "Strict error checking", explanation: "'use strict' catches coding errors and prevents unsafe actions.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Difference between == and ===?", options: ["Same", "=== checks type+value, == only value", "== is faster", "=== deprecated"], correct_answer: "=== checks type+value, == only value", explanation: "=== is strict equality (no type coercion), == allows type coercion.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is the event loop?", options: ["A for loop", "Async operation handler", "DOM handler", "Debugger"], correct_answer: "Async operation handler", explanation: "The event loop processes async callbacks from the task queue.", difficulty_level: "Hard", type: "MCQ" },
    ],
    react: [
        { question: "What is the virtual DOM?", options: ["In-memory DOM for fast updates", "Browser extension", "SSR tool", "CSS framework"], correct_answer: "In-memory DOM for fast updates", explanation: "React diffs virtual DOM and updates only changed real DOM parts.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Which hook handles side effects?", options: ["useState", "useEffect", "useContext", "useReducer"], correct_answer: "useEffect", explanation: "useEffect runs side effects like API calls after render.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Purpose of keys in lists?", options: ["CSS styling", "Efficient re-render IDs", "Event binding", "State mgmt"], correct_answer: "Efficient re-render IDs", explanation: "Keys help React track which items changed for efficient updates.", difficulty_level: "Medium", type: "MCQ" },
        { question: "Difference between state and props?", options: ["Same", "State internal, props from parent", "Props mutable, state not", "State for styling"], correct_answer: "State internal, props from parent", explanation: "State is component-owned and mutable. Props are parent-passed and read-only.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is React.memo?", options: ["Memory storage", "Prevents unnecessary re-renders", "Developer notes", "Memory manager"], correct_answer: "Prevents unnecessary re-renders", explanation: "React.memo skips re-rendering when props haven't changed.", difficulty_level: "Medium", type: "MCQ" },
    ],
    'data structures': [
        { question: "Time complexity of balanced BST search?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct_answer: "O(log n)", explanation: "Each comparison halves the remaining nodes.", difficulty_level: "Medium", type: "MCQ" },
        { question: "Which structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correct_answer: "Queue", explanation: "Queue: First-In-First-Out.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is a hash collision?", options: ["Two keys same index", "Table overflow", "Data corruption", "Deletion fail"], correct_answer: "Two keys same index", explanation: "Different keys producing the same hash value.", difficulty_level: "Medium", type: "MCQ" },
        { question: "Worst-case QuickSort complexity?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], correct_answer: "O(n²)", explanation: "Worst case when pivot is always min/max element.", difficulty_level: "Medium", type: "MCQ" },
        { question: "BFS uses which structure?", options: ["Stack", "Queue", "Heap", "Array"], correct_answer: "Queue", explanation: "BFS explores level-by-level using a queue.", difficulty_level: "Easy", type: "MCQ" },
    ],
    dbms: [
        { question: "What does ACID stand for?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Automated, Centralized, Indexed, Distributed", "None"], correct_answer: "Atomicity, Consistency, Isolation, Durability", explanation: "ACID ensures reliable database transactions.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is normalization?", options: ["Increase redundancy", "Reduce redundancy", "Add indexes", "Encrypt data"], correct_answer: "Reduce redundancy", explanation: "Normalization organizes data to minimize redundancy.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What is a foreign key?", options: ["Ref to another table's PK", "From another DB", "Encrypted key", "Unique ID"], correct_answer: "Ref to another table's PK", explanation: "FK references another table's primary key for relationships.", difficulty_level: "Easy", type: "MCQ" },
        { question: "DELETE vs TRUNCATE?", options: ["Same", "DELETE row-by-row+rollback, TRUNCATE all+no rollback", "TRUNCATE slower", "DELETE drops table"], correct_answer: "DELETE row-by-row+rollback, TRUNCATE all+no rollback", explanation: "DELETE is logged and reversible, TRUNCATE is faster but irreversible.", difficulty_level: "Medium", type: "MCQ" },
        { question: "Which join returns all rows from both tables?", options: ["INNER", "LEFT", "FULL OUTER", "CROSS"], correct_answer: "FULL OUTER", explanation: "FULL OUTER JOIN includes all rows with NULLs for non-matches.", difficulty_level: "Medium", type: "MCQ" },
    ],
    os: [
        { question: "What is a deadlock?", options: ["Fast process", "Circular resource wait", "Scheduling type", "Memory overflow"], correct_answer: "Circular resource wait", explanation: "Processes waiting for resources held by each other.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What does CPU scheduler decide?", options: ["Memory alloc", "Which process gets CPU", "Disk priority", "Bandwidth"], correct_answer: "Which process gets CPU", explanation: "Selects which ready process runs next.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is virtual memory?", options: ["Physical RAM", "Disk extends RAM", "Cache", "GPU memory"], correct_answer: "Disk extends RAM", explanation: "Uses disk to extend available memory beyond physical RAM.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What is thrashing?", options: ["Fast execution", "Excessive page faults", "CPU overheat", "Network issue"], correct_answer: "Excessive page faults", explanation: "System spends more time swapping than executing.", difficulty_level: "Hard", type: "MCQ" },
        { question: "Which algorithm causes starvation?", options: ["Round Robin", "FCFS", "SJF", "Multilevel"], correct_answer: "SJF", explanation: "SJF starves long processes as shorter ones get priority.", difficulty_level: "Medium", type: "MCQ" },
    ],
    networking: [
        { question: "TCP operates at which OSI layer?", options: ["Application", "Transport", "Network", "Data Link"], correct_answer: "Transport", explanation: "TCP is Layer 4 — Transport Layer.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What does DNS do?", options: ["File transfer", "Domain to IP translation", "Email routing", "Encryption"], correct_answer: "Domain to IP translation", explanation: "DNS resolves domain names to IP addresses.", difficulty_level: "Easy", type: "MCQ" },
        { question: "TCP vs UDP?", options: ["Same", "TCP reliable+handshake, UDP fast+no handshake", "UDP more reliable", "TCP connectionless"], correct_answer: "TCP reliable+handshake, UDP fast+no handshake", explanation: "TCP has 3-way handshake for reliability. UDP is connectionless and faster.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What is a subnet mask?", options: ["Encryption", "Divides network/host in IP", "Email routing", "Compression"], correct_answer: "Divides network/host in IP", explanation: "Determines network vs host portion of an IP address.", difficulty_level: "Medium", type: "MCQ" },
        { question: "HTTPS default port?", options: ["80", "443", "22", "8080"], correct_answer: "443", explanation: "HTTPS uses port 443 for encrypted web traffic.", difficulty_level: "Easy", type: "MCQ" },
    ],
    'machine learning': [
        { question: "What is overfitting?", options: ["Good on train, bad on test", "Model too simple", "Slow training", "Too few features"], correct_answer: "Good on train, bad on test", explanation: "Model memorizes training data noise, fails to generalize.", difficulty_level: "Easy", type: "MCQ" },
        { question: "Purpose of cross-validation?", options: ["Data cleaning", "Evaluate on unseen data", "Feature selection", "Data augmentation"], correct_answer: "Evaluate on unseen data", explanation: "Tests model on different data folds for robust evaluation.", difficulty_level: "Medium", type: "MCQ" },
        { question: "Spam detection is what type of problem?", options: ["Regression", "Classification", "Clustering", "Dim Reduction"], correct_answer: "Classification", explanation: "Binary classification: spam or not spam.", difficulty_level: "Easy", type: "MCQ" },
        { question: "What does gradient descent minimize?", options: ["Training data", "Loss function", "Features", "Learning rate"], correct_answer: "Loss function", explanation: "Iteratively adjusts parameters to minimize the cost/loss.", difficulty_level: "Medium", type: "MCQ" },
        { question: "What is bias-variance tradeoff?", options: ["Accuracy vs speed", "Underfitting vs overfitting balance", "Features vs labels", "Train vs test split"], correct_answer: "Underfitting vs overfitting balance", explanation: "High bias=underfit, high variance=overfit. Goal: find the balance.", difficulty_level: "Hard", type: "MCQ" },
    ],
};

function getFallbackQuestions(topic: string): ExamQuestion[] {
    const lower = topic.toLowerCase();
    if (FALLBACK_QUESTION_BANKS[lower]) return [...FALLBACK_QUESTION_BANKS[lower]];
    for (const [key, questions] of Object.entries(FALLBACK_QUESTION_BANKS)) {
        if (lower.includes(key) || key.includes(lower)) return [...questions];
    }
    const keywords: Record<string, string> = {
        'js': 'javascript', 'node': 'javascript', 'typescript': 'javascript',
        'py': 'python', 'django': 'python', 'flask': 'python',
        'sql': 'dbms', 'database': 'dbms', 'mysql': 'dbms', 'postgres': 'dbms',
        'operating system': 'os', 'linux': 'os',
        'network': 'networking', 'tcp': 'networking', 'http': 'networking',
        'ai': 'machine learning', 'ml': 'machine learning', 'deep learning': 'machine learning',
        'dsa': 'data structures', 'algorithm': 'data structures',
        'web': 'react', 'frontend': 'react', 'html': 'react',
    };
    for (const [kw, bank] of Object.entries(keywords)) {
        if (lower.includes(kw)) return [...FALLBACK_QUESTION_BANKS[bank]];
    }
    return [...FALLBACK_QUESTION_BANKS['data structures']];
}

export async function generateExamQuestions(topic: string, semester: string = 'General'): Promise<ExamResult | null> {
    if (!GROQ_KEY && !GEMINI_KEY) {
        console.warn('[Exam] No LLM keys, using fallback');
        const questions = getFallbackQuestions(topic);
        questions.sort(() => Math.random() - 0.5);
        return { questions };
    }

    try {
        const randomSeed = Math.floor(Math.random() * 100000);

        const prompt = `You are a VTU (Visvesvaraya Technological University) exam question paper generator.
Generate 10 UNIQUE exam-style questions on "${topic}" for ${semester} VTU engineering students.

CONTEXT:
- Follow VTU exam pattern: Module-wise, theory + application mix
- Questions should match VTU B.E./B.Tech difficulty level
- Include questions similar to VTU previous year papers for "${topic}"
- Use randomization seed ${randomSeed}

REQUIREMENTS:
- 6 MCQ (exactly 4 options each)
- 2 Short Answer (options = empty array [])
- 2 Application-based (options = empty array [])
- Mix: 3 Easy, 4 Medium, 3 Hard
- Questions MUST be about "${topic}" — no unrelated topics

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "string",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "exact text of correct option",
      "explanation": "detailed VTU-style explanation",
      "difficulty_level": "Easy|Medium|Hard",
      "type": "MCQ|Short Answer|Application"
    }
  ]
}`;

        const rawText = await callLLM(prompt, 0.9, 3000);
        const parsed = extractJSON(rawText);

        if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
            throw new Error('API returned no questions');
        }

        // MCQs first (work best with quiz UI)
        const mcqs = parsed.questions.filter((q: ExamQuestion) => q.options && q.options.length >= 4);
        const others = parsed.questions.filter((q: ExamQuestion) => !q.options || q.options.length < 4);

        return { questions: [...mcqs, ...others].slice(0, 10) };

    } catch (err: any) {
        console.error('[LLM] Exam Gen error:', err);
        console.warn(`[Exam] Falling back to question bank for "${topic}"`);
        const questions = getFallbackQuestions(topic);
        questions.sort(() => Math.random() - 0.5);
        return { questions };
    }
}


// Re-using HF interface for consistency
export async function analyzeDocumentWithGemini(fileText: string, userContext: string = ''): Promise<HFAnalysisResult | null> {
    if (!GEMINI_KEY) {
        console.warn('[Gemini] No API key found. Set VITE_GEMINI_API_KEY in .env');
        return null;
    }

    try {
        console.log('[Gemini] Starting document analysis...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

        // Much stronger prompt for Gemini
        const prompt = `You are a strict, brutally honest, and critical senior career coach and technical reviewer. 
        The user is preparing for: "${userContext || 'General Professional Review'}".
        
        Analyze the following document text. Be extremely critical about vague language, weak verbs, passive voice, formatting inconsistencies, and lack of impact. 
        Do NOT be polite. Point out every single flaw.
        ALSO: Generate 3 tough, specific interview questions based on the content of this document.

        Respond ONLY with valid JSON in this exact format (no markdown code blocks, no extra text):
        {
          "score": <number 0-100, be harsh>,
          "issues": [
            {"type": "grammar|clarity|impact|logic", "text": "<specific, brutal feedback>", "severity": "low|medium|high"}
          ],
          "strengths": ["<strength1>", "<strength2>"],
          "summary": "<one sentence critical summary>",
          "questions": ["<tough question 1>", "<tough question 2>", "<tough question 3>"]
        }

        Document Text:
        ${fileText.substring(0, 15000)} 
        `; // Gemini can handle much larger context than HF

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for more deterministic/strict output
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!res.ok) throw new Error(`Gemini API ${res.status}`);

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('[Gemini] Raw response:', rawText);

        // Clean up markdown code blocks if Gemini adds them
        const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(jsonStr);
        return {
            score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 70,
            issues: Array.isArray(parsed.issues) ? parsed.issues : [],
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            summary: parsed.summary || 'Analysis complete.',
            questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        };

    } catch (err) {
        console.error('[Gemini] Analysis error:', err);
        return null;
    }
}

// =============================================
// 7. Dev.to API (NO key needed)
// Page 4 — Current Trends / Latest articles
// =============================================
export interface DevToArticle {
    id: number;
    title: string;
    url: string;
    coverImage: string | null;
    tags: string[];
    user: { name: string; profileImage: string };
    publishedAt: string;
    readingTime: number;
    reactions: number;
}

export async function fetchDevToArticles(tag: string, limit = 6): Promise<DevToArticle[]> {
    try {
        const url = `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${limit}&top=7`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Dev.to API ${res.status}`);
        const data = await res.json();
        return data.map((a: any) => ({
            id: a.id,
            title: a.title,
            url: a.url,
            coverImage: a.cover_image || a.social_image,
            tags: a.tag_list || [],
            user: { name: a.user.name, profileImage: a.user.profile_image_90 },
            publishedAt: a.readable_publish_date,
            readingTime: a.reading_time_minutes,
            reactions: a.positive_reactions_count,
        }));
    } catch (err) {
        console.error('[Dev.to] Fetch error:', err);
        return [];
    }
}

// =============================================
// 8. Stack Overflow API (key optional)
// Page 4 — Most In-Demand Skills / tags
// =============================================
export interface StackOverflowTag {
    name: string;
    count: number;
}

export async function fetchStackOverflowTags(limit = 10): Promise<StackOverflowTag[]> {
    try {
        const url = `https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`StackOverflow API ${res.status}`);
        const data = await res.json();
        return (data.items || []).map((t: any) => ({
            name: t.name,
            count: t.count,
        }));
    } catch (err) {
        console.error('[StackOverflow] Fetch error:', err);
        return [];
    }
}

// =============================================
// 9. Hugging Face API
// Page 4 (Zero-Failure Zone) — Document analysis
// =============================================
export interface HFAnalysisResult {
    score: number;
    issues: { type: string; text: string; severity: 'low' | 'medium' | 'high' }[];
    strengths: string[];
    summary: string;
    questions?: string[]; // New field for interview prep
}

export async function analyzeDocumentWithHF(fileText: string, userContext: string = ''): Promise<HFAnalysisResult | null> {
    if (!HF_KEY) {
        console.warn('[HuggingFace] No API key found. Set VITE_HUGGINGFACE_API_KEY in .env');
        return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        console.log('[HuggingFace] Starting analysis...');
        // Use text-generation model for document analysis
        const url = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';
        const prompt = `<s>[INST] You are a strict, brutally honest, and critical document reviewer. The user is preparing for: "${userContext || 'General Professional Review'}".
        
        Analyze the document below. Be extremely critical about vague language, weak verbs, passive voice, and formatting. Do NOT be polite. Point out every single flaw.
        ALSO: Generate 3 tough, specific interview questions based on the content of this document.

        Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"score": <number 0-100, be harsh>, "issues": [{"type": "grammar|clarity|impact", "text": "<brutal feedback>", "severity": "low|medium|high"}], "strengths": ["<strength1>", "<strength2>"], "summary": "<one sentence critical summary>", "questions": ["<tough question 1>", "<tough question 2>", "<tough question 3>"]}

Document text (truncated):
${fileText.substring(0, 2000)}
[/INST]</s>`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HF_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_new_tokens: 1500, temperature: 0.7, return_full_text: false },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[HuggingFace] API Error ${res.status}:`, errText);
            throw new Error(`HF API error: ${res.status}`);
        }

        const data = await res.json();
        const rawText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

        console.log('[HuggingFace] Raw response:', rawText);

        if (!rawText) throw new Error('No text generated');

        // Extract JSON from the response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 65,
                    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
                    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                    summary: parsed.summary || 'Document analyzed.',
                    questions: Array.isArray(parsed.questions) ? parsed.questions : [
                        "Can you explain your contribution to this project in more detail?",
                        "What was the biggest challenge you faced here?",
                        "Why did you choose this specific approach?"
                    ],
                };
            } catch (e) {
                console.error('[HuggingFace] JSON Parse error:', e);
            }
        }

        console.warn('[HuggingFace] Failed to parse JSON, falling back to mock.');

        // Fallback: return a basic analysis with randomized score to avoid "same output" feeling
        return {
            score: 68, // Consistent fallback score
            issues: [
                { type: 'clarity', text: 'Some technical terms are undefined or vague.', severity: 'medium' },
                { type: 'impact', text: 'Quantify your achievements (use numbers/metrics).', severity: 'high' },
                { type: 'grammar', text: 'Passive voice usage detected in key sections.', severity: 'low' },
            ],
            strengths: ['Structure is consistent', 'Good use of headings'],
            summary: 'The document is readable but lacks punch. Needs more concrete metrics and active voice. (AI Parsing Fallback)',
            questions: [
                "How would you improve this if you had more time?",
                "What is the most critical part of this document?",
                "Can you simplify the technical explanation in section 2?"
            ]
        };
    } catch (err) {
        console.error('[HuggingFace] Request failed:', err);
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}

// =============================================
// 10. Unsplash API
// Frontend — Dynamic photos for UI
// =============================================
export interface UnsplashPhoto {
    id: string;
    url: string;       // regular size
    thumbUrl: string;
    alt: string;
    photographer: string;
    downloadLink: string;
}

export async function fetchUnsplashPhotos(query: string, count = 6): Promise<UnsplashPhoto[]> {
    if (!UNSPLASH_KEY) {
        console.warn('[Unsplash] No key found. Set VITE_UNSPLASH_ACCESS_KEY in .env');
        return [];
    }
    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
        const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        });
        if (!res.ok) throw new Error(`Unsplash API ${res.status}`);
        const data = await res.json();
        return (data.results || []).map((p: any) => ({
            id: p.id,
            url: p.urls.regular,
            thumbUrl: p.urls.thumb,
            alt: p.alt_description || query,
            photographer: p.user.name,
            downloadLink: p.links.download,
        }));
    } catch (err) {
        console.error('[Unsplash] Fetch error:', err);
        return [];
    }
}

// =============================================
// 11. Pexels API (fallback for Unsplash)
// Frontend — Stock images
// =============================================
export interface PexelsPhoto {
    id: number;
    url: string;
    thumbUrl: string;
    alt: string;
    photographer: string;
}

export async function fetchPexelsPhotos(query: string, count = 6): Promise<PexelsPhoto[]> {
    if (!PEXELS_KEY) {
        console.warn('[Pexels] No key found. Set VITE_PEXELS_API_KEY in .env');
        return [];
    }
    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
        const res = await fetch(url, {
            headers: { Authorization: PEXELS_KEY },
        });
        if (!res.ok) throw new Error(`Pexels API ${res.status}`);
        const data = await res.json();
        return (data.photos || []).map((p: any) => ({
            id: p.id,
            url: p.src.large,
            thumbUrl: p.src.small,
            alt: p.alt || query,
            photographer: p.photographer,
        }));
    } catch (err) {
        console.error('[Pexels] Fetch error:', err);
        return [];
    }
}

// =============================================
// Combo: fetch from Unsplash with Pexels fallback
// =============================================
export async function fetchDynamicPhoto(query: string): Promise<string> {
    // Try Unsplash first
    const unsplash = await fetchUnsplashPhotos(query, 1);
    if (unsplash.length > 0) return unsplash[0].url;

    // Fallback to Pexels
    const pexels = await fetchPexelsPhotos(query, 1);
    if (pexels.length > 0) return pexels[0].url;

    // Ultimate fallback
    return `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800`;
}
