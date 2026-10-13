const SUPABASE_URL = "https://nqzlxhcpildvorrkaroi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UkOgX2vv_qvTYoQ76Hyreg_lGQn-fv7";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const message = document.getElementById("login-message");
const togglePassword = document.getElementById("toggle-password");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = type;
}

function clearMessage() {
    message.textContent = "";
    message.className = "";
}

function setLoading(loading) {
    loginButton.disabled = loading;
    loginButton.textContent = loading
        ? "در حال بررسی..."
        : "ورود به پنل مدیریت";
}

togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.textContent = isHidden ? "مخفی کردن" : "نمایش";
    togglePassword.setAttribute("aria-pressed", String(isHidden));
    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
    );

    passwordInput.focus();
});

let client = null;

try {
    const configIsPlaceholder =
        SUPABASE_URL.startsWith("YOUR_") ||
        SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");

    if (!window.supabase) {
        throw new Error("Supabase library failed to load.");
    }

    if (configIsPlaceholder) {
        throw new Error("Supabase URL / key are still placeholders.");
    }

    client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );
} catch (error) {
    console.error("Supabase init error:", error);
}

// Admin login
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    if (!client) {
        showMessage("اتصال به سرویس برقرار نیست. تنظیمات Supabase را بررسی کن.");
        return;
    }

    if (!emailInput.value.trim() || !passwordInput.value) {
        showMessage("ایمیل و رمز عبور را وارد کن.");
        return;
    }

    setLoading(true);

    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: emailInput.value.trim(),
            password: passwordInput.value
        });

        if (error) {
            showMessage("ورود ناموفق بود. ایمیل و رمز عبور را بررسی کن.");
            return;
        }

        if (!data.session || !data.user) {
            showMessage("ورود تأیید نشد. دوباره تلاش کن.");
            return;
        }

        showMessage("ورود موفق بود؛ در حال انتقال...", "success");
        window.location.replace("index.html");

    } catch (error) {
        console.error("Login error:", error);
        showMessage("ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کن.");

    } finally {
        setLoading(false);
    }
});