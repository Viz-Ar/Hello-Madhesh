// ============================================================
// report.js – Report Issue Form Handler
// ============================================================
// Handles:
//   - Form field validation
//   - Image upload to Supabase Storage (report-images bucket)
//   - Report insert into Supabase `reports` table
//   - Loading states during async operations
//   - Toast notifications for success and error
// ============================================================

// ── Toast Utility ────────────────────────────────────────────
/**
 * Shows a toast notification at the bottom-right of the screen.
 * @param {string} message - The message to display.
 * @param {boolean} isError - If true, shows a red error toast. Default false.
 */
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.background = isError ? "#e74c3c" : "#27ae60";
    toast.style.opacity = 1;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = 0;
    }, 3500);
}

// ── Loading State Utility ────────────────────────────────────
/**
 * Shows or hides the full-screen loading overlay.
 * @param {boolean} show - True to show, false to hide.
 * @param {string} text - Optional status text to display.
 */
function setLoading(show, text = "Loading...") {
    const overlay = document.getElementById("loadingOverlay");
    const label = document.getElementById("loadingLabel");
    if (!overlay) return;
    if (label) label.textContent = text;
    overlay.style.display = show ? "flex" : "none";
}

// ── DOM References ───────────────────────────────────────────
const form            = document.getElementById("issueForm");
const submitBtn       = form.querySelector("button[type='submit']");
const photoInput      = document.getElementById("photo");

// ── Image Upload ─────────────────────────────────────────────
/**
 * Uploads a photo to the Supabase `report-images` storage bucket.
 * Returns the public URL of the uploaded image, or null if no file chosen.
 * Throws an error if upload fails.
 * @param {File} file - The image file from the file input.
 * @returns {Promise<string|null>} Public URL or null.
 */
async function uploadPhoto(file) {
    if (!file) return null;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
        throw new Error("Invalid image type. Please upload JPG, PNG, WEBP, or GIF.");
    }

    // Validate file size (max 5 MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`Image too large. Maximum size is ${MAX_SIZE_MB}MB.`);
    }

    // Create a unique file path using timestamp + original name
    const ext       = file.name.split(".").pop();
    const fileName  = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath  = `public/${fileName}`;

    setLoading(true, "Uploading image...");

    const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

    // Retrieve the public URL for the uploaded file
    const { data } = supabase.storage
        .from("report-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// ── Form Submit Handler ──────────────────────────────────────
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ── Read form values ──────────────────────────────────────
    const name         = document.getElementById("name").value.trim();
    const phone        = document.getElementById("phone").value.trim();
    const district     = document.getElementById("district").value.trim();
    const municipality = document.getElementById("municipality").value.trim();
    const ward         = document.getElementById("ward").value.trim();
    const category     = document.getElementById("category").value;
    const description  = document.getElementById("description").value.trim();
    const photoFile    = photoInput.files[0] || null;

    // ── Client-side validation ────────────────────────────────
    if (!name) {
        showToast("⚠️ Full Name is required.", true);
        return;
    }
    if (!district) {
        showToast("⚠️ District is required.", true);
        return;
    }
    if (!municipality) {
        showToast("⚠️ Municipality is required.", true);
        return;
    }
    if (!category) {
        showToast("⚠️ Please select an Issue Category.", true);
        return;
    }
    if (!description) {
        showToast("⚠️ Description is required.", true);
        return;
    }

    // ── Disable button to prevent double-submit ───────────────
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        // ── Step 1: Upload image (if provided) ────────────────
        let photo_url = null;
        if (photoFile) {
            photo_url = await uploadPhoto(photoFile);
        }

        // ── Step 2: Insert report into Supabase ───────────────
        setLoading(true, "Saving report...");

        const { error: insertError } = await supabase
            .from("reports")
            .insert([{
                name,
                phone        : phone || null,
                district,
                municipality,
                ward         : ward || null,
                category,
                description,
                photo_url,
                status       : "Pending"
            }]);

        if (insertError) throw new Error(`Failed to save report: ${insertError.message}`);

        // ── Step 3: Success ───────────────────────────────────
        showToast("✅ Your report has been submitted successfully!");
        form.reset();

    } catch (err) {
        console.error("[report.js] Submit error:", err);
        showToast(`❌ ${err.message}`, true);
    } finally {
        // Always restore the button and hide loading
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Report";
        setLoading(false);
    }
});