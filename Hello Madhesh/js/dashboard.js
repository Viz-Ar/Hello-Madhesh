// ============================================================
// dashboard.js – Community Issues Dashboard
// ============================================================
// Handles:
//   - Fetching reports from Supabase (newest first)
//   - Rendering rich issue cards with image, status, date
//   - Live search across category, district, municipality
//   - Status filter (Pending / In Progress / Resolved)
//   - Dynamic statistics counter (Total, Pending, In Progress, Resolved)
//   - Supabase Realtime subscription for auto-refresh
//   - Loading and empty states
// ============================================================

// ── DOM References ───────────────────────────────────────────
const container   = document.getElementById("issuesContainer");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

// ── State ────────────────────────────────────────────────────
/** @type {Array} Master list of all fetched reports */
let allReports = [];

// ── Utility: Status CSS Class ─────────────────────────────────
/**
 * Returns the CSS class name for a status badge.
 * @param {string} status
 * @returns {string}
 */
function statusClass(status) {
    if (status === "Pending")     return "pending";
    if (status === "In Progress") return "progress";
    if (status === "Resolved")    return "resolved";
    return "pending";
}

// ── Utility: Format Date ──────────────────────────────────────
/**
 * Formats an ISO date string to a human-readable local date.
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
        year  : "numeric",
        month : "short",
        day   : "numeric"
    });
}

// ── Render: Single Card ───────────────────────────────────────
/**
 * Generates the HTML markup for one issue card.
 * @param {Object} report - A row from the `reports` table.
 * @returns {string} HTML string.
 */
function createCard(report) {
    const imageHTML = report.photo_url
        ? `<div class="issue-image"><img src="${report.photo_url}" alt="Issue photo" loading="lazy"></div>`
        : `<div class="issue-image no-image"><i class="fa-solid fa-image"></i></div>`;

    const descShort = report.description.length > 120
        ? report.description.slice(0, 120) + "…"
        : report.description;

    return `
    <div class="issue-card">
        ${imageHTML}
        <div class="issue-card-body">
            <div class="issue-card-top">
                <span class="category-badge">${report.category}</span>
                <span class="status ${statusClass(report.status)}">${report.status}</span>
            </div>
            <p class="issue-description">${descShort}</p>
            <div class="issue-card-meta">
                <span><i class="fa-solid fa-location-dot"></i> ${report.district}${report.municipality ? ", " + report.municipality : ""}</span>
                <span><i class="fa-regular fa-calendar"></i> ${formatDate(report.created_at)}</span>
            </div>
        </div>
    </div>`;
}

// ── Render: Issues Grid ───────────────────────────────────────
/**
 * Renders the given list of reports into the issues grid.
 * Shows an empty-state message when the list is empty.
 * @param {Array} list
 */
function renderIssues(list) {
    if (list.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <p>No issues found.</p>
        </div>`;
        return;
    }
    container.innerHTML = list.map(createCard).join("");
}

// ── Render: Loading State ─────────────────────────────────────
/**
 * Shows a spinner inside the issues grid while data loads.
 */
function showDashboardLoading() {
    container.innerHTML = `
    <div class="dashboard-loading">
        <div class="spinner"></div>
        <p>Loading community issues…</p>
    </div>`;
}

// ── Statistics ────────────────────────────────────────────────
/**
 * Updates the stats counters in the Statistics section
 * based on the current `allReports` array.
 */
function updateStats() {
    const total     = allReports.length;
    const pending   = allReports.filter(r => r.status === "Pending").length;
    const progress  = allReports.filter(r => r.status === "In Progress").length;
    const resolved  = allReports.filter(r => r.status === "Resolved").length;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    set("totalReports",    total);
    set("pendingReports",  pending);
    set("progressReports", progress);
    set("resolvedReports", resolved);
}

// ── Filter & Search ───────────────────────────────────────────
/**
 * Filters `allReports` based on the current search term and status
 * dropdown, then re-renders the grid.
 */
function applyFilters() {
    const keyword = searchInput.value.toLowerCase().trim();
    const status  = statusFilter.value;

    const filtered = allReports.filter(report => {
        // Search: category, district, municipality
        const matchSearch =
            !keyword ||
            report.category.toLowerCase().includes(keyword)     ||
            report.district.toLowerCase().includes(keyword)     ||
            (report.municipality || "").toLowerCase().includes(keyword);

        // Status filter
        const matchStatus =
            status === "all" || report.status === status;

        return matchSearch && matchStatus;
    });

    renderIssues(filtered);
}

// ── Fetch Reports from Supabase ───────────────────────────────
/**
 * Loads all reports from the `reports` table ordered by newest first.
 * Updates the global `allReports` array, refreshes stats, and renders.
 */
async function fetchReports() {
    showDashboardLoading();

    const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[dashboard.js] Fetch error:", error.message);
        container.innerHTML = `
        <div class="empty-state error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>Failed to load issues. Please check your connection.</p>
        </div>`;
        return;
    }

    allReports = data || [];
    updateStats();
    applyFilters();
}

// ── Realtime Subscription ─────────────────────────────────────
/**
 * Subscribes to Supabase Realtime on the `reports` table.
 * Whenever any INSERT happens, re-fetches and refreshes the dashboard.
 */
function subscribeRealtime() {
    supabase
        .channel("reports-channel")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "reports" },
            (payload) => {
                console.log("[dashboard.js] Realtime INSERT:", payload.new);
                // Prepend the new report to the top and refresh
                allReports.unshift(payload.new);
                updateStats();
                applyFilters();
            }
        )
        .subscribe((status) => {
            console.log("[dashboard.js] Realtime status:", status);
        });
}

// ── Event Listeners ───────────────────────────────────────────
searchInput.addEventListener("input",  applyFilters);
statusFilter.addEventListener("change", applyFilters);

// ── Initialise ────────────────────────────────────────────────
fetchReports();
subscribeRealtime();