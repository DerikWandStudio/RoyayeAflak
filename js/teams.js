/* =========================================
   TEAMS PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuBtn =
        document.getElementById("menuBtn");

    const mobileMenu =
        document.getElementById("mainMenu");


    if (menuBtn && mobileMenu) {

        menuBtn.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("active");

            menuBtn.setAttribute(
                "aria-expanded",
                isOpen
            );

            menuBtn.setAttribute(
                "aria-label",
                isOpen
                    ? "بستن منو"
                    : "باز کردن منو"
            );

        });


        const menuLinks =
            mobileMenu.querySelectorAll("a");


        menuLinks.forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("active");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuBtn.setAttribute(
                    "aria-label",
                    "باز کردن منو"
                );

            });

        });


        document.addEventListener("keydown", event => {

            if (
                event.key === "Escape" &&
                mobileMenu.classList.contains("active")
            ) {

                mobileMenu.classList.remove("active");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuBtn.setAttribute(
                    "aria-label",
                    "باز کردن منو"
                );

                menuBtn.focus();

            }

        });

    }



    /* =====================================
       HEADER SCROLL
    ===================================== */

    const header =
        document.querySelector(".site-header");


    const updateHeader =
        () => {

            if (!header) return;

            if (window.scrollY > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        };


    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );



    /* =====================================
       FILTER SYSTEM
    ===================================== */

    const ageButtons =
        document.querySelectorAll(
            "[data-age]"
        );

    const positionButtons =
        document.querySelectorAll(
            "[data-position]"
        );

    const ageCards =
        document.querySelectorAll(
            "[data-age-filter]"
        );

    const playerCards =
        document.querySelectorAll(
            ".player-card"
        );

    const playersEmpty =
        document.getElementById(
            "playersEmpty"
        );


    let activeAge = "all";

    let activePosition = "all";



    /* ---------- Update Players ---------- */

    function updatePlayers() {

        let visiblePlayers = 0;


        playerCards.forEach(card => {

            const cardAge =
                card.dataset.age;

            const cardPosition =
                card.dataset.position;


            const ageMatch =
                activeAge === "all" ||
                cardAge === activeAge;


            const positionMatch =
                activePosition === "all" ||
                cardPosition === activePosition;


            if (
                ageMatch &&
                positionMatch
            ) {

                card.style.display = "";

                visiblePlayers++;

            } else {

                card.style.display = "none";

            }

        });


        if (playersEmpty) {

            playersEmpty.hidden =
                visiblePlayers !== 0;

        }

    }



    /* ---------- Age Filters ---------- */

    ageButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeAge =
                    button.dataset.age;


                ageButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                ageCards.forEach(card => {

                    card.classList.toggle(
                        "active",
                        card.dataset.ageFilter === activeAge
                    );

                });


                updatePlayers();


                if (
                    activeAge !== "all"
                ) {

                    const playersSection =
                        document.getElementById(
                            "players"
                        );

                    if (playersSection) {

                        setTimeout(() => {

                            playersSection.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }, 100);

                    }

                }

            }
        );

    });



    /* ---------- Position Filters ---------- */

    positionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activePosition =
                    button.dataset.position;


                positionButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                updatePlayers();

            }
        );

    });



    /* ---------- Age Cards ---------- */

    ageCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const selectedAge =
                    card.dataset.ageFilter;


                activeAge =
                    selectedAge;


                ageButtons.forEach(button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.age === selectedAge
                    );

                });


                ageCards.forEach(item => {

                    item.classList.toggle(
                        "active",
                        item === card
                    );

                });


                updatePlayers();


                const playersSection =
                    document.getElementById(
                        "players"
                    );


                if (playersSection) {

                    setTimeout(() => {

                        playersSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }, 100);

                }

            }
        );

    });


    /* ---------- Initial State ---------- */

    updatePlayers();

});