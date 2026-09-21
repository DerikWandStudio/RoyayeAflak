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
       GALLERY - ELEMENTS & DATA
    ===================================================== */

    const galleryGrid =
        document.getElementById("galleryGrid");

    const galleryEmpty =
        document.getElementById("galleryEmpty");

    const filterButtons =
        document.querySelectorAll(".gallery-filter");

    /* galleryItems از js/gallery-data.js می‌آید */

    const items =
        typeof galleryItems !== "undefined"
            ? galleryItems
            : [];

    const categoryNames = {

        training: "تمرینات",
        matches: "مسابقات",
        teams: "تیم‌ها",
        events: "رویدادها"

    };


    const getCards = () =>
        galleryGrid
            ? galleryGrid.querySelectorAll(".gallery-card")
            : [];


    /* =====================================================
       RENDER CARDS
    ===================================================== */

    const renderGallery = () => {

        const template =
            document.getElementById("galleryCardTemplate");

        if (!galleryGrid || !template) {
            return;
        }

        const fragment =
            document.createDocumentFragment();

        items.forEach((item, index) => {

            const card =
                template.content.firstElementChild.cloneNode(true);

            card.dataset.category = item.category;

            const button =
                card.querySelector(".gallery-image");

            button.dataset.index = index;

            button.setAttribute(
                "aria-label",
                "مشاهده تصویر: " + item.title
            );

            const img = card.querySelector("img");

            img.src = item.image;
            img.alt = item.alt || item.title;

            card.querySelector(".image-category").textContent =
                categoryNames[item.category] || "گالری";

            card.querySelector("h3").textContent =
                item.title;

            card.querySelector(".gallery-info p").textContent =
                item.description;

            const time = card.querySelector("time");

            if (item.iso) {
                time.dateTime = item.iso;
            }

            time.append(" " + item.date);

            fragment.appendChild(card);

        });

        galleryGrid.appendChild(fragment);

    };


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

            getCards().forEach(card => {

                const shouldShow =
                    filter === "all" ||
                    card.dataset.category === filter;

                card.classList.toggle(
                    "hidden",
                    !shouldShow
                );

            });


            updateEmptyState();

        });

    });


    /* =====================================================
       LIGHTBOX - ELEMENTS
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

    let lastFocused = null;


    /* =====================================================
       OPEN LIGHTBOX
    ===================================================== */

    const openLightbox = (item) => {

        if (!lightbox || !lightboxImage) {
            return;
        }

        lastFocused = document.activeElement;

        lightboxImage.src = item.image;
        lightboxImage.alt = item.alt || item.title;

        if (lightboxTitle) {
            lightboxTitle.textContent = item.title;
        }

        if (lightboxDescription) {
            lightboxDescription.textContent = item.description;
        }

        if (lightboxDate) {
            lightboxDate.textContent = item.date;
        }

        if (lightboxCategory) {
            lightboxCategory.textContent =
                categoryNames[item.category] || "گالری";
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
       GALLERY IMAGE CLICK (Event Delegation)
    ===================================================== */

    if (galleryGrid) {

        galleryGrid.addEventListener("click", event => {

            const button =
                event.target.closest(".gallery-image");

            if (!button) {
                return;
            }

            const item =
                items[Number(button.dataset.index)];

            if (item) {
                openLightbox(item);
            }

        });

    }


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

        if (lastFocused) {
            lastFocused.focus();
            lastFocused = null;
        }

        setTimeout(() => {

            if (
                lightboxImage &&
                !lightbox.classList.contains("active")
            ) {

                lightboxImage.removeAttribute("src");

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

    renderGallery();
    updateEmptyState();

});
