document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("formMessage");

    const textarea = document.getElementById("message");
    const charCount = document.getElementById("charCount");

    const parentPhone = document.getElementById("parentPhone");
    const playerPhone = document.getElementById("playerPhone");


    /* =========================================
       CHARACTER COUNTER
    ========================================== */

    if (textarea && charCount) {

        textarea.addEventListener("input", () => {

            charCount.textContent =
                textarea.value.length.toLocaleString("fa-IR");

        });

    }


    /* =========================================
       PHONE NORMALIZER
    ========================================== */

    function normalizePhone(value) {

        return value
            .replace(/[۰-۹]/g, (digit) =>
                String.fromCharCode(
                    digit.charCodeAt(0) - 1728
                )
            )
            .replace(/\s+/g, "")
            .replace(/-/g, "");

    }


    /* =========================================
       VALIDATE PHONE
    ========================================== */

    function isValidPhone(value) {

        const phone = normalizePhone(value);

        return /^09\d{9}$/.test(phone);

    }


    /* =========================================
       PHONE INPUTS
    ========================================== */

    [parentPhone, playerPhone].forEach((input) => {

        if (!input) {
            return;
        }

        input.addEventListener("input", () => {

            input.value = input.value
                .replace(/[^\d۰-۹]/g, "");

        });

    });


    /* =========================================
       SHOW MESSAGE
    ========================================== */

    function showMessage(text, type) {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.className =
            `form-message ${type}`;

    }
    /* =========================================
       JALALI BIRTH DATE
    ========================================= */

    const birthYear = document.getElementById("birthYear");
    const birthMonth = document.getElementById("birthMonth");
    const birthDay = document.getElementById("birthDay");

    if (birthYear && birthMonth && birthDay) {

        /*
         * سال‌های مناسب برای ثبت‌نام
         * فعلاً از 1350 تا 1400
         */

        for (let year = 1400; year >= 1350; year--) {

            const option = document.createElement("option");

            option.value = year;
            option.textContent = year.toLocaleString("fa-IR");

            birthYear.appendChild(option);
        }


        /*
         * ساخت روزهای ماه
         */

        function updateBirthDays() {

            const month = Number(birthMonth.value);

            const previousValue = birthDay.value;

            birthDay.innerHTML = `
            <option value="">
                روز
            </option>
        `;

            if (!month) {
                return;
            }

            const daysInMonth = month <= 6 ? 31 : 30;

            for (let day = 1; day <= daysInMonth; day++) {

                const option = document.createElement("option");

                option.value = day;
                option.textContent = day.toLocaleString("fa-IR");

                birthDay.appendChild(option);
            }

            /*
             * حفظ روز قبلی در صورت معتبر بودن
             */

            if (
                previousValue &&
                Number(previousValue) <= daysInMonth
            ) {
                birthDay.value = previousValue;
            }

        }


        birthMonth.addEventListener(
            "change",
            updateBirthDays
        );

    }


    /* =========================================
       BIRTH DATE VALIDATION
    ========================================= */

    function isValidBirthDate() {

        if (
            !birthYear ||
            !birthMonth ||
            !birthDay
        ) {
            return false;
        }

        return (
            birthYear.value !== "" &&
            birthMonth.value !== "" &&
            birthDay.value !== ""
        );

    }

    /* =========================================
       FORM SUBMIT
    ========================================== */

    if (form) {

        form.addEventListener("submit", (event) => {

            event.preventDefault();

            if (!form.checkValidity()) {

                form.reportValidity();

                showMessage(
                    "لطفاً تمام فیلدهای الزامی را به‌درستی تکمیل کنید.",
                    "error"
                );

                return;

            }


            if (
                parentPhone &&
                !isValidPhone(parentPhone.value)
            ) {

                parentPhone.focus();

                showMessage(
                    "شماره تماس والدین را به شکل صحیح وارد کنید.",
                    "error"
                );

                return;

            }


            if (
                playerPhone &&
                playerPhone.value.trim() !== "" &&
                !isValidPhone(playerPhone.value)
            ) {

                playerPhone.focus();

                showMessage(
                    "شماره تماس بازیکن را به شکل صحیح وارد کنید.",
                    "error"
                );

                return;

            }


            /*
             * فعلاً ارسال واقعی وجود ندارد.
             * بعداً همین قسمت را به Backend یا
             * سرویس فرم متصل می‌کنیم.
             */

            showMessage(
                "فرم با موفقیت بررسی شد. در نسخه فعلی، اطلاعات هنوز به سرور ارسال نمی‌شود.",
                "success"
            );

        });

    }

});