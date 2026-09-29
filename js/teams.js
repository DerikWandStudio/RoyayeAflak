/* =========================================
   TEAMS PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mainMenu");

    if (menuBtn && mobileMenu) {

        const setMenu = (open) => {
            mobileMenu.classList.toggle("active", open);
            menuBtn.setAttribute("aria-expanded", String(open));
            menuBtn.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
        };

        menuBtn.addEventListener("click", () => {
            setMenu(!mobileMenu.classList.contains("active"));
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => setMenu(false));
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
                setMenu(false);
                menuBtn.focus();
            }
        });

    }


    /* =====================================
       HEADER SCROLL
    ===================================== */

    const header = document.querySelector(".site-header");

    const updateHeader = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 30);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });


    /* =====================================
       FILTER SYSTEM
    ===================================== */

    // فقط دکمه‌های فیلتر (نه کارت بازیکن‌ها که آن‌ها هم data-age دارند)
    const ageButtons = document.querySelectorAll(".filter-btn[data-age]");
    const positionButtons = document.querySelectorAll(".filter-btn[data-position]");
    const ageCards = document.querySelectorAll("[data-age-filter]");
    const playerCards = document.querySelectorAll(".player-card");
    const playersEmpty = document.getElementById("playersEmpty");
    const playersSection = document.getElementById("players");

    let activeAge = "all";
    let activePosition = "all";


    /* ---------- Helpers ---------- */

    function scrollToPlayers() {
        if (!playersSection) return;
        setTimeout(() => {
            playersSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }

    function syncAgeUI() {
        ageButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.age === activeAge);
        });
        ageCards.forEach(card => {
            card.classList.toggle("active", card.dataset.ageFilter === activeAge);
        });
    }


    /* ---------- Update Players ---------- */

    function updatePlayers() {

        let visiblePlayers = 0;

        playerCards.forEach(card => {

            const ageMatch =
                activeAge === "all" ||
                card.dataset.age === activeAge;

            const positionMatch =
                activePosition === "all" ||
                card.dataset.position === activePosition;

            if (ageMatch && positionMatch) {
                card.style.display = "";
                visiblePlayers++;
            } else {
                card.style.display = "none";
            }

        });

        if (playersEmpty) {
            playersEmpty.hidden = visiblePlayers !== 0;
        }

    }


    /* ---------- Age Filters (buttons) ---------- */

    ageButtons.forEach(button => {
        button.addEventListener("click", () => {

            activeAge = button.dataset.age;

            syncAgeUI();
            updatePlayers();

            if (activeAge !== "all") {
                scrollToPlayers();
            }

        });
    });


    /* ---------- Position Filters ---------- */

    positionButtons.forEach(button => {
        button.addEventListener("click", () => {

            activePosition = button.dataset.position;

            positionButtons.forEach(btn => {
                btn.classList.toggle("active", btn === button);
            });

            updatePlayers();

        });
    });


    /* ---------- Age Cards ---------- */

    ageCards.forEach(card => {
        card.addEventListener("click", () => {

            activeAge = card.dataset.ageFilter;

            syncAgeUI();
            updatePlayers();
            scrollToPlayers();

        });
    });


    /* ---------- Deep Link From URL ---------- */

    const ageFromUrl = new URLSearchParams(window.location.search).get("age");

    if (ageFromUrl) {

        const matchingButton = Array.from(ageButtons).find(
            btn => btn.dataset.age === ageFromUrl
        );

        if (matchingButton) {
            matchingButton.click();
        }

    }


    /* ---------- Initial State ---------- */

    updatePlayers();

});