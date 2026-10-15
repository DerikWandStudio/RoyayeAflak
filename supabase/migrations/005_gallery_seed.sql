insert into public.gallery_items
  (title, description, image_url, alt, category, image_date)
select seed.title, seed.description, seed.image_url, seed.alt, seed.category, seed.image_date
from (values
  ('لباس جدید طرح سفید', 'لباس های جدید مسابقات رویای افلاک', 'https://royayeaflak.ir/images/gallery/lebas1.webp', '', 'matches', '8 مهر 1405'),
  ('لباس جدید طرح لیمویی', 'لباس های جدید مسابقات رویای افلاک', 'https://royayeaflak.ir/images/gallery/lebas2.webp', '', 'matches', '8 مهر 1405'),
  ('بابک مدنی در سال 1394', 'تصویری از مربی رویای افلاک، بابک مدنی، در حین تمرین', 'https://royayeaflak.ir/images/gallery/coach1035.webp', '', 'training', '20 آبان 1394'),
  ('کلاس تئوری 4 مهرماه 1404', 'تصویری از بازیکنان نونهالان در کلاس تئوری', 'https://royayeaflak.ir/images/gallery/1405.07.04.01.webp', 'تصویری از بازیکنان نونهالان در کلاس تئوری', 'events', '04 مهر 1405')
) as seed(title, description, image_url, alt, category, image_date)
where not exists (
  select 1 from public.gallery_items existing where existing.image_url = seed.image_url
);
