const SUPABASE_URL = "https://nqzlxhcpildvorrkaroi.supabase.co";

const SUPABASE_KEY = "sb_publishable_UkOgX2vv_qvTYoQ76Hyreg_lGQn-fv7";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("formMessage");
    const textarea = document.getElementById("message");
    const charCount = document.getElementById("charCount");
    const parentPhone = document.getElementById("parentPhone");
    const playerPhone = document.getElementById("playerPhone");
    const birthDateInput = document.getElementById("birthDate");


    // =========================================
    // CHARACTER COUNTER
    // =========================================

    if (textarea && charCount) {

        textarea.addEventListener("input", () => {

            charCount.textContent =
                textarea.value.length.toLocaleString("fa-IR");

        });

    }


    // =========================================
    // PHONE NORMALIZER
    // =========================================

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


    // =========================================
    // VALIDATE PHONE
    // =========================================

    function isValidPhone(value) {

        const phone = normalizePhone(value);

        return /^09\d{9}$/.test(phone);

    }


    // =========================================
    // PHONE INPUTS
    // =========================================

    [parentPhone, playerPhone].forEach((input) => {

        if (!input) {
            return;
        }

        input.addEventListener("input", () => {

            input.value = input.value
                .replace(/[^\d۰-۹]/g, "");

        });

    });


    // =========================================
    // SHOW MESSAGE
    // =========================================

    function showMessage(text, type) {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.className = `form-message ${type}`;

    }


    // =========================================
    // FORM SUBMIT
    // =========================================

    if (form) {

        form.addEventListener("submit", async (event) => {

            event.preventDefault();


            // =========================================
            // HTML VALIDATION
            // =========================================

            if (!form.checkValidity()) {

                form.reportValidity();

                showMessage(
                    "لطفاً تمام فیلدهای الزامی را به‌درستی تکمیل کنید.",
                    "error"
                );

                return;

            }


            // =========================================
            // PARENT PHONE VALIDATION
            // =========================================

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


            // =========================================
            // PLAYER PHONE VALIDATION
            // =========================================

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


            // =========================================
            // BIRTH DATE VALIDATION
            // =========================================

            const birthDate = birthDateInput
                ? birthDateInput.value.trim()
                : "";

            if (!/^\d{4}\/\d{2}\/\d{2}$/.test(birthDate)) {

                if (birthDateInput) {
                    birthDateInput.focus();
                }

                showMessage(
                    "تاریخ تولد را به شکل 1392/05/18 وارد کنید.",
                    "error"
                );

                return;

            }


            // =========================================
            // REGISTRATION DATA
            // =========================================

            const registration = {

                full_name:
                    document
                        .getElementById("fullName")
                        .value
                        .trim(),

                father_name:
                    document
                        .getElementById("fatherName")
                        .value
                        .trim(),

                birth_date:
                    birthDate,

                age_group:
                    document
                        .getElementById("ageGroup")
                        .value,

                position:
                    document
                        .getElementById("position")
                        .value,

                experience:
                    document
                        .getElementById("experience")
                        .value,

                parent_phone:
                    normalizePhone(parentPhone.value),

                player_phone:
                    playerPhone &&
                        playerPhone.value.trim() !== ""
                        ? normalizePhone(playerPhone.value)
                        : null,

                message:
                    textarea
                        ? textarea.value.trim()
                        : null

            };


            // =========================================
            // SENDING
            // =========================================

            showMessage(
                "در حال ارسال درخواست...",
                "success"
            );


            // =========================================
            // SAVE TO SUPABASE
            // =========================================

            const { error } = await supabaseClient
                .from("registrations")
                .insert([registration]);


            if (error) {

                console.error(
                    "Supabase error:",
                    error
                );

                showMessage(
                    "ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
                    "error"
                );

                return;

            }


            // =========================================
            // SEND EMAIL
            // =========================================

            const { error: emailError } =
                await supabaseClient.functions.invoke(
                    "hyper-endpoint",
                    {
                        body: {

                            fullName:
                                registration.full_name,

                            fatherName:
                                registration.father_name,

                            birthDate:
                                registration.birth_date,

                            ageGroup:
                                registration.age_group,

                            position:
                                registration.position,

                            experience:
                                registration.experience,

                            parentPhone:
                                registration.parent_phone,

                            playerPhone:
                                registration.player_phone,

                            message:
                                registration.message

                        }
                    }
                );


            if (emailError) {

                console.error("Email error:", emailError);

                showMessage(
                    "خطای ارسال ایمیل. F12 → Console را بررسی کنید.",
                    "error"
                );

                return;
            }


            // =========================================
            // SUCCESS
            // =========================================

            showMessage(
                "درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.",
                "success"
            );


            // =========================================
            // RESET FORM
            // =========================================

            form.reset();

            if (charCount) {

                charCount.textContent = "۰";

            }

        });

    }

});