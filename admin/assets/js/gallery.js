(() => {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const form = $('galleryForm');
    const notice = $('notice');
    const list = $('galleryList');
    const saveButton = $('saveButton');
    const deleteButton = $('deleteButton');
    const newButton = $('newItemButton');
    const resetButton = $('resetButton');
    const logoutButton = $('logoutButton');
    const searchInput = $('searchInput');
    const categoryFilter = $('categoryFilter');
    const idInput = $('itemId');
    const titleInput = $('itemTitle');
    const urlInput = $('itemUrl');
    const categoryInput = $('itemCategory');
    const dateInput = $('itemDate');
    const descriptionInput = $('itemDescription');
    const altInput = $('itemAlt');
    const preview = $('imagePreview');
    const previewPlaceholder = $('previewPlaceholder');
    const categoryNames = { training: 'تمرینات', matches: 'مسابقات', teams: 'تیم‌ها', events: 'رویدادها' };
    let client = null;
    let currentUser = null;
    let items = [];

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    const faNumber = (n) => new Intl.NumberFormat('fa-IR').format(n);
    function showNotice(message, type = 'info') { notice.textContent = message; notice.className = `gallery-notice ${type}`; notice.hidden = false; }
    function hideNotice() { notice.textContent = ''; notice.hidden = true; }
    function setBusy(busy) { saveButton.disabled = busy; deleteButton.disabled = busy; newButton.disabled = busy; }
    function friendlyError(error) {
        const message = error?.message || 'خطای نامشخص';
        if (message.includes('gallery_items')) return 'جدول gallery_items پیدا نشد یا ساختار دیتابیس با فایل SQL هماهنگ نیست.';
        if (message.toLowerCase().includes('row-level security')) return 'دسترسی رد شد؛ عضویت حساب در admin_users و سیاست‌های RLS را بررسی کن.';
        if (message.toLowerCase().includes('failed to fetch')) return 'ارتباط با Supabase برقرار نشد؛ اینترنت و وضعیت پروژه را بررسی کن.';
        return message;
    }
    function validImageUrl(value) {
        try { const url = new URL(value); return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname); }
        catch { return false; }
    }
    function setPreview(url) {
        if (!url || !validImageUrl(url)) { preview.hidden = true; preview.removeAttribute('src'); previewPlaceholder.hidden = false; return; }
        preview.hidden = false; previewPlaceholder.hidden = true; preview.src = url;
    }
    preview.addEventListener('error', () => { preview.hidden = true; previewPlaceholder.hidden = false; previewPlaceholder.textContent = 'تصویر بارگذاری نشد؛ لینک مستقیم را بررسی کن.'; });
    preview.addEventListener('load', () => { previewPlaceholder.textContent = 'پیش‌نمایش پس از واردکردن لینک نمایش داده می‌شود.'; });
    urlInput.addEventListener('input', () => setPreview(urlInput.value.trim()));

    function updateStats() {
        $('totalCount').textContent = faNumber(items.length);
        $('trainingCount').textContent = faNumber(items.filter(x => x.category === 'training').length);
        $('matchesCount').textContent = faNumber(items.filter(x => x.category === 'matches').length);
        $('otherCount').textContent = faNumber(items.filter(x => ['teams', 'events'].includes(x.category)).length);
    }
    function renderList() {
        updateStats();
        const query = (searchInput.value || '').trim().toLocaleLowerCase('fa');
        const category = categoryFilter.value;
        const filtered = items.filter(item => {
            const matchesCategory = category === 'all' || item.category === category;
            const haystack = `${item.title || ''} ${item.description || ''} ${item.image_date || ''}`.toLocaleLowerCase('fa');
            return matchesCategory && (!query || haystack.includes(query));
        });
        if (!filtered.length) { list.innerHTML = '<div class="gallery-admin-empty">تصویری مطابق جست‌وجو پیدا نشد.</div>'; return; }
        list.innerHTML = filtered.map(item => `
      <article class="gallery-admin-item ${String(item.id) === String(idInput.value) ? 'selected' : ''}" data-item-id="${escapeHtml(item.id)}">
        <img class="gallery-admin-thumb" src="${escapeHtml(item.image_url)}" alt="" loading="lazy" referrerpolicy="no-referrer">
        <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.image_date || 'بدون تاریخ')}</p><span class="gallery-admin-category">${escapeHtml(categoryNames[item.category] || 'گالری')}</span></div>
        <button class="gallery-edit-button" type="button" data-edit-id="${escapeHtml(item.id)}">ویرایش</button>
      </article>`).join('');
    }
    function resetForm() {
        form.reset(); idInput.value = ''; setPreview('');
        $('editorHeading').textContent = 'افزودن تصویر'; $('editorMode').textContent = 'تصویر جدید';
        saveButton.textContent = 'ذخیرهٔ تصویر'; deleteButton.hidden = true; hideNotice(); renderList();
    }
    function fillForm(item) {
        if (!item) return;
        idInput.value = item.id; titleInput.value = item.title || ''; urlInput.value = item.image_url || '';
        categoryInput.value = item.category || 'training'; dateInput.value = item.image_date || '';
        descriptionInput.value = item.description || ''; altInput.value = item.alt || ''; setPreview(urlInput.value);
        $('editorHeading').textContent = 'ویرایش تصویر'; $('editorMode').textContent = 'ویرایش رکورد';
        saveButton.textContent = 'ذخیرهٔ تغییرات'; deleteButton.hidden = false; hideNotice(); renderList();
    }
    function validate() {
        const title = titleInput.value.trim(); const imageUrl = urlInput.value.trim();
        if (!title) return { error: 'عنوان تصویر را وارد کن.' };
        if (!validImageUrl(imageUrl)) return { error: 'لینک تصویر باید یک آدرس معتبر با http:// یا https:// باشد.' };
        if (!Object.hasOwn(categoryNames, categoryInput.value)) return { error: 'یک دسته‌بندی معتبر انتخاب کن.' };
        return { data: { title, image_url: imageUrl, category: categoryInput.value, image_date: dateInput.value.trim(), description: descriptionInput.value.trim(), alt: altInput.value.trim() } };
    }
    async function saveItem(event) {
        event.preventDefault(); hideNotice();
        const validation = validate(); if (validation.error) { showNotice(validation.error, 'error'); return; }
        const existingId = idInput.value; setBusy(true);
        try {
            let result;
            if (existingId) {
                result = await client.from('gallery_items').update(validation.data).eq('id', existingId).select().single();
            } else {
                result = await client.from('gallery_items').insert({ ...validation.data, created_by: currentUser.id }).select().single();
            }
            if (result.error) throw result.error;
            await loadItems();
            const saved = items.find(item => String(item.id) === String(result.data.id));
            if (saved) fillForm(saved); else resetForm();
            showNotice(existingId ? 'تغییرات تصویر ذخیره شد.' : 'تصویر به گالری اضافه شد.', 'success');
        } catch (error) { console.error('Save gallery item error:', error); showNotice(`ذخیره تصویر ناموفق بود: ${friendlyError(error)}`, 'error'); }
        finally { setBusy(false); }
    }
    async function deleteItem() {
        const id = idInput.value;
        if (!id) { showNotice('ابتدا تصویری را برای حذف انتخاب کن.', 'error'); return; }
        if (!window.confirm('از حذف این تصویر از گالری مطمئنی؟ فایل اصلی در میزبان خارجی حذف نمی‌شود.')) return;
        setBusy(true);
        try {
            const { error } = await client.from('gallery_items').delete().eq('id', id);
            if (error) throw error;
            resetForm(); await loadItems(); showNotice('رکورد تصویر از گالری حذف شد.', 'success');
        } catch (error) { console.error('Delete gallery item error:', error); showNotice(`حذف تصویر ناموفق بود: ${friendlyError(error)}`, 'error'); }
        finally { setBusy(false); }
    }
    async function loadItems() {
        list.innerHTML = '<div class="gallery-admin-empty">در حال دریافت تصاویر…</div>';
        const { data, error } = await client.from('gallery_items').select('id,title,description,image_url,alt,category,image_date,created_by,created_at,updated_at').order('created_at', { ascending: false });
        if (error) throw error;
        items = data || []; renderList();
    }
    async function logout() {
        try { await client?.auth.signOut(); } catch (error) { console.error('Logout error:', error); }
        window.location.href = 'login.html';
    }
    async function init() {
        client = window.AdminApp?.client || null;
        if (!client) { showNotice(window.AdminApp?.initError?.message || 'اتصال Supabase برقرار نیست.', 'error'); list.innerHTML = '<div class="gallery-admin-empty">راه‌اندازی Supabase ناموفق بود.</div>'; return; }
        try {
            if (!window.AdminApp?.auth?.requireAdmin) throw new Error('توابع احراز هویت پنل بارگذاری نشده‌اند.');
            const session = await window.AdminApp.auth.requireAdmin();
            if (!session?.user) return;
            currentUser = session.user;
            form.addEventListener('submit', saveItem); newButton.addEventListener('click', resetForm); resetButton.addEventListener('click', resetForm);
            deleteButton.addEventListener('click', deleteItem); logoutButton.addEventListener('click', logout);
            searchInput.addEventListener('input', renderList); categoryFilter.addEventListener('change', renderList);
            list.addEventListener('click', event => {
                const button = event.target.closest('[data-edit-id]'); const article = event.target.closest('[data-item-id]');
                const id = button?.dataset.editId || article?.dataset.itemId; if (!id) return;
                const item = items.find(entry => String(entry.id) === String(id)); if (item) fillForm(item);
            });
            await loadItems(); resetForm();
        } catch (error) {
            console.error('Admin gallery initialization error:', error); showNotice(`راه‌اندازی مدیریت گالری ناموفق بود: ${friendlyError(error)}`, 'error');
            list.innerHTML = '<div class="gallery-admin-empty">دریافت تصاویر با خطا مواجه شد.</div>';
        }
    }
    document.addEventListener('DOMContentLoaded', init);
})();
