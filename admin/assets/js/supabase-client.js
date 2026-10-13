// Shared Supabase client for every admin page.
// Only the PUBLISHABLE (anon) key belongs here. Never put the service_role key in front-end code.
(function () {
    const SUPABASE_URL = "https://nqzlxhcpildvorrkaroi.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UkOgX2vv_qvTYoQ76Hyreg_lGQn-fv7";

    let client = null;
    let initError = null;

    try {
        if (!window.supabase) {
            throw new Error("Supabase library failed to load.");
        }

        if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_")) {
            throw new Error("Supabase URL / key are still placeholders.");
        }

        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    } catch (error) {
        initError = error;
        console.error("Supabase init error:", error);
    }

    window.AdminApp = { client, initError };
})();