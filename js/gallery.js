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
                String(isOpen)
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
       GALLERY
    ===================================================== */

    const galleryGrid =
        document.getElementById("galleryGrid");

    const galleryEmpty =
        document.getElementById("galleryEmpty");

    const filterButtons =
        document.querySelectorAll(".gallery-filter");


    const getCards = () =>
        galleryGrid
            ? galleryGrid.querySelectorAll(".gallery-card")
            : [];


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    const updateEmptyState = () => {

        const cards = getCards();

        let visibleCards = 0;

        cards.forEach(card => {

            if (!card.classList.contains("hidden")) {
                visibleCards++;
            }

        });

        if (galleryEmpty) {

            if (visibleCards === 0) {
                galleryEmpty.classList.add("active");
            } else {
                galleryEmpty.classList.remove("active");
            }

        }

    };


    /* =====================================================
       FILTER
    ===================================================== */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;


            /* Active button */

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");


            /* Filter cards */

            const cards = getCards();

            cards.forEach(card => {

                const category =
                    card.dataset.category;

                const shouldShow =
                    filter === "all" ||
                    category === filter;

                card.classList.toggle(
                    "hidden",
                    !shouldShow
                );

            });


            updateEmptyState();

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


    const categoryNames = {

        training: "تمرینات",
        matches: "مسابقات",
        teams: "تیم‌ها",
        events: "رویدادها"

    };


    /* =====================================================
       OPEN LIGHTBOX
    ===================================================== */

    const openLightbox = (button) => {

        if (
            !lightbox ||
            !lightboxImage
        ) {
            return;
        }


        const image =
            button.dataset.image || "";

        const title =
            button.dataset.title || "";

        const description =
            button.dataset.description || "";

        const date =
            button.dataset.date || "";


        const card =
            button.closest(".gallery-card");

        const category =
            card?.dataset.category || "";


        lightboxImage.src = image;
        lightboxImage.alt = title;

        if (lightboxTitle) {
            lightboxTitle.textContent = title;
        }

        if (lightboxDescription) {
            lightboxDescription.textContent =
                description;
        }

        if (lightboxDate) {
            lightboxDate.textContent = date;
        }

        if (lightboxCategory) {
            lightboxCategory.textContent =
                categoryNames[category] || "گالری";
        }


        lightbox.classList.add("active");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "lightbox-open"
        );

        if (lightboxClose) {
            lightboxClose.focus();
        }

    };


    /* =====================================================
       GALLERY IMAGE EVENTS
    ===================================================== */

    const setupLightboxButtons = () => {

        const galleryImages =
            document.querySelectorAll(".gallery-image");

        galleryImages.forEach(button => {

            button.addEventListener(
                "click",
                () => openLightbox(button)
            );

        });

    };


    setupLightboxButtons();


    /* =====================================================
       CLOSE LIGHTBOX
    ===================================================== */

    const closeLightbox = () => {

        if (!lightbox) {
            return;
        }

        lightbox.classList.remove("active");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "lightbox-open"
        );


        setTimeout(() => {

            if (
                lightboxImage &&
                !lightbox.classList.contains("active")
            ) {

                lightboxImage.src = "";

            }

        }, 300);

    };


    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );

    }


    if (lightboxBackdrop) {

        lightboxBackdrop.addEventListener(
            "click",
            closeLightbox
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                lightbox &&
                lightbox.classList.contains("active")
            ) {

                closeLightbox();

            }

        }
    );


    /* =====================================================
       LIGHTBOX IMAGE ERROR
    ===================================================== */

    if (lightboxImage) {

        lightboxImage.addEventListener(
            "error",
            () => {

                if (lightboxTitle) {
                    lightboxTitle.textContent =
                        "تصویر پیدا نشد";
                }

                if (lightboxDescription) {
                    lightboxDescription.textContent =
                        "مسیر تصویر را بررسی کنید.";
                }

            }
        );

    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    updateEmptyState();

});