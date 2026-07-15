// ============================================================
// supabase.js – Supabase Client Initialization
// ============================================================
// This file creates a single shared Supabase client that all
// other JS files can use. It must be loaded FIRST in index.html
// before any other script.
// ============================================================

const SUPABASE_URL = "https://jjkcyvqotfvtwabdqxnq.supabase.co";

const SUPABASE_KEY = "sb_publishable_R4WRjBXvEFNr14UYE2DoNw_MRFifbiK";

// Create and expose the Supabase client globally.
// window.supabase is provided by the CDN script loaded before this file.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
