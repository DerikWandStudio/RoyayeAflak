-- Royaye Aflak: Persian display date + seed existing public news.
-- Run AFTER 002_news.sql. Safe to run more than once.

alter table public.news add column if not exists news_date text;

-- Keep the old public news list when switching from the hard-coded JS array to Supabase.
-- Internal slugs are only database identifiers; no public slug routes are created.
insert into public.news (title, slug, excerpt, body, image_url, status, published_at, news_date)
values
 ('آپدیت 1.9 سایت', 'legacy-site-update-19', '', 'سئو سایت بهینه سازی شد و روی سرچ گوگل قرار گرفت', '', 'published', '2026-10-07T09:00:00+03:30', '۱۵ مهر ۱۴۰۵'),
 ('آپدیت 1.8 سایت', 'legacy-site-update-18', '', 'آمادگی کامل سایت برای لانچ نهایی | مراحل کدنویسی به پایان رسید + آپلود عکس ها', '', 'published', '2026-10-06T09:00:00+03:30', '۱۴ مهر ۱۴۰۵'),
 ('آپدیت 1.7 سایت', 'legacy-site-update-17', '', 'پایان کدنویسی سایت. تغییرات: پس زمینه چرخشی و رفع باگ های پشت صحنه؛ باقیمانده تا عرضه: فقط آپلود عکس ها', '', 'published', '2026-10-01T09:00:00+03:30', '۹ مهر ۱۴۰۵'),
 ('زمان تخمینی راه اندازی', 'legacy-launch-estimate', '', 'تقریبا تا پانزدهم مهرماه سایت در دسترس است و سوت آغاز به صدا در می آید', '', 'published', '2026-10-01T08:00:00+03:30', '۱۵ مهر ۱۴۰۵'),
 ('آپدیت 1.6 سایت', 'legacy-site-update-16', '', 'نزدیک شدن به نسخه 2.0 و عرضه نهایی وبسایت؛ تغییرات: کدنویسی پس زمینه اسکن لاین برای تمامی صفحات', '', 'published', '2026-09-30T09:00:00+03:30', '۸ مهر ۱۴۰۵'),
 ('آپدیت 1.5 سایت', 'legacy-site-update-15', '', 'تنظیم شدن لوگو برای صفحات سایت + مرتب سازی و هماهنگی ساختار بخش اخبار با صفحات دیگر', '', 'published', '2026-09-29T09:00:00+03:30', '۷ مهر ۱۴۰۵'),
 ('کلاس تئوری نونهالان', 'legacy-youngsters-theory-class', '', 'کلاس تئوری نونهالان ب در دفتر باشگاه', '', 'published', '2026-09-26T09:00:00+03:30', '۴ مهر ۱۴۰۵'),
 ('فرم ثبت نام ساخته شد', 'legacy-registration-form', '', 'فرم ثبت نام تکمیل شد و به صورت ایمیل برای برنامه نویس ارسال میشود، امکان تغییر ایمیل مقصد هم وجود دارد نسخه 1.3', '', 'published', '2026-09-25T09:00:00+03:30', '۳ مهر ۱۴۰۵'),
 ('ویرایش و دیباگ', 'legacy-edit-debug', '', 'پس زمینه آیکون عوض شد، فوتر در تمام بخش های سایت ویرایش شد، نسخه 1.2 آپلود شد', '', 'published', '2026-09-24T09:00:00+03:30', '۲ مهر ۱۴۰۵'),
 ('اضافه شدن بخش اخبار', 'legacy-news-section', '', 'ثبت‌نام بازیکنان در رده‌های سنی مختلف برای فصل جدید آغاز شد.', '', 'published', '2026-09-13T09:00:00+03:30', '۲۲ شهریور ۱۴۰۵')
on conflict (slug) do nothing;
