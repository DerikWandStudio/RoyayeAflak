
(() => {
    'use strict';

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const playersGrid = $('#playersGrid');
    const playersEmpty = $('#playersEmpty');

    const ageButtons = $$('.age-filters [data-age]');
    const positionButtons = $$('.position-filters [data-position]');
    const ageCards = $$('.age-group-card[data-age-filter]');

    let players = [];
    let selectedAge = 'all';
    let selectedPosition = 'all';

    const escapeHTML = (value) =>
        String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

    function normalize(value) {
        return String(value ?? '').trim();
    }

    function showEmptyMessage(message) {
        if (playersGrid) {
            playersGrid.innerHTML = '';
        }

        if (playersEmpty) {
            playersEmpty.hidden = false;

            const heading = $('h3', playersEmpty);
            const paragraph = $('p', playersEmpty);

            if (heading) heading.textContent = message;
            if (paragraph) paragraph.textContent = '';
        }
    }

    function getPositionName(position) {
        const names = {
            'دروازه‌بان': 'دروازه‌بان',
            'دروازه بان': 'دروازه‌بان',
            goalkeeper: 'دروازه‌بان',
            defender: 'مدافع',
            midfielder: 'هافبک',
            forward: 'مهاجم',
            'مدافع': 'مدافع',
            'هافبک': 'هافبک',
            'مهاجم': 'مهاجم'
        };

        return names[normalize(position)] || normalize(position) || 'نامشخص';
    }

    function renderPlayers() {
        if (!playersGrid || !playersEmpty) return;

        const filteredPlayers = players.filter((player) => {
            const matchesAge =
                selectedAge === 'all' ||
                normalize(player.age_group) === selectedAge;

            const matchesPosition =
                selectedPosition === 'all' ||
                normalize(player.position) === selectedPosition;

            return matchesAge && matchesPosition;
        });

        if (filteredPlayers.length === 0) {
            playersGrid.innerHTML = '';
            playersEmpty.hidden = false;
            return;
        }

        playersEmpty.hidden = true;

        playersGrid.innerHTML = filteredPlayers.map((player) => {
            const name = escapeHTML(player.full_name);
            const imageUrl = escapeHTML(player.image_url);
            const number = escapeHTML(player.jersey_number ?? '—');
            const position = escapeHTML(getPositionName(player.position));
            const ageGroup = escapeHTML(player.age_group || '');

            return `
                <article class="player-card">
                    <div class="player-image">
                        ${imageUrl
                    ? `<img
                                    src="${imageUrl}"
                                    alt="${name}"
                                    loading="lazy"
                                    onerror="this.style.display='none'"
                                >`
                    : '<div class="player-placeholder">⚽</div>'
                }
                    </div>

                    <div class="player-info">
                        <span class="player-number">${number}</span>
                        <h3>${name}</h3>
                        <p>${position}</p>
                        <span class="player-age">${ageGroup}</span>
                    </div>
                </article>
            `;
        }).join('');
    }

    function setActiveButton(buttons, attribute, value) {
        buttons.forEach((button) => {
            const isActive = button.dataset[attribute] === value;

            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function selectAge(age) {
        selectedAge = age;

        setActiveButton(ageButtons, 'age', age);
        renderPlayers();
    }

    function selectPosition(position) {
        selectedPosition = position;

        setActiveButton(positionButtons, 'position', position);
        renderPlayers();
    }

    ageButtons.forEach((button) => {
        button.addEventListener('click', () => {
            selectAge(button.dataset.age);
        });
    });

    positionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            selectPosition(button.dataset.position);
        });
    });

    ageCards.forEach((card) => {
        card.addEventListener('click', () => {
            selectAge(card.dataset.ageFilter);

            $('#players')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    async function loadPlayers() {
        if (!playersGrid || !playersEmpty) {
            console.error(
                'teams.js: عناصر #playersGrid یا #playersEmpty پیدا نشدند.'
            );
            return;
        }

        const client = window.AdminApp?.client;

        if (!client) {
            console.error(
                'Supabase client در دسترس نیست.',
                window.AdminApp?.initError
            );

            showEmptyMessage('اتصال به سرور برقرار نشد.');
            return;
        }

        playersGrid.innerHTML = `
            <p class="players-loading">در حال دریافت اطلاعات بازیکنان...</p>
        `;

        playersEmpty.hidden = true;

        try {
            const { data, error } = await client
                .from('academy_players')
                .select(
                    'id, full_name, image_url, jersey_number, position, age_group'
                )
                .eq('is_active', true)
                .order('jersey_number', { ascending: true });

            if (error) throw error;

            players = data || [];
            renderPlayers();

        } catch (error) {
            console.error('خطا در دریافت بازیکنان از Supabase:', error);
            showEmptyMessage('دریافت اطلاعات بازیکنان ناموفق بود.');
        }
    }

    // منوی موبایل مطابق HTML همین صفحه
    const menuButton = $('#menuBtn');
    const mobileMenu = $('#mainMenu');

    menuButton?.addEventListener('click', () => {
        const isOpen = mobileMenu?.classList.toggle('active') ?? false;

        menuButton.classList.toggle('active', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuButton?.classList.remove('active');
            menuButton?.setAttribute('aria-expanded', 'false');
        });
    });

    // بارگذاری بازیکنان
    loadPlayers();
})();
