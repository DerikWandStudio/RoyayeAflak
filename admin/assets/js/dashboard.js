(function () {
    const app = window.AdminApp;

    const statusBox = document.getElementById("status-box");
    const userBox = document.getElementById("admin-user");
    const emailLabel = document.getElementById("admin-email");
    const logoutButton = document.getElementById("logout-button");
    const quickLinks = document.getElementById("quick-links");

    function showError(text) {
        statusBox.className = "status-box error";
        statusBox.textContent = text + " ";

        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "btn";
        retry.textContent = "تلاش دوباره";
        retry.addEventListener("click", init);

        statusBox.appendChild(document.createElement("br"));
        statusBox.appendChild(retry);
    }

    async function init() {
        statusBox.className = "status-box";
        statusBox.textContent = "در حال بررسی دسترسی...";

        if (!app || !app.client) {
            showError("اتصال به سرویس برقرار نیست. تنظیمات Supabase را بررسی کن.");
            return;
        }

        try {
            const session = await app.auth.requireAdmin();

            // null means a redirect to the login page has started
            if (!session) return;

            // textContent keeps the email from being interpreted as HTML
            emailLabel.textContent = session.user.email || "";
            userBox.hidden = false;
            quickLinks.hidden = false;
            statusBox.hidden = true;
        } catch (error) {
            console.error("Dashboard init error:", error);
            showError("ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کن.");
        }
    }

    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        await app.auth.signOut();
        app.auth.goToLogin();
    });

    init();
})();