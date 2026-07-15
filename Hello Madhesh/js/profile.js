// ============================================================
// profile.js – Citizen Profile Page
// ============================================================
// Handles:
//   - Auth guard (redirect to login if not signed in)
//   - Display user info (name, email, phone, avatar initials)
//   - Fetch only this user's reports from Supabase
//   - Display per-user stats (total, pending, in progress, resolved)
//   - Render "My Reports" cards
//   - Logout
// ============================================================

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, err = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.background = err ? "#e74c3c" : "#27ae60";
    t.style.opacity = 1;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = 0; }, 3500);
}

// ── Helpers ──────────────────────────────────────────────────
function statusClass(s) {
    if (s === "Pending")     return "pending";
    if (s === "In Progress") return "progress";
    return "resolved";
}

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
    });
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Render a single report card ───────────────────────────────
function createMyCard(report) {
    const img = report.photo_url
        ? `<img src="${report.photo_url}" alt="Report photo" loading="lazy">`
        : `<i class="fa-solid fa-image"></i>`;

    const desc = report.description.length > 100
        ? report.description.slice(0, 100) + "…"
        : report.description;

    return `
    <div class="my-report-card">
        <div class="my-report-image">${img}</div>
        <div class="my-report-body">
            <div class="my-report-top">
                <span class="cat-badge">${report.category}</span>
                <span class="status ${statusClass(report.status)}">${report.status}</span>
            </div>
            <p class="my-report-desc">${desc}</p>
            <div class="my-report-meta">
                <span><i class="fa-solid fa-location-dot"></i>${report.district}</span>
                <span><i class="fa-regular fa-calendar"></i>${formatDate(report.created_at)}</span>
            </div>
        </div>
    </div>`;
}

// ── Main init ─────────────────────────────────────────────────
(async () => {
    // 1. Auth guard
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
        window.location.href = "login.html";
        return;
    }

    const user     = sessionData.session.user;
    const meta     = user.user_metadata || {};
    const fullName = meta.full_name || "Citizen";
    const phone    = meta.phone    || "Not provided";
    const email    = user.email    || "";

    // 2. Populate profile header
    document.getElementById("profileName").textContent  = fullName;
    document.getElementById("profileEmail").textContent = email;
    document.getElementById("profilePhone").textContent = phone;
    document.getElementById("avatarCircle").textContent = getInitials(fullName);

    // 3. Fetch this user's reports (matched by name — see note below)
    // NOTE: Since we're using Supabase anonymous insert (no user_id column yet),
    // we match by the name field. In Phase 5 you can add a user_id column.
    const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .eq("name", fullName)
        .order("created_at", { ascending: false });

    const grid = document.getElementById("myReportsGrid");

    if (error) {
        console.error("[profile.js] Fetch error:", error.message);
        grid.innerHTML = `<div class="empty-msg"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load reports.</p></div>`;
        return;
    }

    // 4. Update stats
    const total    = reports.length;
    const pending  = reports.filter(r => r.status === "Pending").length;
    const progress = reports.filter(r => r.status === "In Progress").length;
    const resolved = reports.filter(r => r.status === "Resolved").length;

    document.getElementById("myTotal").textContent    = total;
    document.getElementById("myPending").textContent  = pending;
    document.getElementById("myProgress").textContent = progress;
    document.getElementById("myResolved").textContent = resolved;

    // 5. Render cards
    if (total === 0) {
        grid.innerHTML = `
        <div class="empty-msg">
            <i class="fa-solid fa-inbox"></i>
            <p>You haven't submitted any reports yet.</p>
        </div>`;
        return;
    }

    grid.innerHTML = reports.map(createMyCard).join("");
})();

// ── Logout ───────────────────────────────────────────────────
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
});
