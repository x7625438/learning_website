CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    content TEXT,
    summary TEXT,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_progress (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    current_chapter INTEGER DEFAULT 1,
    total_chapters INTEGER DEFAULT 1,
    completed_steps TEXT DEFAULT '[]',
    comprehension_score REAL,
    UNIQUE(book_id, user_id)
);

CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '[]',
    abstract TEXT,
    content TEXT,
    translated_content TEXT,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    theme TEXT,
    language TEXT DEFAULT 'zh',
    author TEXT,
    category TEXT,
    user_id TEXT NOT NULL,
    is_daily INTEGER DEFAULT 0,
    daily_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS problem_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question TEXT NOT NULL,
    subject TEXT,
    current_step INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    user_progress TEXT DEFAULT '[]',
    analysis TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task TEXT,
    duration INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS relaxation_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    messages TEXT DEFAULT '[]',
    mood TEXT DEFAULT 'neutral',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resource_searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    search_strategy TEXT,
    resources TEXT DEFAULT '[]',
    categorized_resources TEXT DEFAULT '{}',
    total_results INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brainstorm_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    messages TEXT DEFAULT '[]',
    synthesis TEXT,
    recommendation TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS essays (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject TEXT,
    grade TEXT,
    feedback TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS error_questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question TEXT NOT NULL,
    user_answer TEXT,
    correct_answer TEXT,
    explanation TEXT,
    subject TEXT,
    difficulty TEXT DEFAULT 'medium',
    mastery_level REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    method TEXT DEFAULT 'free',
    cornell_data TEXT DEFAULT '{}',
    feynman_result TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    next_review_at TEXT,
    review_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
