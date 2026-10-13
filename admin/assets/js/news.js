
(() => {
  'use strict';

  // ----------------------------------------
  // DOM
  // ----------------------------------------
  const $ = (id) => document.getElementById(id);

  const form = $('newsForm');
  const notice = $('notice');
  const newsList = $('newsList');
  const saveButton = $('saveButton');
  const deleteButton = $('deleteButton');
  const newButton = $('newNewsButton');
  const resetButton = $('resetButton');
  const statusFilter = $('statusFilter');
  const logoutButton = $('logoutButton');

  const daySelect = $('newsDay');
  const monthSelect = $('newsMonth');
  const yearSelect = $('newsYear');
  const titleInput = $('newsTitle');
  const bodyInput = $('newsBody');
  const idInput = $('newsId');

  let client = null;
  let currentUser = null;
  let newsItems = [];

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
    'مرداد', 'شهریور', 'مهر', 'آبان',
    'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // ----------------------------------------
  // Persian date selectors
  // ----------------------------------------
  function fillSelect(select, items, placeholder) {
    if (!select) return;

    select.replaceChildren();

    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);

    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = String(item.value);
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function persianNumber(value) {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  function updateDays() {
    if (!daySelect || !monthSelect) return;

    const month = Number(monthSelect.value);
    const previousDay = Number(daySelect.value);

    let days = 31;

    if (month >= 7 && month <= 11) {
      days = 30;
    } else if (month === 12) {
      // اسفند در این پنل فعلاً تا ۲۹ روز دارد.
      days = 29;
    }

    fillSelect(
      daySelect,
      Array.from({ length: days }, (_, index) => ({
        value: index + 1,
        label: persianNumber(index + 1)
      })),
      'روز'
    );

    if (previousDay > 0 && previousDay <= days) {
      daySelect.value = String(previousDay);
    }
  }

  function initDateSelectors() {
    fillSelect(
      monthSelect,
      persianMonths.map((label, index) => ({
        value: index + 1,
        label
      })),
      'ماه'
    );

    // سال‌های قابل انتخاب؛ در صورت نیاز می‌توان بازه را تغییر داد.
    fillSelect(
      yearSelect,
      Array.from({ length: 16 }, (_, index) => {
        const year = 1415 - index;
        return { value: year, label: persianNumber(year) };
      }),
      'سال'
    );

    updateDays();

    monthSelect?.addEventListener('change', updateDays);
  }

  function getSelectedPersianDate() {
    const day = Number(daySelect?.value);
    const month = Number(monthSelect?.value);
    const year = Number(yearSelect?.value);

    if (!day || !month || !year) {
      return null;
    }

    return [
      String(year),
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0')
    ].join('-');
  }

  function setPersianDate(value) {
    if (!value || typeof value !== 'string') {
      clearPersianDate();
      return;
    }

    const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (!match) {
      clearPersianDate();
      return;
    }

    const [, year, month, day] = match;

    yearSelect.value = year;
    monthSelect.value = String(Number(month));
    updateDays();
    daySelect.value = String(Number(day));
  }

  function clearPersianDate() {
    if (daySelect) daySelect.value = '';
    if (monthSelect) monthSelect.value = '';
    if (yearSelect) yearSelect.value = '';
    updateDays();
    if (daySelect) daySelect.value = '';
  }

  function formatPersianDate(value) {
    if (!value) return 'بدون تاریخ';

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return escapeHtml(value);

    const [, year, month, day] = match;

    return `${persianNumber(Number(day))} ${persianMonths[Number(month) - 1] || ''
      } ${persianNumber(Number(year))}`;
  }

  // ----------------------------------------
  // General helpers
  // ----------------------------------------
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function makeSlug(value) {
    const persianMap = {
      'ا': 'a', 'آ': 'a', 'أ': 'a', 'إ': 'e',
      'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
      'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
      'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
      'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a',
      'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k',
      'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y'
    };

    let slug = String(value || '').toLowerCase();

    slug = slug.replace(/[اآأإبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیئ]/g,
      (char) => persianMap[char] || '');

    slug = slug
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug;
  }

  function showNotice(message, type = 'info') {
    if (!notice) return;

    notice.textContent = message;
    notice.className = `notice notice-${type}`;
    notice.hidden = false;
  }

  function hideNotice() {
    if (!notice) return;

    notice.textContent = '';
    notice.hidden = true;
  }

  function setBusy(isBusy) {
    if (saveButton) saveButton.disabled = isBusy;
    if (deleteButton) deleteButton.disabled = isBusy;
  }

  function resolveClient() {
    return window.AdminApp?.client ||
      window.supabaseClient ||
      window.sb ||
      null;
  }

  function friendlyError(error) {
    const message = error?.message || 'خطای نامشخص';

    if (message.includes('news_date')) {
      return 'ستون news_date در دیتابیس پیدا نشد. مهاجرت SQL مربوط به تاریخ خبر را بررسی کن.';
    }

    if (message.includes('duplicate key') || message.includes('news_slug_key')) {
      return 'خبر دیگری با همین شناسه وجود دارد. عنوان خبر را کمی تغییر بده و دوباره ذخیره کن.';
    }

    if (message.includes('row-level security')) {
      return 'اجازه انجام این کار وجود ندارد. دسترسی حساب مدیر و قوانین Supabase را بررسی کن.';
    }

    return message;
  }

  // ----------------------------------------
  // Stats and list rendering
  // ----------------------------------------
  function updateStats() {
    const total = newsItems.length;
    const published = newsItems.filter(
      (item) => item.status === 'published'
    ).length;
    const drafts = newsItems.filter(
      (item) => item.status === 'draft'
    ).length;

    if ($('totalCount')) $('totalCount').textContent = persianNumber(total);
    if ($('publishedCount')) $('publishedCount').textContent = persianNumber(published);
    if ($('draftCount')) $('draftCount').textContent = persianNumber(drafts);
  }

  function renderList() {
    if (!newsList) return;

    const filter = statusFilter?.value || 'all';

    const filtered = newsItems.filter((item) => {
      return filter === 'all' || item.status === filter;
    });

    updateStats();

    if (!filtered.length) {
      newsList.innerHTML = `
        <div class="empty-state">
          خبری برای نمایش وجود ندارد.
        </div>
      `;
      return;
    }

    newsList.innerHTML = filtered.map((item) => {
      const isPublished = item.status === 'published';
      const selected = String(item.id) === String(idInput?.value || '');

      return `
        <article class="news-admin-item ${selected ? 'is-selected' : ''}"
                 data-news-id="${escapeHtml(item.id)}">
          <div class="news-admin-item-content">
            <h3>${escapeHtml(item.title || 'بدون عنوان')}</h3>
            <p>${formatPersianDate(item.news_date)}</p>
            <span class="news-status ${isPublished ? 'published' : 'draft'}">
              ${isPublished ? 'منتشرشده' : 'پیش‌نویس'}
            </span>
          </div>
          <button type="button"
                  class="news-edit-button"
                  data-edit-id="${escapeHtml(item.id)}">
            ویرایش
          </button>
        </article>
      `;
    }).join('');
  }

  // ----------------------------------------
  // Form handling
  // ----------------------------------------
  function resetForm() {
    form?.reset();

    if (idInput) idInput.value = '';
    clearPersianDate();

    if ($('editorHeading')) $('editorHeading').textContent = 'افزودن خبر';
    if ($('editorMode')) $('editorMode').textContent = 'خبر جدید';

    if (deleteButton) deleteButton.hidden = true;
    if (saveButton) saveButton.textContent = 'ذخیره و انتشار خبر';

    hideNotice();
    renderList();
  }

  function fillForm(item) {
    if (!item) return;

    if (idInput) idInput.value = item.id || '';
    if (titleInput) titleInput.value = item.title || '';
    if (bodyInput) bodyInput.value = item.body || '';

    setPersianDate(item.news_date);

    if ($('editorHeading')) $('editorHeading').textContent = 'ویرایش خبر';
    if ($('editorMode')) $('editorMode').textContent = 'ویرایش خبر موجود';

    if (deleteButton) deleteButton.hidden = false;
    if (saveButton) saveButton.textContent = 'ذخیره تغییرات';

    hideNotice();
    renderList();
  }

  function validateForm() {
    const title = titleInput?.value.trim() || '';
    const body = bodyInput?.value.trim() || '';
    const newsDate = getSelectedPersianDate();

    if (!title) {
      return { error: 'عنوان خبر را وارد کن.' };
    }

    if (!body) {
      return { error: 'متن خبر را وارد کن.' };
    }

    if (!newsDate) {
      return { error: 'روز، ماه و سال انتشار خبر را انتخاب کن.' };
    }

    let slug = makeSlug(title);

    // اگر عنوان فارسی بود و اسلاگ لاتین تولید نشد، شناسه یکتا بساز.
    if (!slug) {
      const idPart = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      slug = `news-${idPart}`;
    }

    return {
      data: {
        title,
        slug,
        excerpt: '',
        body,
        image_url: '',
        status: 'published',
        news_date: newsDate
      }
    };
  }

  async function saveNews(event) {
    event?.preventDefault();
    hideNotice();

    if (!client) {
      showNotice('اتصال Supabase برقرار نیست.', 'error');
      return;
    }

    const validation = validateForm();

    if (validation.error) {
      showNotice(validation.error, 'error');
      return;
    }

    const payload = validation.data;
    const existingId = idInput?.value || '';

    setBusy(true);

    try {
      let result;

      if (existingId) {
        result = await client
          .from('news')
          .update(payload)
          .eq('id', existingId)
          .select()
          .single();
      } else {
        result = await client
          .from('news')
          .insert({
            ...payload,
            created_by: currentUser?.id || null
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      await loadNews();

      const savedItem = result.data;

      if (savedItem) {
        const refreshedItem = newsItems.find(
          (item) => String(item.id) === String(savedItem.id)
        );

        if (refreshedItem) fillForm(refreshedItem);
      }

      showNotice(
        existingId ? 'تغییرات خبر ذخیره شد.' : 'خبر با موفقیت منتشر شد.',
        'success'
      );
    } catch (error) {
      console.error('Save news error:', error);
      showNotice(`ذخیره خبر ناموفق بود: ${friendlyError(error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteNews() {
    const id = idInput?.value;

    if (!id) {
      showNotice('ابتدا یک خبر را برای حذف انتخاب کن.', 'error');
      return;
    }

    if (!window.confirm('از حذف این خبر مطمئنی؟ این کار قابل بازگشت نیست.')) {
      return;
    }

    setBusy(true);

    try {
      const { error } = await client
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      resetForm();
      await loadNews();
      showNotice('خبر حذف شد.', 'success');
    } catch (error) {
      console.error('Delete news error:', error);
      showNotice(`حذف خبر ناموفق بود: ${friendlyError(error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  // ----------------------------------------
  // Supabase and admin authentication
  // ----------------------------------------
  async function requireAdmin() {
    if (!client) {
      throw new Error(
        window.AdminApp?.initError?.message ||
        'کلاینت Supabase ساخته نشده است. ترتیب بارگذاری اسکریپت‌ها را بررسی کن.'
      );
    }

    const { data, error } = await client.auth.getSession();

    if (error) throw error;

    const session = data?.session;

    if (!session?.user) {
      window.location.href = 'login.html';
      return false;
    }

    currentUser = session.user;

    const { data: adminRecord, error: adminError } = await client
      .from('admin_users')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!adminRecord) {
      await client.auth.signOut();
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }

  async function loadNews() {
    if (!newsList) return;

    newsList.innerHTML = '<div class="empty-state">در حال دریافت خبرها…</div>';

    const { data, error } = await client
      .from('news')
      .select(
        'id,title,slug,excerpt,body,image_url,status,news_date,published_at,created_at,updated_at,created_by'
      )
      .order('updated_at', { ascending: false });

    if (error) throw error;

    newsItems = data || [];
    renderList();
  }

  async function logout() {
    try {
      if (client) await client.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }

    window.location.href = 'login.html';
  }

  // ----------------------------------------
  // Events and initialization
  // ----------------------------------------
  function bindEvents() {
    form?.addEventListener('submit', saveNews);

    newButton?.addEventListener('click', resetForm);
    resetButton?.addEventListener('click', resetForm);
    deleteButton?.addEventListener('click', deleteNews);
    logoutButton?.addEventListener('click', logout);

    statusFilter?.addEventListener('change', renderList);

    newsList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-edit-id]');
      const itemElement = event.target.closest('[data-news-id]');
      const id = button?.dataset.editId || itemElement?.dataset.newsId;

      if (!id) return;

      const item = newsItems.find(
        (entry) => String(entry.id) === String(id)
      );

      if (item) fillForm(item);
    });
  }

  async function init() {
    initDateSelectors();
    bindEvents();

    client = resolveClient();

    try {
      const allowed = await requireAdmin();

      if (!allowed) return;

      await loadNews();
      resetForm();
    } catch (error) {
      console.error('Admin news initialization error:', error);

      showNotice(
        `راه‌اندازی پنل خبرها ناموفق بود: ${friendlyError(error)}`,
        'error'
      );

      if (newsList) {
        newsList.innerHTML = `
          <div class="empty-state">
            دریافت خبرها با خطا مواجه شد.
          </div>
        `;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
