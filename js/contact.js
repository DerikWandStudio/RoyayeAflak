/* =========================================
   CONTACT PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Mobile Menu ---------- */

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mainMenu");

    if (menuBtn && mobileMenu) {

        menuBtn.addEventListener("click", () => {

            const isOpen = mobileMenu.classList.toggle("active");

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


    /* ---------- Header Scroll ---------- */

    const header =
        document.querySelector(".site-header");


    const handleHeaderScroll = () => {

        if (!header) return;

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    };


    handleHeaderScroll();

    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        { passive: true }
    );


    /* ---------- Close Menu On Outside Click ---------- */

    document.addEventListener("click", event => {

        if (!menuBtn || !mobileMenu) return;

        const clickedInsideMenu =
            mobileMenu.contains(event.target);

        const clickedMenuButton =
            menuBtn.contains(event.target);


        if (
            mobileMenu.classList.contains("active") &&
            !clickedInsideMenu &&
            !clickedMenuButton
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

        }

    });

});