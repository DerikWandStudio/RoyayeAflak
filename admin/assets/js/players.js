(() => {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const form = $('playerForm');
    const notice = $('notice');
    const list = $('playersList');
    const saveButton = $('saveButton');
    const deleteButton = $('deleteButton');
    const newButton = $('newPlayerButton');
    const resetButton = $('resetButton');
    const logoutButton = $('logoutButton');
    const searchInput = $('searchInput');
    const groupFilter = $('groupFilter');
    const statusFilter = $('statusFilter');
    const idInput = $('playerId');
    const fullNameInput = $('fullName');
    const imageUrlInput = $('imageUrl');
    const birthDateInput = $('birthDate');
    const jerseyNumberInput = $('jerseyNumber');
    const positionInput = $('position');
    const ageGroupInput = $('ageGroup');
    const teamNameInput = $('teamName');
    const descriptionInput = $('description');
    const isActiveInput = $('isActive');
    const preview = $('imagePreview');
    const previewPlaceholder = $('previewPlaceholder');
    const positions = { goalkeeper: 'دروازه‌بان', defender: 'مدافع', midfielder: 'هافبک', forward: 'مهاجم' };
    const ageGroups = ['نوباوگان الف', 'نوباوگان ب', 'نونهالان الف', 'نونهالان ب', 'نوجوانان', 'جوانان', 'بزرگسالان'];
    let client = null;
    let currentUser = null;
    let players = [];

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    const faNumber = (n) => new Intl.NumberFormat('fa-IR').format(n);
    function showNotice(message, type = 'info') { notice.textContent = message; notice.className = `players-notice ${type}`; notice.hidden = false; }
    function hideNotice() { notice.textContent = ''; notice.hidden = true; }
    function setBusy(busy) { saveButton.disabled = busy; deleteButton.disabled = busy; newButton.disabled = busy; resetButton.disabled = busy; }
    function friendlyError(error) {
        const message = error?.message || 'خطای نامشخص';
        if (message.includes('academy_players')) return 'جدول academy_players پیدا نشد یا SQL ساخت جدول هنوز اجرا نشده است.';
        if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('permission denied')) return 'دسترسی رد شد؛ عضویت ادمین در admin_users و سیاست‌های RLS را بررسی کن.';
        if (message.toLowerCase().includes('failed to fetch')) return 'ارتباط با Supabase برقرار نشد؛ اینترنت و وضعیت پروژه را بررسی کن.';
        return message;
    }
    function validImageUrl(value) {
        if (!value) return false;
        try { const url = new URL(value); return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname); }
        catch { return false; }
    }
    function setPreview(url) {
        if (!url || !validImageUrl(url)) { preview.hidden = true; preview.removeAttribute('src'); previewPlaceholder.hidden = false; previewPlaceholder.textContent = 'پیش‌نمایش تصویر پس از واردکردن لینک نمایش داده می‌شود.'; return; }
        preview.hidden = false; previewPlaceholder.hidden = true; preview.src = url;
    }
    preview.addEventListener('error', () => { preview.hidden = true; previewPlaceholder.hidden = false; previewPlaceholder.textContent = 'تصویر بارگذاری نشد؛ لینک مستقیم را بررسی کن.'; });
    preview.addEventListener('load', () => { previewPlaceholder.textContent = 'پیش‌نمایش تصویر پس از واردکردن لینک نمایش داده می‌شود.'; });
    imageUrlInput.addEventListener('input', () => setPreview(imageUrlInput.value.trim()));

    function updateStats() {
        $('totalCount').textContent = faNumber(players.length);
        $('activeCount').textContent = faNumber(players.filter(p => p.is_active).length);
        $('goalkeeperCount').textContent = faNumber(players.filter(p => p.position === 'goalkeeper').length);
        $('groupsCount').textContent = faNumber(new Set(players.map(p => (p.age_group || '').trim()).filter(Boolean)).size);
    }
    function updateGroupFilter() {
        const selected = groupFilter.value;
        groupFilter.innerHTML = '<option value="all">همهٔ رده‌ها</option>' + ageGroups.map(group => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join('');
        if (ageGroups.includes(selected)) groupFilter.value = selected;
    }
    function renderList() {
        updateStats(); updateGroupFilter();
        const query = (searchInput.value || '').trim().toLocaleLowerCase('fa');
        const group = groupFilter.value;
        const status = statusFilter.value;
        const filtered = players.filter(player => {
            const matchesGroup = group === 'all' || (player.age_group || '') === group;
            const matchesStatus = status === 'all' || (status === 'active' ? player.is_active : !player.is_active);
            const haystack = `${player.full_name || ''} ${player.team_name || ''} ${player.age_group || ''} ${player.position ? positions[player.position] || player.position : ''} ${player.jersey_number ?? ''}`.toLocaleLowerCase('fa');
            return matchesGroup && matchesStatus && (!query || haystack.includes(query));
        });
        if (!filtered.length) { list.innerHTML = '<div class="players-empty">بازیکنی مطابق فیلترها پیدا نشد.</div>'; return; }
        list.innerHTML = filtered.map(player => `
      <article class="player-item ${String(player.id) === String(idInput.value) ? 'selected' : ''}" data-player-id="${escapeHtml(player.id)}" tabindex="0" role="button" aria-label="ویرایش ${escapeHtml(player.full_name)}">
        <img class="player-thumb" src="${escapeHtml(player.image_url || '')}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">
        <div><h3>${escapeHtml(player.full_name)}</h3><p>${escapeHtml([player.team_name, player.age_group].filter(Boolean).join(' • ') || 'تیم یا رده ثبت نشده')}</p><div class="player-item-meta"><span>${escapeHtml(positions[player.position] || 'پست ثبت نشده')}</span>${player.jersey_number !== null && player.jersey_number !== '' ? `<span>شماره ${escapeHtml(player.jersey_number)}</span>` : ''}<span class="player-status ${player.is_active ? '' : 'inactive'}">${player.is_active ? 'فعال' : 'غیرفعال'}</span></div></div>
        <button class="player-edit-button" type="button" data-edit-id="${escapeHtml(player.id)}">ویرایش</button>
      </article>`).join('');
    }
    function resetForm() {
        form.reset(); idInput.value = ''; isActiveInput.checked = true; setPreview('');
        $('editorHeading').textContent = 'افزودن بازیکن'; $('editorMode').textContent = 'بازیکن جدید';
        saveButton.textContent = 'ذخیرهٔ بازیکن'; deleteButton.hidden = true; hideNotice(); renderList();
    }
    function fillForm(player) {
        if (!player) return;
        idInput.value = player.id; fullNameInput.value = player.full_name || ''; imageUrlInput.value = player.image_url || '';
        birthDateInput.value = player.birth_date || ''; jerseyNumberInput.value = player.jersey_number ?? '';
        positionInput.value = player.position || ''; ageGroupInput.value = player.age_group || ''; teamNameInput.value = player.team_name || '';
        descriptionInput.value = player.description || ''; isActiveInput.checked = player.is_active !== false; setPreview(imageUrlInput.value);
        $('editorHeading').textContent = 'ویرایش بازیکن'; $('editorMode').textContent = 'ویرایش رکورد';
        saveButton.textContent = 'ذخیرهٔ تغییرات'; deleteButton.hidden = false; hideNotice(); renderList();
    }
    function validate() {
        const fullName = fullNameInput.value.trim();
        const imageUrl = imageUrlInput.value.trim();
        if (!fullName) return { error: 'نام و نام خانوادگی بازیکن را وارد کن.' };
        if (!validImageUrl(imageUrl)) return { error: 'آدرس عکس الزامی است و باید لینک معتبر http:// یا https:// باشد.' };
        const rawNumber = jerseyNumberInput.value.trim();
        const jerseyNumber = rawNumber === '' ? null : Number(rawNumber);
        if (jerseyNumber === null || !Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) return { error: 'شمارهٔ پیراهن را به‌صورت عدد صحیح بین ۰ تا ۹۹ وارد کن.' };
        if (!ageGroups.includes(ageGroupInput.value)) return { error: 'یکی از هفت ردهٔ سنی تعریف‌شده را انتخاب کن.' };
        if (!positionInput.value || !Object.prototype.hasOwnProperty.call(positions, positionInput.value)) return { error: 'پست بازیکن را انتخاب کن.' };
        return {
            data: {
                full_name: fullName, image_url: imageUrl || null, birth_date: birthDateInput.value.trim() || null,
                jersey_number: jerseyNumber, position: positionInput.value, age_group: ageGroupInput.value,
                team_name: teamNameInput.value.trim() || null, description: descriptionInput.value.trim() || null,
                is_active: isActiveInput.checked
            }
        };
    }
    async function savePlayer(event) {
        event.preventDefault(); hideNotice();
        const validation = validate(); if (validation.error) { showNotice(validation.error, 'error'); return; }
        const existingId = idInput.value; setBusy(true);
        try {
            let result;
            if (existingId) result = await client.from('academy_players').update(validation.data).eq('id', existingId).select().single();
            else result = await client.from('academy_players').insert({ ...validation.data, created_by: currentUser.id }).select().single();
            if (result.error) throw result.error;
            await loadPlayers();
            const saved = players.find(player => String(player.id) === String(result.data.id));
            if (saved) fillForm(saved); else resetForm();
            showNotice(existingId ? 'تغییرات بازیکن ذخیره شد.' : 'بازیکن جدید ثبت شد.', 'success');
        } catch (error) { console.error('Save player error:', error); showNotice(`ذخیرهٔ بازیکن ناموفق بود: ${friendlyError(error)}`, 'error'); }
        finally { setBusy(false); }
    }
    async function deletePlayer() {
        const id = idInput.value;
        if (!id) { showNotice('ابتدا بازیکنی را برای حذف انتخاب کن.', 'error'); return; }
        if (!window.confirm('از حذف این بازیکن مطمئنی؟ این کار فقط رکورد اطلاعات بازیکن را حذف می‌کند و فایل تصویر در میزبان خارجی باقی می‌ماند.')) return;
        setBusy(true);
        try {
            const { error } = await client.from('academy_players').delete().eq('id', id);
            if (error) throw error;
            resetForm(); await loadPlayers(); showNotice('اطلاعات بازیکن حذف شد.', 'success');
        } catch (error) { console.error('Delete player error:', error); showNotice(`حذف بازیکن ناموفق بود: ${friendlyError(error)}`, 'error'); }
        finally { setBusy(false); }
    }
    async function loadPlayers() {
        list.innerHTML = '<div class="players-empty">در حال دریافت بازیکنان…</div>';
        const { data, error } = await client.from('academy_players').select('id,full_name,image_url,birth_date,jersey_number,position,age_group,team_name,description,is_active,created_by,created_at,updated_at').order('created_at', { ascending: false });
        if (error) throw error;
        players = data || []; renderList();
    }
    async function logout() {
        try { await client?.auth.signOut(); } catch (error) { console.error('Logout error:', error); }
        window.location.href = 'login.html';
    }
    async function init() {
        client = window.AdminApp?.client || null;
        if (!client) { showNotice(window.AdminApp?.initError?.message || 'اتصال Supabase برقرار نیست.', 'error'); list.innerHTML = '<div class="players-empty">راه‌اندازی Supabase ناموفق بود.</div>'; return; }
        try {
            if (!window.AdminApp?.auth?.requireAdmin) throw new Error('توابع احراز هویت پنل بارگذاری نشده‌اند.');
            const session = await window.AdminApp.auth.requireAdmin();
            if (!session?.user) return;
            currentUser = session.user;
            form.addEventListener('submit', savePlayer); newButton.addEventListener('click', resetForm); resetButton.addEventListener('click', resetForm);
            deleteButton.addEventListener('click', deletePlayer); logoutButton.addEventListener('click', logout);
            searchInput.addEventListener('input', renderList); groupFilter.addEventListener('change', renderList); statusFilter.addEventListener('change', renderList);
            list.addEventListener('click', event => {
                const button = event.target.closest('[data-edit-id]'); const article = event.target.closest('[data-player-id]');
                const id = button?.dataset.editId || article?.dataset.playerId; if (!id) return;
                const player = players.find(entry => String(entry.id) === String(id)); if (player) fillForm(player);
            });
            list.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                const article = event.target.closest('[data-player-id]'); if (!article || event.target.closest('button')) return;
                event.preventDefault(); const player = players.find(entry => String(entry.id) === String(article.dataset.playerId)); if (player) fillForm(player);
            });
            await loadPlayers(); resetForm();
        } catch (error) {
            console.error('Admin players initialization error:', error);
            showNotice(`راه‌اندازی مدیریت بازیکنان ناموفق بود: ${friendlyError(error)}`, 'error');
            list.innerHTML = '<div class="players-empty">دریافت بازیکنان با خطا مواجه شد.</div>';
        }
    }
    document.addEventListener('DOMContentLoaded', init);
})();
