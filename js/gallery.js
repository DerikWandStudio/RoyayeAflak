document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    // Mobile navigation
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mainMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            menuBtn.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.setAttribute('aria-label', 'باز کردن منو');
            });
        });
    }

    // Header scroll
    const header = document.querySelector('.site-header');

    if (header) {
        const updateHeader = () => {
            header.classList.toggle('scrolled', window.scrollY > 30);
        };

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('galleryEmpty');
    const filterButtons = [...document.querySelectorAll('.gallery-filter')];

    const categoryNames = {
        training: 'تمرینات',
        matches: 'مسابقات',
        teams: 'تیم‌ها',
        events: 'رویدادها'
    };

    let items = [];
    let activeFilter = 'all';
    const fallbackItems = typeof galleryItems !== 'undefined' ? galleryItems : [];

    // Prefer the database; fall back to the legacy array only if the request fails.
    try {
        if (!window.supabase?.createClient) {
            throw new Error('Supabase JS is unavailable');
        }

        const client = window.supabase.createClient(
            'https://nqzlxhcpildvorrkaroi.supabase.co',
            'sb_publishable_UkOgX2vv_qvTYoQ76Hyreg_lGQn-fv7',
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );

        const { data, error } = await client
            .from('gallery_items')
            .select('id,title,description,image_url,alt,category,image_date,created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        items = (data || []).map(item => ({
            id: item.id,
            image: item.image_url,
            title: item.title,
            description: item.description || '',
            date: item.image_date || '',
            category: item.category,
            alt: item.alt || '',
            iso: ''
        }));
    } catch (error) {
        console.warn('Gallery database load failed; using legacy gallery data.', error);
        items = fallbackItems.map(item => ({ ...item }));
    }

    const getCards = () => {
        return grid ? [...grid.querySelectorAll('.gallery-card')] : [];
    };

    const updateEmptyState = () => {
        if (!empty) return;

        const allHidden = getCards().every(card => card.classList.contains('hidden'));
        empty.classList.toggle('active', allHidden);
    };

    const renderGallery = () => {
        const template = document.getElementById('galleryCardTemplate');
        if (!grid || !template) return;

        grid.replaceChildren();
        const fragment = document.createDocumentFragment();

        items.forEach((item, index) => {
            const card = template.content.firstElementChild.cloneNode(true);
            card.dataset.category = item.category || '';

            const button = card.querySelector('.gallery-image');
            button.dataset.index = String(index);
            button.setAttribute('aria-label', `مشاهده تصویر: ${item.title || ''}`);

            const img = card.querySelector('img');
            img.src = item.image;
            img.alt = item.alt || item.title || '';
            img.loading = 'lazy';
            img.addEventListener('error', () => {
                card.classList.add('image-unavailable');
            }, { once: true });

            card.querySelector('.image-category').textContent =
                categoryNames[item.category] || 'گالری';
            card.querySelector('h3').textContent = item.title || '';
            card.querySelector('.gallery-info p').textContent = item.description || '';

            const time = card.querySelector('time');
            time.textContent = item.date || '';

            if (item.iso) {
                time.dateTime = item.iso;
            } else {
                time.removeAttribute('datetime');
            }

            card.classList.toggle(
                'hidden',
                activeFilter !== 'all' && item.category !== activeFilter
            );

            fragment.appendChild(card);
        });

        grid.appendChild(fragment);
        updateEmptyState();
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter || 'all';

            filterButtons.forEach(other => {
                other.classList.toggle('active', other === button);
            });

            getCards().forEach(card => {
                card.classList.toggle(
                    'hidden',
                    activeFilter !== 'all' && card.dataset.category !== activeFilter
                );
            });

            updateEmptyState();
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    const lightboxDate = document.getElementById('lightboxDate');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const lightboxClose = document.getElementById('lightboxClose');
    const backdrop = document.querySelector('.lightbox-backdrop');
    let lastFocused = null;

    const openLightbox = item => {
        if (!lightbox || !lightboxImage) return;

        lastFocused = document.activeElement;

        lightboxImage.src = item.image;
        lightboxImage.alt = item.alt || item.title || '';

        if (lightboxTitle) lightboxTitle.textContent = item.title || '';
        if (lightboxDescription) lightboxDescription.textContent = item.description || '';
        if (lightboxDate) lightboxDate.textContent = item.date || '';
        if (lightboxCategory) {
            lightboxCategory.textContent = categoryNames[item.category] || 'گالری';
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        lightboxClose?.focus();
    };

    const closeLightbox = () => {
        if (!lightbox) return;

        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');

        if (lastFocused?.focus) lastFocused.focus();
        lastFocused = null;

        window.setTimeout(() => {
            if (lightboxImage && !lightbox.classList.contains('active')) {
                lightboxImage.removeAttribute('src');
            }
        }, 300);
    };

    grid?.addEventListener('click', event => {
        const button = event.target.closest('.gallery-image');
        if (!button) return;

        const item = items[Number(button.dataset.index)];
        if (item) openLightbox(item);
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    backdrop?.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && lightbox?.classList.contains('active')) {
            closeLightbox();
        }
    });

    lightboxImage?.addEventListener('error', () => {
        if (lightboxTitle) lightboxTitle.textContent = 'تصویر پیدا نشد';
        if (lightboxDescription) lightboxDescription.textContent = 'لینک تصویر را بررسی کنید.';
    });

    renderGallery();
});