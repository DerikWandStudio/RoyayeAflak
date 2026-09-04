document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mainMenu");

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


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    const header =
        document.querySelector(".site-header");

    if (header) {

        const updateHeader = () => {

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

    }


    /* =====================================================
       GALLERY FILTER
    ===================================================== */

    const filterButtons =
        document.querySelectorAll(".gallery-filter");

    const galleryCards =
        document.querySelectorAll(".gallery-card");

    const galleryEmpty =
        document.getElementById("galleryEmpty");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;


            /* Active Button */

            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            button.classList.add("active");


            /* Filter Cards */

            let visibleCards = 0;

            galleryCards.forEach(card => {

                const category =
                    card.dataset.category;


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    card.classList.remove("hidden");

                    visibleCards++;

                } else {

                    card.classList.add("hidden");

                }

            });


            /* Empty State */

            if (galleryEmpty) {

                if (visibleCards === 0) {

                    galleryEmpty.classList.add("active");

                } else {

                    galleryEmpty.classList.remove("active");

                }

            }

        });

    });


    /* =====================================================
       LIGHTBOX
    ===================================================== */

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxTitle =
        document.getElementById("lightboxTitle");

    const lightboxDescription =
        document.getElementById("lightboxDescription");

    const lightboxDate =
        document.getElementById("lightboxDate");

    const lightboxCategory =
        document.getElementById("lightboxCategory");

    const lightboxClose =
        document.getElementById("lightboxClose");

    const lightboxBackdrop =
        document.querySelector(".lightbox-backdrop");


    const galleryImages =
        document.querySelectorAll(".gallery-image");


    /* Category names */

    const categoryNames = {

        training: "تمرینات",

        matches: "مسابقات",

        teams: "تیم‌ها",

        events: "رویدادها"

    };


    /* Open */

    galleryImages.forEach(imageButton => {

        imageButton.addEventListener("click", () => {

            const image =
                imageButton.dataset.image;

            const title =
                imageButton.dataset.title;

            const description =
                imageButton.dataset.description;

            const date =
                imageButton.dataset.date;


            const card =
                imageButton.closest(".gallery-card");

            const category =
                card?.dataset.category || "";


            lightboxImage.src = image;

            lightboxImage.alt = title;

            lightboxTitle.textContent =
                title;

            lightboxDescription.textContent =
                description;

            lightboxDate.textContent =
                date;

            lightboxCategory.textContent =
                categoryNames[category] || "گالری";


            lightbox.classList.add("active");

            lightbox.setAttribute(
                "aria-hidden",
                "false"
            );


            /* Prevent background scrolling */

            document.body.style.overflow =
                "hidden";


            /* Focus close button */

            if (lightboxClose) {

                lightboxClose.focus();

            }

        });

    });


    /* Close function */

    const closeLightbox = () => {

        lightbox.classList.remove("active");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";


        /* Clear image after animation */

        setTimeout(() => {

            if (
                !lightbox.classList.contains("active")
            ) {

                lightboxImage.src = "";

            }

        }, 300);

    };


    /* Close button */

    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );

    }


    /* Click outside */

    if (lightboxBackdrop) {

        lightboxBackdrop.addEventListener(
            "click",
            closeLightbox
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                lightbox.classList.contains("active")
            ) {

                closeLightbox();

            }

        }
    );


    /* =====================================================
       LIGHTBOX IMAGE ERROR
    ===================================================== */

    lightboxImage.addEventListener(
        "error",
        () => {

            lightboxTitle.textContent =
                "تصویر پیدا نشد";

            lightboxDescription.textContent =
                "مسیر تصویر را در پوشه images/gallery بررسی کنید.";

        }
    );

});