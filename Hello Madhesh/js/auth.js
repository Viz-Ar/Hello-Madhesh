// ============================================================
// auth.js – Supabase Authentication Logic
// ============================================================
// Handles:
//   - User Registration (email + password)
//   - User Login (email + password)
//   - Session persistence (remember me)
//   - Logout
//   - Session guard (redirect if already logged in)
//   - Password strength meter
//   - Field-level validation
//   - Toast notifications
// ============================================================

// ── Toast ────────────────────────────────────────────────────
/**
 * Shows a toast notification.
 * @param {string} msg   Message text.
 * @param {boolean} err  True = red error toast.
 */
function showToast(msg, err = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.background = err ? "#e74c3c" : "#27ae60";
    t.style.opacity = 1;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = 0; }, 3800);
}

// ── Button loading state ──────────────────────────────────────
function setBtnLoading(btn, loading, originalText) {
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait…" : originalText;
}

// ── Field error helper ────────────────────────────────────────
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (input) input.classList.add("error");
    if (err)   { err.textContent = message; err.classList.add("show"); }
}

function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(e => {
        e.classList.remove("show"); e.textContent = "";
    });
    document.querySelectorAll("input.error").forEach(i => {
        i.classList.remove("error");
    });
}

// ── Password visibility toggle ────────────────────────────────
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const input    = document.getElementById(targetId);
        if (!input) return;
        const isText = input.type === "text";
        input.type = isText ? "password" : "text";
        btn.querySelector("i").className = isText
            ? "fa-solid fa-eye"
            : "fa-solid fa-eye-slash";
    });
});

// ── Password strength meter ───────────────────────────────────
const passwordInput = document.getElementById("password");
if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        const bar  = document.getElementById("strengthBar");
        const fill = document.getElementById("strengthFill");
        const text = document.getElementById("strengthText");
        if (!bar) return;

        const val = passwordInput.value;
        bar.classList.toggle("show", val.length > 0);

        let score = 0;
        if (val.length >= 8)         score++;
        if (/[A-Z]/.test(val))       score++;
        if (/[0-9]/.test(val))       score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { width: "25%",  bg: "#e74c3c", label: "Weak" },
            { width: "50%",  bg: "#f39c12", label: "Fair" },
            { width: "75%",  bg: "#3498db", label: "Good" },
            { width: "100%", bg: "#27ae60", label: "Strong" },
        ];
        const level = levels[score - 1] || levels[0];
        fill.style.width      = val.length > 0 ? level.width : "0";
        fill.style.background = level.bg;
        if (text) {
            text.textContent = val.length > 0 ? `Strength: ${level.label}` : "";
            text.style.color = level.bg;
        }
    });
}

// ============================================================
// REGISTRATION
// ============================================================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const fullName    = document.getElementById("fullName").value.trim();
        const phone       = document.getElementById("phone").value.trim();
        const email       = document.getElementById("email").value.trim();
        const password    = document.getElementById("password").value;
        const confirmPass = document.getElementById("confirmPassword").value;
        const btn         = registerForm.querySelector(".btn-primary");

        // ── Validation ────────────────────────────────────────
        let valid = true;

        if (!fullName) {
            showFieldError("fullName", "fullNameError", "Full name is required.");
            valid = false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError("email", "emailError", "Enter a valid email address.");
            valid = false;
        }

        if (!password || password.length < 6) {
            showFieldError("password", "passwordError", "Password must be at least 6 characters.");
            valid = false;
        }

        if (password !== confirmPass) {
            showFieldError("confirmPassword", "confirmPasswordError", "Passwords do not match.");
            valid = false;
        }

        if (!valid) return;

        // ── Supabase Sign Up ──────────────────────────────────
        setBtnLoading(btn, true, "Create Account");

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name : fullName,
                        phone     : phone || null,
                        role      : "citizen"
                    }
                }
            });

            if (error) throw error;

            showToast("✅ Account created! Check your email to verify.");
            registerForm.reset();

            // Redirect to login after 2 seconds
            setTimeout(() => { window.location.href = "login.html"; }, 2200);

        } catch (err) {
            console.error("[auth.js] Register error:", err);
            showToast(`❌ ${err.message}`, true);
        } finally {
            setBtnLoading(btn, false, "Create Account");
        }
    });
}

// ============================================================
// LOGIN
// ============================================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const remember = document.getElementById("rememberMe")?.checked ?? false;
        const btn      = loginForm.querySelector(".btn-primary");

        // ── Validation ────────────────────────────────────────
        let valid = true;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError("email", "emailError", "Enter a valid email address.");
            valid = false;
        }

        if (!password) {
            showFieldError("password", "passwordError", "Password is required.");
            valid = false;
        }

        if (!valid) return;

        // ── Supabase Sign In ──────────────────────────────────
        setBtnLoading(btn, true, "Sign In");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const user = data.user;
            const role = user?.user_metadata?.role || "citizen";

            showToast("✅ Welcome back!");

            // Redirect based on role
            setTimeout(() => {
                if (role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "profile.html";
                }
            }, 1000);

        } catch (err) {
            console.error("[auth.js] Login error:", err);
            showToast(`❌ ${err.message}`, true);
        } finally {
            setBtnLoading(btn, false, "Sign In");
        }
    });
}

// ============================================================
// ADMIN LOGIN
// ============================================================
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const btn      = adminLoginForm.querySelector(".btn-primary");

        if (!email || !password) {
            showToast("❌ Email and password are required.", true);
            return;
        }

        setBtnLoading(btn, true, "Sign In as Admin");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const role = data.user?.user_metadata?.role || "citizen";

            if (role !== "admin") {
                // Sign out immediately — not an admin
                await supabase.auth.signOut();
                showToast("❌ Access denied. This portal is for admins only.", true);
                return;
            }

            showToast("✅ Admin login successful!");
            setTimeout(() => { window.location.href = "admin.html"; }, 1000);

        } catch (err) {
            console.error("[auth.js] Admin login error:", err);
            showToast(`❌ ${err.message}`, true);
        } finally {
            setBtnLoading(btn, false, "Sign In as Admin");
        }
    });
}

// ============================================================
// SESSION GUARD
// ============================================================
/**
 * Call this on protected pages to redirect unauthenticated users.
 * @param {string} redirectTo  URL to redirect to if not logged in.
 */
async function requireAuth(redirectTo = "login.html") {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = redirectTo;
    }
    return data.session;
}

/**
 * Call this on protected admin pages to check for admin role.
 */
async function requireAdmin() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { window.location.href = "admin-login.html"; return null; }
    const role = data.session.user?.user_metadata?.role || "citizen";
    if (role !== "admin") { window.location.href = "index.html"; return null; }
    return data.session;
}

// ============================================================
// LOGOUT
// ============================================================
/**
 * Signs out the current user and redirects to the home page.
 */
async function logout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// Wire up any logout button on the page
document.querySelectorAll("[data-action='logout']").forEach(btn => {
    btn.addEventListener("click", logout);
});
