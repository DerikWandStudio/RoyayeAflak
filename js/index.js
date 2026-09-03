/* =========================================
   MOBILE MENU
========================================= */

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


    /* Close menu after clicking a link */

    const menuLinks = mobileMenu.querySelectorAll("a");

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


    /* Close menu with Escape */

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


/* =========================================
   STAT COUNTERS
========================================= */

const counters = document.querySelectorAll(
    ".stat-number[data-number]"
);


function animateCounter(counter) {

    const target = Number(
        counter.dataset.number
    );

    const duration = 1600;

    const startTime = performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(elapsed / duration, 1);


        /* Ease out */

        const eased =
            1 - Math.pow(1 - progress, 3);


        const currentValue =
            Math.floor(target * eased);


        counter.textContent =
            currentValue.toLocaleString("fa-IR");


        if (progress < 1) {

            requestAnimationFrame(update);

        } else {

            counter.textContent =
                target.toLocaleString("fa-IR");

        }

    }


    requestAnimationFrame(update);
}


/* =========================================
   INTERSECTION OBSERVER
========================================= */

if (counters.length) {

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const counter = entry.target;

                if (counter.dataset.animated === "true") {
                    return;
                }

                counter.dataset.animated = "true";

                animateCounter(counter);

                observer.unobserve(counter);

            });

        },
        {
            threshold: 0.5
        }
    );


    counters.forEach(counter => {
        observer.observe(counter);
    });

}


/* =========================================
   HEADER SCROLL EFFECT
========================================= */

const header = document.querySelector(".site-header");

if (header) {

    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 40) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        },
        {
            passive: true
        }
    );

}


/* =========================================
   ACTIVE NAVIGATION
========================================= */

const sections = document.querySelectorAll(
    "main section[id]"
);

const desktopLinks = document.querySelectorAll(
    ".nav-links a"
);


if (sections.length && desktopLinks.length) {

    const sectionObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const id = entry.target.id;

                desktopLinks.forEach(link => {

                    link.classList.remove("active");

                    if (
                        link.getAttribute("href") ===
                        `#${id}`
                    ) {
                        link.classList.add("active");
                    }

                });

            });

        },
        {
            rootMargin: "-35% 0px -55% 0px"
        }
    );


    sections.forEach(section => {
        sectionObserver.observe(section);
    });

}


/* =========================================
   PREVENT EMPTY LINKS
========================================= */

document.querySelectorAll('a[href="#"]').forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

    });

});