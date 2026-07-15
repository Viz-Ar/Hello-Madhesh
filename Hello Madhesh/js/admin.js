// ============================================================
// admin.js – Admin Dashboard Logic
// ============================================================
// Handles:
//   - Admin auth guard (role check)
//   - Fetch all reports from Supabase
//   - Render reports table with search + category + status filters
//   - Update report status (Pending → In Progress → Resolved)
//   - Delete report (with confirmation)
//   - Dynamic statistics
//   - Supabase Realtime for live updates
//   - Toast notifications
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
function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
    });
}

function badgeClass(status) {
    if (status === "Pending")     return "pending";
    if (status === "In Progress") return "progress";
    return "resolved";
}

function getInitials(name) {
    if (!name) return "A";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── State ────────────────────────────────────────────────────
let allReports = [];

// ── DOM ──────────────────────────────────────────────────────
const tbody          = document.getElementById("reportsTableBody");
const searchInput    = document.getElementById("adminSearch");
const statusFilter   = document.getElementById("adminStatusFilter");
const categoryFilter = document.getElementById("adminCategoryFilter");

// ── Render Table ─────────────────────────────────────────────
function renderTable(list) {
    if (list.length === 0) {
        tbody.innerHTML = `
        <tr><td colspan="7">
            <div class="admin-empty">
                <i class="fa-solid fa-inbox" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                No reports match your filters.
            </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(report => `
    <tr data-id="${report.id}">
        <td class="td-name">${report.name}</td>
        <td><span class="td-category">${report.category}</span></td>
        <td class="td-district">${report.district}${report.municipality ? `, ${report.municipality}` : ""}</td>
        <td class="td-desc" title="${report.description}">${report.description}</td>
        <td class="td-date">${formatDate(report.created_at)}</td>
        <td>
            <select class="status-select" data-id="${report.id}" onchange="updateStatus(this)">
                <option value="Pending"     ${report.status === "Pending"     ? "selected" : ""}>Pending</option>
                <option value="In Progress" ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
                <option value="Resolved"    ${report.status === "Resolved"    ? "selected" : ""}>Resolved</option>
            </select>
        </td>
        <td>
            <button class="btn-delete" onclick="deleteReport('${report.id}')">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </td>
    </tr>
    `).join("");
}

// ── Update Stats ─────────────────────────────────────────────
function updateStats() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("adminTotal",    allReports.length);
    set("adminPending",  allReports.filter(r => r.status === "Pending").length);
    set("adminProgress", allReports.filter(r => r.status === "In Progress").length);
    set("adminResolved", allReports.filter(r => r.status === "Resolved").length);
}

// ── Apply Filters ─────────────────────────────────────────────
function applyFilters() {
    const keyword  = searchInput.value.toLowerCase().trim();
    const status   = statusFilter.value;
    const category = categoryFilter.value;

    const filtered = allReports.filter(r => {
        const matchSearch =
            !keyword ||
            r.name.toLowerCase().includes(keyword)         ||
            r.district.toLowerCase().includes(keyword)     ||
            r.category.toLowerCase().includes(keyword)     ||
            (r.municipality || "").toLowerCase().includes(keyword);

        const matchStatus   = status   === "all" || r.status   === status;
        const matchCategory = category === "all" || r.category === category;

        return matchSearch && matchStatus && matchCategory;
    });

    renderTable(filtered);
}

// ── Update Status ─────────────────────────────────────────────
async function updateStatus(select) {
    const id        = select.dataset.id;
    const newStatus = select.value;
    const original  = select.getAttribute("data-original") || select.value;

    try {
        const { error } = await supabase
            .from("reports")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) throw error;

        // Update local state
        const report = allReports.find(r => r.id === id);
        if (report) report.status = newStatus;

        updateStats();
        showToast(`✅ Status updated to "${newStatus}"`);

    } catch (err) {
        console.error("[admin.js] Update error:", err.message);
        showToast("❌ Failed to update status.", true);
        select.value = original;
    }
}

// ── Delete Report ─────────────────────────────────────────────
async function deleteReport(id) {
    if (!confirm("Are you sure you want to permanently delete this report?")) return;

    try {
        const { error } = await supabase
            .from("reports")
            .delete()
            .eq("id", id);

        if (error) throw error;

        allReports = allReports.filter(r => r.id !== id);
        updateStats();
        applyFilters();
        showToast("🗑️ Report deleted successfully.");

    } catch (err) {
        console.error("[admin.js] Delete error:", err.message);
        showToast("❌ Failed to delete report.", true);
    }
}

// ── Fetch Reports ─────────────────────────────────────────────
async function fetchAllReports() {
    const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[admin.js] Fetch error:", error.message);
        tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty" style="color:#e74c3c;">Failed to load reports.</div></td></tr>`;
        return;
    }

    allReports = data || [];
    updateStats();
    applyFilters();
}

// ── Realtime ──────────────────────────────────────────────────
function subscribeRealtime() {
    supabase
        .channel("admin-reports-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => {
            fetchAllReports();
        })
        .subscribe();
}

// ── Event Listeners ───────────────────────────────────────────
searchInput.addEventListener("input",    applyFilters);
statusFilter.addEventListener("change",  applyFilters);
categoryFilter.addEventListener("change", applyFilters);

// ── Logout ───────────────────────────────────────────────────
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "admin-login.html";
});

// ── Init ──────────────────────────────────────────────────────
(async () => {
    // Auth guard
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { window.location.href = "admin-login.html"; return; }

    const user = sessionData.session.user;
    const role = user?.user_metadata?.role || "citizen";

    if (role !== "admin") {
        showToast("❌ Access denied.", true);
        setTimeout(() => { window.location.href = "index.html"; }, 1500);
        return;
    }

    // Set admin name in topbar
    const name = user.user_metadata?.full_name || user.email || "Admin";
    const el = document.getElementById("adminName");
    const av = document.getElementById("adminAvatar");
    if (el) el.textContent = name;
    if (av) av.textContent = getInitials(name);

    // Load data
    await fetchAllReports();
    subscribeRealtime();
})();
