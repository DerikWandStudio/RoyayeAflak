(() => {
    'use strict';
    const NEWS_PER_PAGE = 6;
    let news = [];
    let currentPage = 1;
    const newsList = document.getElementById('newsList');
    const pagination = document.getElementById('pagination');
    const newsEmpty = document.getElementById('newsEmpty');
    const legacyNews = [
        { title: 'آپدیت 1.9 سایت', date: '۱۵ مهر ۱۴۰۵', text: 'سئو سایت بهینه سازی شد و روی سرچ گوگل قرار گرفت' },
        { title: 'آپدیت 1.8 سایت', date: '۱۴ مهر ۱۴۰۵', text: 'آمادگی کامل سایت برای لانچ نهایی | مراحل کدنویسی به پایان رسید + آپلود عکس ها' },
        { title: 'آپدیت 1.7 سایت', date: '۹ مهر ۱۴۰۵', text: 'پایان کدنویسی سایت. تغییرات: پس زمینه چرخشی و رفع باگ های پشت صحنه؛ باقیمانده تا عرضه: فقط آپلود عکس ها' },
        { title: 'زمان تخمینی راه اندازی', date: '۱۵ مهر ۱۴۰۵', text: 'تقریبا تا پانزدهم مهرماه سایت در دسترس است و سوت آغاز به صدا در می آید' },
        { title: 'آپدیت 1.6 سایت', date: '۸ مهر ۱۴۰۵', text: 'نزدیک شدن به نسخه 2.0 و عرضه نهایی وبسایت؛ تغییرات: کدنویسی پس زمینه اسکن لاین برای تمامی صفحات' },
        { title: 'آپدیت 1.5 سایت', date: '۷ مهر ۱۴۰۵', text: 'تنظیم شدن لوگو برای صفحات سایت + مرتب سازی و هماهنگی ساختار بخش اخبار با صفحات دیگر' },
        { title: 'کلاس تئوری نونهالان', date: '۴ مهر ۱۴۰۵', text: 'کلاس تئوری نونهالان ب در دفتر باشگاه' },
        { title: 'فرم ثبت نام ساخته شد', date: '۳ مهر ۱۴۰۵', text: 'فرم ثبت نام تکمیل شد و به صورت ایمیل برای برنامه نویس ارسال میشود، امکان تغییر ایمیل مقصد هم وجود دارد نسخه 1.3' },
        { title: 'ویرایش و دیباگ', date: '۲ مهر ۱۴۰۵', text: 'پس زمینه آیکون عوض شد، فوتر در تمام بخش های سایت ویرایش شد، نسخه 1.2 آپلود شد' },
        { title: 'اضافه شدن بخش اخبار', date: '۲۲ شهریور ۱۴۰۵', text: 'ثبت‌نام بازیکنان در رده‌های سنی مختلف برای فصل جدید آغاز شد.' }
    ];
    function parsePersianDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());

        if (match) {
            const months = [
                'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
                'مرداد', 'شهریور', 'مهر', 'آبان',
                'آذر', 'دی', 'بهمن', 'اسفند'
            ];

            return {
                day: new Intl.NumberFormat('fa-IR').format(Number(match[3])),
                month: months[Number(match[2]) - 1] || ''
            };
        }

        const parts = String(value || '').trim().split(/\s+/);

        if (parts.length < 2) {
            return { day: String(value || '—'), month: '' };
        }

        return {
            day: parts[0],
            month: parts.slice(1).join(' ')
        };
    }
    function renderNews() {
        newsList.innerHTML = '';
        if (!news.length) { newsEmpty.classList.add('visible'); pagination.innerHTML = ''; return; }
        newsEmpty.classList.remove('visible');
        const current = news.slice((currentPage - 1) * NEWS_PER_PAGE, currentPage * NEWS_PER_PAGE);
        current.forEach((item, index) => {
            const date = parsePersianDate(item.date); const article = document.createElement('article'); article.className = 'news-item'; article.style.animationDelay = `${index * .05}s`;
            const dateBox = document.createElement('div'); dateBox.className = 'news-date'; const day = document.createElement('span'); day.className = 'news-date-day'; day.textContent = date.day; const month = document.createElement('span'); month.className = 'news-date-month'; month.textContent = date.month; dateBox.append(day, month);
            const content = document.createElement('div'); content.className = 'news-content'; const title = document.createElement('h3'); title.textContent = item.title || ''; const text = document.createElement('p'); text.textContent = item.text || ''; content.append(title, text); article.append(dateBox, content); newsList.appendChild(article);
        }); renderPagination();
    }
    function createPaginationButton(label, page, isArrow = false) { const button = document.createElement('button'); button.type = 'button'; button.className = 'pagination-button'; if (isArrow) button.classList.add('arrow'); if (page === currentPage && !isArrow) button.classList.add('active'); button.textContent = label; button.setAttribute('aria-label', isArrow ? (page > currentPage ? 'صفحه بعد' : 'صفحه قبل') : `صفحه ${page}`); button.addEventListener('click', () => { currentPage = page; renderNews(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); return button; }
    function renderPagination() { pagination.innerHTML = ''; const total = Math.ceil(news.length / NEWS_PER_PAGE); if (total <= 1) return; if (currentPage > 1) pagination.appendChild(createPaginationButton('→', currentPage - 1, true)); for (let p = 1; p <= total; p++)pagination.appendChild(createPaginationButton(p, p)); if (currentPage < total) pagination.appendChild(createPaginationButton('←', currentPage + 1, true)); }
    async function loadNews() { try { const client = window.AdminApp?.client; if (!client) throw new Error('Supabase client missing'); const { data, error } = await client.from('news').select('title,body,news_date,published_at,created_at').eq('status', 'published').order('published_at', { ascending: false, nullsFirst: false }); if (error) throw error; news = (data || []).map(item => ({ title: item.title, date: item.news_date || formatDate(item.published_at || item.created_at), text: item.body || '' })); } catch (error) { console.warn('[Royaye Aflak] Could not load news from Supabase; showing the current static list.', error); news = legacyNews.slice(); } renderNews(); }
    function formatDate(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return '—'; return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(date); }
    const header = document.querySelector('.site-header'); function handleHeaderScroll() { if (!header) return; if (window.scrollY > 30) header.classList.add('scrolled'); else header.classList.remove('scrolled'); } window.addEventListener('scroll', handleHeaderScroll, { passive: true }); handleHeaderScroll();
    const menuBtn = document.getElementById('menuBtn'), mainMenu = document.getElementById('mainMenu'); if (menuBtn && mainMenu) { menuBtn.addEventListener('click', () => { const open = mainMenu.classList.toggle('active'); menuBtn.setAttribute('aria-expanded', String(open)); }); mainMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mainMenu.classList.remove('active'); menuBtn.setAttribute('aria-expanded', 'false'); })); }
    loadNews();
})();
