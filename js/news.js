/* =========================================
   NEWS DATA
========================================= */

const news = [

    {
        title: "فرم ثبت نام ساخته شد",
        date: "3 مهر 1405",
        text: "فرم ثبت نام تکمیل شد و به صورت ایمیل برای برنامه نویس ارسال میشود، امکان تغییر ایمیل مقصد هم وجود دارد نسخه 1.3",
    },

    {
        title: "ویرایش و دیباگ",
        date: "2 مهر 1405",
        text: "پس زمینه آیکون عوض شد، فوتر در تمام بخش های سایت ویرایش شد، نسخه 1.2 آپلود شد"
    },

    {
        title: "اضافه شدن بخش اخبار",
        date: "22 شهریور 1405",
        text: "ثبت‌نام بازیکنان در رده‌های سنی مختلف برای فصل جدید آغاز شد."
    },


];


/* =========================================
   SETTINGS
========================================= */

const NEWS_PER_PAGE = 6;

let currentPage = 1;


/* =========================================
   ELEMENTS
========================================= */

const newsList = document.getElementById('newsList');
const pagination = document.getElementById('pagination');
const newsEmpty = document.getElementById('newsEmpty');


/* =========================================
   DATE PARSER
========================================= */

function parsePersianDate(dateString) {

    const parts = dateString.trim().split(' ');

    if (parts.length < 2) {
        return {
            day: dateString,
            month: ''
        };
    }

    return {
        day: parts[0],
        month: parts.slice(1).join(' ')
    };

}


/* =========================================
   RENDER NEWS
========================================= */

function renderNews() {

    newsList.innerHTML = '';

    if (news.length === 0) {

        newsEmpty.classList.add('visible');

        pagination.innerHTML = '';

        return;
    }

    newsEmpty.classList.remove('visible');


    const startIndex =
        (currentPage - 1) * NEWS_PER_PAGE;

    const endIndex =
        startIndex + NEWS_PER_PAGE;

    const currentNews =
        news.slice(startIndex, endIndex);


    currentNews.forEach((item, index) => {

        const date = parsePersianDate(item.date);

        const article = document.createElement('article');

        article.className = 'news-item';

        article.style.animationDelay =
            `${index * 0.05}s`;


        article.innerHTML = `

            <div class="news-date">

                <span class="news-date-day">
                    ${date.day}
                </span>

                <span class="news-date-month">
                    ${date.month}
                </span>

            </div>


            <div class="news-content">

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${item.text}
                </p>

            </div>


        `;


        newsList.appendChild(article);

    });


    renderPagination();

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination() {

    pagination.innerHTML = '';

    const totalPages =
        Math.ceil(news.length / NEWS_PER_PAGE);


    if (totalPages <= 1) {
        return;
    }


    /* Previous */

    if (currentPage > 1) {

        const previousButton =
            createPaginationButton(
                '→',
                currentPage - 1,
                true
            );

        pagination.appendChild(previousButton);

    }


    /* Page Numbers */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            createPaginationButton(
                page,
                page
            );

        pagination.appendChild(pageButton);

    }


    /* Next */

    if (currentPage < totalPages) {

        const nextButton =
            createPaginationButton(
                '←',
                currentPage + 1,
                true
            );

        pagination.appendChild(nextButton);

    }

}


/* =========================================
   CREATE PAGINATION BUTTON
========================================= */

function createPaginationButton(
    text,
    page,
    isArrow = false
) {

    const button =
        document.createElement('button');

    button.type = 'button';

    button.className =
        'pagination-button';

    if (isArrow) {
        button.classList.add('arrow');
    }

    if (page === currentPage && !isArrow) {
        button.classList.add('active');
    }

    button.textContent = text;

    button.setAttribute(
        'aria-label',
        isArrow
            ? page > currentPage
                ? 'صفحه بعد'
                : 'صفحه قبل'
            : `صفحه ${page}`
    );


    button.addEventListener(
        'click',
        () => {

            currentPage = page;

            renderNews();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        }
    );


    return button;

}


/* =========================================
   HEADER SCROLL
========================================= */

const header =
    document.querySelector('.site-header');

function handleHeaderScroll() {

    if (window.scrollY > 30) {

        header.classList.add('scrolled');

    } else {

        header.classList.remove('scrolled');

    }

}

window.addEventListener(
    'scroll',
    handleHeaderScroll,
    { passive: true }
);

handleHeaderScroll();


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
    document.getElementById('menuBtn');

const mainMenu =
    document.getElementById('mainMenu');


if (menuBtn && mainMenu) {

    menuBtn.addEventListener(
        'click',
        () => {

            const isOpen =
                mainMenu.classList.toggle('active');

            menuBtn.setAttribute(
                'aria-expanded',
                isOpen
            );

        }
    );


    mainMenu
        .querySelectorAll('a')
        .forEach(link => {

            link.addEventListener(
                'click',
                () => {

                    mainMenu.classList.remove(
                        'active'
                    );

                    menuBtn.setAttribute(
                        'aria-expanded',
                        'false'
                    );

                }
            );

        });

}


/* =========================================
   INITIALIZE
========================================= */

renderNews();