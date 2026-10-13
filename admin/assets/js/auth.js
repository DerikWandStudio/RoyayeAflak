// Authentication + authorization helpers.
// Authentication = "who are you" (Supabase Auth session).
// Authorization  = "are you an admin" (checked on the server through the is_admin() SQL function).
// The real protection is RLS in the database; this file only controls navigation and UX.
(function () {
    const app = window.AdminApp;
    const LOGIN_PAGE = "login.html";
    const DASHBOARD_PAGE = "index.html";

    function goToLogin(reason) {
        const url = reason ? LOGIN_PAGE + "?reason=" + encodeURIComponent(reason) : LOGIN_PAGE;
        window.location.replace(url);
    }

    function goToDashboard() {
        window.location.replace(DASHBOARD_PAGE);
    }

    async function getSession() {
        const { data, error } = await app.client.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    // Asks the database whether the signed-in user is listed in admin_users.
    async function isAdmin() {
        const { data, error } = await app.client.rpc("is_admin");
        if (error) throw error;
        return data === true;
    }

    async function signOut() {
        try {
            await app.client.auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }

    // Use on every protected page.
    // Returns the session when the user is a signed-in admin.
    // Returns null after starting a redirect to the login page.
    // Throws on network / service errors so the page can show a retry message instead of a blank screen.
    async function requireAdmin() {
        const session = await getSession();

        if (!session) {
            goToLogin();
            return null;
        }

        if (!(await isAdmin())) {
            // Signing out first guarantees the login page will not bounce the user back here.
            await signOut();
            goToLogin("forbidden");
            return null;
        }

        app.client.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                goToLogin();
            }
        });

        return session;
    }

    app.auth = { goToLogin, goToDashboard, getSession, isAdmin, signOut, requireAdmin };
})();
