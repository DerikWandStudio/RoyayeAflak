(() => {
  'use strict';
  const newsDay = document.getElementById('newsDay');
  const newsMonth = document.getElementById('newsMonth');
  const newsYear = document.getElementById('newsYear');

  const persianMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند'
  ];

  function fillSelect(select, items, placeholder) {
    select.replaceChildren();

    const firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = placeholder;
    select.appendChild(firstOption);

    items.forEach(item => {
      const option = document.createElement('option');

      option.value = String(item.value);
      option.textContent = item.label;

      select.appendChild(option);
    });
  }

  function updateNewsDays() {
    const month = Number(newsMonth.value);

    let days = 31;

    if (month >= 7 && month <= 11) {
      days = 30;
    } else if (month === 12) {
      days = 29;
    }

    const previousDay = newsDay.value;

    fillSelect(
      newsDay,
      Array.from({ length: days }, (_, index) => ({
        value: index + 1,
        label: new Intl.NumberFormat('fa-IR').format(index + 1)
      })),
      'روز'
    );

    if (Number(previousDay) > 0 && Number(previousDay) <= days) {
      newsDay.value = previousDay;
    }
  }

  fillSelect(
    newsMonth,
    persianMonths.map((month, index) => ({
      value: index + 1,
      label: month
    })),
    'ماه'
  );

  fillSelect(
    newsYear,
    Array.from({ length: 11 }, (_, index) => ({
      value: 1400 + index,
      label: new Intl.NumberFormat('fa-IR').format(1400 + index)
    })).reverse(),
    'سال'
  );

  updateNewsDays();

  newsMonth.addEventListener('change', updateNewsDays);
  const $ = (id) => document.getElementById(id);
  const form = $('newsForm');
  const notice = $('notice');
  const newsList = $('newsList');
  const saveButton = $('saveButton');
  const deleteButton = $('deleteButton');
  const newButton = $('newNewsButton');
  const statusFilter = $('statusFilter');
  const imageInput = $('newsImage');
  const imagePreviewWrap = $('imagePreviewWrap');
  const imagePreview = $('imagePreview');

  let client = null;
  let currentUser = null;
  let newsItems = [];
  let activeId = null;
  let isSaving = false;
  let slugManuallyEdited = false;

  function resolveClient() {
    // Supports the most common names used by the existing project client file.
    return window.AdminApp?.client || window.supabaseClient || window.supabase || window.sb || null;
  }

  function showNotice(message, type = 'success') {
    notice.textContent = message;
    notice.className = `news-notice ${type}`;
    notice.hidden = false;
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideNotice() {
    notice.hidden = true;
    notice.textContent = '';
  }

  function setBusy(busy) {
    isSaving = busy;
    form.classList.toggle('is-busy', busy);
    saveButton.disabled = busy;
    saveButton.textContent = busy ? 'در حال ذخیره…' : 'ذخیرهٔ خبر';
    deleteButton.disabled = busy;
  }

  function makeSlug(value) {
    const transliteration = {
      'ا': 'a', 'آ': 'a', 'أ': 'a', 'إ': 'e', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a',
      'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ؤ': 'o', 'ه': 'h',
      'ة': 'h', 'ی': 'y', 'ي': 'y', 'ئ': 'y', 'ء': '', ' ': '-'
    };
    let output = '';
    for (const char of value.trim().toLowerCase()) {
      if (Object.prototype.hasOwnProperty.call(transliteration, char)) output += transliteration[char];
      else output += char;
    }
    return output.normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
  }

  function slugIsValid(value) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }

  function safeExternalUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function formatDate(value) {
    if (!value) return 'بدون تاریخ انتشار';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function showImagePreview() {
    const url = safeExternalUrl(imageInput.value.trim());
    if (!url) {
      imagePreviewWrap.hidden = true;
      imagePreview.removeAttribute('src');
      return;
    }
    imagePreview.src = url;
    imagePreviewWrap.hidden = false;
  }

  function updateStats() {
    $('totalCount').textContent = new Intl.NumberFormat('fa-IR').format(newsItems.length);
    $('publishedCount').textContent = new Intl.NumberFormat('fa-IR').format(newsItems.filter(item => item.status === 'published').length);
    $('draftCount').textContent = new Intl.NumberFormat('fa-IR').format(newsItems.filter(item => item.status === 'draft').length);
  }

  function renderList() {
    updateStats();
    const filter = statusFilter.value;
    const visible = newsItems.filter(item => filter === 'all' || item.status === filter);
    if (!visible.length) {
      newsList.innerHTML = `<div class="empty-state">${newsItems.length ? 'خبری با این وضعیت پیدا نشد.' : 'هنوز خبری ثبت نشده؛ اولین خبر را بساز!'}</div>`;
      return;
    }

    newsList.innerHTML = visible.map(item => {
      const safeImage = safeExternalUrl(item.image_url);
      const image = safeImage
        ? `<img class="news-thumb" src="${escapeHtml(safeImage)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
        : '<div class="news-thumb d-grid place-items-center" aria-hidden="true"></div>';
      const statusText = item.status === 'published' ? 'منتشرشده' : 'پیش‌نویس';
      const dateText = item.status === 'published' ? formatDate(item.published_at) : `ویرایش ${formatDate(item.updated_at)}`;
      return `<button type="button" class="news-item w-100 text-start ${item.id === activeId ? 'selected' : ''}" data-news-id="${escapeHtml(item.id)}" aria-pressed="${item.id === activeId}">
        ${image}<span><h3>${escapeHtml(item.title)}</h3><span class="news-item-meta"><span class="status-badge ${item.status}">${statusText}</span><span>${dateText}</span></span></span>
      </button>`;
    }).join('');
  }

  function resetForm() {
    form.reset();
    $('newsId').value = '';
    activeId = null;
    slugManuallyEdited = false;
    $('editorHeading').textContent = 'ساخت خبر';
    $('editorMode').textContent = 'خبر جدید';
    deleteButton.hidden = true;
    $('excerptCount').textContent = '۰';
    imagePreviewWrap.hidden = true;
    imagePreview.removeAttribute('src');
    renderList();
  }

  function fillForm(item) {
    activeId = item.id;
    $('newsId').value = item.id;
    $('newsTitle').value = item.title || '';
    $('newsSlug').value = item.slug || '';
    $('newsExcerpt').value = item.excerpt || '';
    $('newsBody').value = item.body || '';
    imageInput.value = item.image_url || '';
    $('newsStatus').value = item.status || 'draft';
    $('excerptCount').textContent = new Intl.NumberFormat('fa-IR').format(($('newsExcerpt').value || '').length);
    $('editorHeading').textContent = 'ویرایش خبر';
    $('editorMode').textContent = item.status === 'published' ? 'منتشرشده' : 'پیش‌نویس';
    deleteButton.hidden = false;
    slugManuallyEdited = true;
    showImagePreview();
    renderList();
    if (window.matchMedia('(max-width: 1100px)').matches) $('editorHeading').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function requireAdmin() {
    client = resolveClient();
    if (!client || !client.auth || !client.from) {
      const detail = window.AdminApp?.initError?.message;
      throw new Error(detail || 'کلاینت Supabase پیدا نشد. مطمئن شو کتابخانهٔ Supabase قبل از supabase-client.js بارگذاری شده باشد.');
    }
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const session = sessionData?.session;
    if (!session?.user) {
      window.location.replace('login.html');
      return false;
    }
    currentUser = session.user;
    const { data: adminRecord, error: adminError } = await client
      .from('admin_users').select('user_id').eq('user_id', currentUser.id).maybeSingle();
    if (adminError) throw adminError;
    if (!adminRecord) {
      await client.auth.signOut();
      window.location.replace('login.html?error=not-admin');
      return false;
    }
    return true;
  }

  async function loadNews() {
    newsList.innerHTML = '<div class="empty-state">در حال دریافت خبرها…</div>';
    const { data, error } = await client.from('news')
      .select('id,title,slug,excerpt,body,image_url,status,published_at,created_at,updated_at,created_by')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    newsItems = data || [];
    renderList();
  }

  function validateForm() {
    const title = $('newsTitle').value.trim();
    const slug = $('newsSlug').value.trim();
    const body = $('newsBody').value.trim();
    const imageUrl = imageInput.value.trim();
    if (title.length < 3) throw new Error('عنوان خبر باید حداقل ۳ نویسه باشد.');
    if (!slugIsValid(slug)) throw new Error('آدرس کوتاه باید انگلیسی و شامل حروف کوچک، عدد و خط تیره باشد؛ مثلاً u15-championship.');
    if (!body) throw new Error('متن خبر را وارد کن.');
    if (imageUrl && !safeExternalUrl(imageUrl)) throw new Error('لینک تصویر باید یک آدرس HTTP یا HTTPS معتبر باشد.');
    const slugOwner = newsItems.find(item => item.slug === slug && item.id !== activeId);
    if (slugOwner) throw new Error('این آدرس کوتاه قبلاً برای یک خبر دیگر استفاده شده است.');
    return {
      title,
      slug,
      excerpt: $('newsExcerpt').value.trim(),
      body,
      image_url: imageUrl,
      status: $('newsStatus').value,
    };
  }

  async function saveNews(event) {
    event.preventDefault();
    if (isSaving) return;
    hideNotice();
    let payload;
    try { payload = validateForm(); }
    catch (error) { showNotice(error.message, 'error'); return; }

    setBusy(true);
    try {
      let result;
      if (activeId) {
        result = await client.from('news').update(payload).eq('id', activeId).select('id').single();
      } else {
        result = await client.from('news').insert({ ...payload, created_by: currentUser.id }).select('id').single();
      }
      if (result.error) throw result.error;
      const savedId = result.data?.id || activeId;
      await loadNews();
      const savedItem = newsItems.find(item => item.id === savedId);
      if (savedItem) fillForm(savedItem); else resetForm();
      showNotice(payload.status === 'published' ? 'خبر با موفقیت ذخیره و منتشر شد.' : 'خبر به‌عنوان پیش‌نویس ذخیره شد.', 'success');
    } catch (error) {
      showNotice(error.message || 'ذخیرهٔ خبر ناموفق بود. تنظیمات دیتابیس و اتصال را بررسی کن.', 'error');
    } finally { setBusy(false); }
  }

  async function deleteNews() {
    if (!activeId || isSaving) return;
    const item = newsItems.find(news => news.id === activeId);
    if (!item) return;
    if (!window.confirm(`خبر «${item.title}» حذف شود؟ این کار قابل بازگشت نیست.`)) return;
    setBusy(true);
    hideNotice();
    try {
      const { error } = await client.from('news').delete().eq('id', activeId);
      if (error) throw error;
      resetForm();
      await loadNews();
      showNotice('خبر حذف شد.', 'success');
    } catch (error) {
      showNotice(error.message || 'حذف خبر انجام نشد.', 'error');
    } finally { setBusy(false); }
  }

  async function logout() {
    if (!client?.auth) return;
    const { error } = await client.auth.signOut();
    if (error) { showNotice('خروج ناموفق بود: ' + error.message, 'error'); return; }
    window.location.replace('login.html');
  }

  function bindEvents() {
    form.addEventListener('submit', saveNews);
    newButton.addEventListener('click', () => { hideNotice(); resetForm(); $('newsTitle').focus(); });
    $('resetButton').addEventListener('click', () => { hideNotice(); resetForm(); });
    deleteButton.addEventListener('click', deleteNews);
    $('logoutButton').addEventListener('click', logout);
    statusFilter.addEventListener('change', renderList);
    newsList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-news-id]');
      if (!button) return;
      const item = newsItems.find(entry => entry.id === button.dataset.newsId);
      if (item) { hideNotice(); fillForm(item); }
    });
    $('newsTitle').addEventListener('input', () => {
      if (!slugManuallyEdited) $('newsSlug').value = makeSlug($('newsTitle').value);
    });
    $('newsSlug').addEventListener('input', () => { slugManuallyEdited = true; });
    $('newsExcerpt').addEventListener('input', () => {
      $('excerptCount').textContent = new Intl.NumberFormat('fa-IR').format($('newsExcerpt').value.length);
    });
    imageInput.addEventListener('input', showImagePreview);
    imagePreview.addEventListener('error', () => { imagePreviewWrap.hidden = true; });
    $('clearImageButton').addEventListener('click', () => { imageInput.value = ''; showImagePreview(); });
  }

  async function init() {
    bindEvents();
    try {
      const allowed = await requireAdmin();
      if (!allowed) return;
      await loadNews();
    } catch (error) {
      newsList.innerHTML = '<div class="empty-state">راه‌اندازی پنل اخبار ناموفق بود.</div>';
      showNotice(error.message || 'خطا در اتصال به Supabase.', 'error');
      console.error('[Royaye Aflak News]', error);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();


