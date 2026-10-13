
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const client = window.supabase.createClient(
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
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "مخفی کردن" : "نمایش";
    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
    );
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
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
        showMessage(
            "ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کن."
        );
    } finally {
        setLoading(false);
    }
});
