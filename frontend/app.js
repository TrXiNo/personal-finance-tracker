const API_URL =
    `http://${window.location.hostname}:8000`;


// --------------------------------------------------
// ELEMENTS
// --------------------------------------------------

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");


// Transaction modal

const addTransactionButton =
    document.getElementById(
        "addTransactionButton"
    );

const transactionModal =
    document.getElementById(
        "transactionModal"
    );

const closeModalButton =
    document.getElementById(
        "closeModalButton"
    );

const transactionForm =
    document.getElementById(
        "transactionForm"
    );

const transactionMessage =
    document.getElementById(
        "transactionMessage"
    );


// Navigation

const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );

const appPages =
    document.querySelectorAll(
        ".app-page"
    );

const showAllTransactionsButton =
    document.getElementById(
        "showAllTransactionsButton"
    );


// Default transaction type

let selectedTransactionType =
    "expense";

// User settings

const userSettingsButton =
    document.getElementById(
        "userSettingsButton"
    );

const userModal =
    document.getElementById(
        "userModal"
    );

const closeUserModalButton =
    document.getElementById(
        "closeUserModalButton"
    );

const userForm =
    document.getElementById(
        "userForm"
    );

const settingsUsername =
    document.getElementById(
        "settingsUsername"
    );

const userMessage =
    document.getElementById(
        "userMessage"
    );


// New month

const newMonthButton =
    document.getElementById(
        "newMonthButton"
    );

const newMonthModal =
    document.getElementById(
        "newMonthModal"
    );

const closeNewMonthModalButton =
    document.getElementById(
        "closeNewMonthModalButton"
    );

const cancelNewMonthButton =
    document.getElementById(
        "cancelNewMonthButton"
    );

const confirmNewMonthButton =
    document.getElementById(
        "confirmNewMonthButton"
    );

const newMonthMessage =
    document.getElementById(
        "newMonthMessage"
    );

// Password settings

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );

const passwordModal =
    document.getElementById(
        "passwordModal"
    );

const closePasswordModalButton =
    document.getElementById(
        "closePasswordModalButton"
    );

const passwordForm =
    document.getElementById(
        "passwordForm"
    );

const currentPassword =
    document.getElementById(
        "currentPassword"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );

const confirmNewPassword =
    document.getElementById(
        "confirmNewPassword"
    );

const passwordMessage =
    document.getElementById(
        "passwordMessage"
    );


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            document.getElementById(
                "username"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        loginMessage.textContent =
            "Giriş yapılıyor...";


        try {

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            if (data.success) {

                loginMessage.textContent = "";

                loginPage.classList.add(
                    "hidden"
                );

                dashboardPage.classList.remove(
                    "hidden"
                );


                showPage("homePage");


                await loadDashboard();

            } else {

                loginMessage.textContent =
                    data.message;

            }


        } catch (error) {

            console.error(
                "Login hatası:",
                error
            );

            loginMessage.textContent =
                "Backend'e bağlanılamadı.";

        }

    }
);


// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_URL}/api/dashboard`
        );


        if (!response.ok) {

            throw new Error(
                "Dashboard isteği başarısız."
            );

        }


        const data =
            await response.json();


        document.getElementById(
            "dashboardUsername"
        ).textContent =
            data.username;


        document.getElementById(
            "balance"
        ).textContent =
            formatMoney(
                data.balance
            );


        document.getElementById(
            "monthlyIncome"
        ).textContent =
            formatMoney(
                data.monthly_income
            );


        document.getElementById(
            "monthlyExpense"
        ).textContent =
            formatMoney(
                data.monthly_expense
            );


        showTransactions(
            data.recent_transactions
        );


    } catch (error) {

        console.error(
            "Dashboard yüklenemedi:",
            error
        );

    }

}


// --------------------------------------------------
// RECENT TRANSACTIONS
// --------------------------------------------------

function showTransactions(transactions) {

    const container =
        document.getElementById(
            "transactionsList"
        );


    container.innerHTML = "";


    if (transactions.length === 0) {

        const emptyText =
            document.createElement("p");

        emptyText.textContent =
            "Henüz işlem bulunmuyor.";

        container.appendChild(
            emptyText
        );

        return;

    }


    transactions.forEach(
        function (transaction) {

            container.appendChild(
                createTransactionElement(
                    transaction
                )
            );

        }
    );

}


// --------------------------------------------------
// CREATE TRANSACTION HTML
// --------------------------------------------------

function createTransactionElement(
    transaction
) {

    const item =
        document.createElement("div");


    item.className =
        "transaction-item";


    // LEFT SIDE

    const left =
        document.createElement("div");


    const description =
        document.createElement("p");


    description.className =
        "transaction-description";


    description.textContent =
        transaction.description;


    const date =
        document.createElement("p");


    date.className =
        "transaction-date";


    const time =
        transaction.time ||
        "--:--:--";


    date.textContent =
        `${transaction.date} ${time}`;


    left.appendChild(
        description
    );


    left.appendChild(
        date
    );


    // RIGHT SIDE

    const amount =
        document.createElement("p");


    const isIncome =
        transaction.type === "income";


    amount.className =
        `transaction-amount ${
            isIncome
                ? "income"
                : "expense"
        }`;


    const sign =
        isIncome
            ? "+"
            : "-";


    amount.textContent =
        `${sign}${formatMoney(
            transaction.amount
        )}`;


    item.appendChild(left);

    item.appendChild(amount);


    return item;

}


// --------------------------------------------------
// ALL TRANSACTIONS
// --------------------------------------------------

async function loadAllTransactions() {

    const container =
        document.getElementById(
            "allTransactionsList"
        );


    container.innerHTML =
        "<p>Yükleniyor...</p>";


    try {

        const response = await fetch(
            `${API_URL}/api/transactions`
        );


        if (!response.ok) {

            throw new Error(
                "İşlemler alınamadı."
            );

        }


        const data =
            await response.json();


        container.innerHTML = "";


        if (
            data.transactions.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    Henüz işlem bulunmuyor.
                </div>
            `;

            return;

        }


        data.transactions.forEach(
            function (transaction) {

                container.appendChild(
                    createTransactionElement(
                        transaction
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "İşlem yükleme hatası:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                İşlemler yüklenemedi.
            </div>
        `;

    }

}


// --------------------------------------------------
// PAGE NAVIGATION
// --------------------------------------------------

function showPage(pageId) {

    appPages.forEach(
        function (page) {

            page.classList.add(
                "hidden"
            );

        }
    );


    const selectedPage =
        document.getElementById(
            pageId
        );


    if (selectedPage) {

        selectedPage.classList.remove(
            "hidden"
        );

    }


    navButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );


    const selectedButton =
        document.querySelector(
            `[data-page="${pageId}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }

}


// --------------------------------------------------
// BOTTOM NAVIGATION
// --------------------------------------------------

navButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            async function () {

                const pageId =
                    button.dataset.page;


                showPage(pageId);


                if (
                    pageId ===
                    "homePage"
                ) {

                    await loadDashboard();

                }


                if (
                    pageId ===
                    "transactionsPage"
                ) {

                    await loadAllTransactions();

                }

            }
        );

    }
);


// --------------------------------------------------
// SHOW ALL TRANSACTIONS BUTTON
// --------------------------------------------------

showAllTransactionsButton.addEventListener(
    "click",
    async function () {

        showPage(
            "transactionsPage"
        );


        await loadAllTransactions();

    }
);


// --------------------------------------------------
// OPEN TRANSACTION MODAL
// --------------------------------------------------

addTransactionButton.addEventListener(
    "click",
    function () {

        transactionModal.classList.remove(
            "hidden"
        );


        document.getElementById(
            "transactionAmount"
        ).focus();

    }
);


// --------------------------------------------------
// CLOSE TRANSACTION MODAL
// --------------------------------------------------

closeModalButton.addEventListener(
    "click",
    closeTransactionModal
);


// Modal dışına tıklanınca kapat

transactionModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            transactionModal
        ) {

            closeTransactionModal();

        }

    }
);


function closeTransactionModal() {

    transactionModal.classList.add(
        "hidden"
    );


    transactionForm.reset();


    transactionMessage.textContent = "";


    // Varsayılan olarak tekrar gider seç

    selectedTransactionType =
        "expense";


    const typeButtons =
        document.querySelectorAll(
            ".type-button"
        );


    typeButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.type ===
                "expense"
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}


// --------------------------------------------------
// TRANSACTION TYPE
// --------------------------------------------------

const typeButtons =
    document.querySelectorAll(
        ".type-button"
    );


typeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                typeButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedTransactionType =
                    button.dataset.type;

            }
        );

    }
);


// --------------------------------------------------
// ADD TRANSACTION
// --------------------------------------------------

transactionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const amount =
            parseFloat(
                document.getElementById(
                    "transactionAmount"
                ).value
            );


        const description =
            document.getElementById(
                "transactionDescription"
            ).value.trim();


        if (
            isNaN(amount) ||
            amount <= 0
        ) {

            transactionMessage.textContent =
                "Geçerli bir tutar giriniz.";

            return;

        }


        if (!description) {

            transactionMessage.textContent =
                "Açıklama giriniz.";

            return;

        }


        transactionMessage.textContent =
            "Kaydediliyor...";


        try {

            const response = await fetch(
                `${API_URL}/api/transactions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        type:
                            selectedTransactionType,

                        amount:
                            amount,

                        description:
                            description
                    })
                }
            );


            const data =
                await response.json();


            if (!data.success) {

                transactionMessage.textContent =
                    data.message;

                return;

            }


            transactionMessage.textContent =
                "✓ İşlem başarıyla eklendi.";


            // Dashboard bilgilerini yenile

            await loadDashboard();


            // Eğer işlemler sayfasındaysak
            // onu da güncelle

            if (
                !document
                    .getElementById(
                        "transactionsPage"
                    )
                    .classList.contains(
                        "hidden"
                    )
            ) {

                await loadAllTransactions();

            }


            setTimeout(
                function () {

                    closeTransactionModal();

                },
                400
            );


        } catch (error) {

            console.error(
                "İşlem ekleme hatası:",
                error
            );


            transactionMessage.textContent =
                "İşlem eklenemedi.";

        }

    }
);


// --------------------------------------------------
// MONEY FORMAT
// --------------------------------------------------

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "tr-TR",
        {
            style: "currency",
            currency: "TRY"
        }
    ).format(amount);

}


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

logoutButton.addEventListener(
    "click",
    function () {

        dashboardPage.classList.add(
            "hidden"
        );


        loginPage.classList.remove(
            "hidden"
        );


        document.getElementById(
            "password"
        ).value = "";


        loginMessage.textContent = "";


        showPage(
            "homePage"
        );

    }
);

// --------------------------------------------------
// USER SETTINGS
// --------------------------------------------------

userSettingsButton.addEventListener(
    "click",
    async function () {

        userMessage.textContent =
            "";

        try {

            const response = await fetch(
                `${API_URL}/api/user`
            );


            const data =
                await response.json();


            settingsUsername.value =
                data.username;


            userModal.classList.remove(
                "hidden"
            );


        } catch (error) {

            console.error(
                "Kullanıcı bilgisi alınamadı:",
                error
            );

        }

    }
);


closeUserModalButton.addEventListener(
    "click",
    closeUserModal
);


userModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            userModal
        ) {

            closeUserModal();

        }

    }
);


function closeUserModal() {

    userModal.classList.add(
        "hidden"
    );

    userMessage.textContent =
        "";

}


userForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            settingsUsername.value.trim();


        if (username.length < 3) {

            userMessage.textContent =
                "Kullanıcı adı en az 3 karakter olmalıdır.";

            return;

        }


        userMessage.textContent =
            "Kaydediliyor...";


        try {

            const response = await fetch(
                `${API_URL}/api/user`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username
                    })
                }
            );


            const data =
                await response.json();


            if (!data.success) {

                userMessage.textContent =
                    data.message;

                return;

            }


            userMessage.textContent =
                "✓ Kullanıcı adı güncellendi.";


            document.getElementById(
                "dashboardUsername"
            ).textContent =
                data.username;


            setTimeout(
                function () {

                    closeUserModal();

                },
                600
            );


        } catch (error) {

            console.error(error);

            userMessage.textContent =
                "Kullanıcı güncellenemedi.";

        }

    }
);

// --------------------------------------------------
// NEW MONTH
// --------------------------------------------------

newMonthButton.addEventListener(
    "click",
    function () {

        newMonthMessage.textContent =
            "";

        newMonthModal.classList.remove(
            "hidden"
        );

    }
);


closeNewMonthModalButton.addEventListener(
    "click",
    closeNewMonthModal
);


cancelNewMonthButton.addEventListener(
    "click",
    closeNewMonthModal
);


newMonthModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            newMonthModal
        ) {

            closeNewMonthModal();

        }

    }
);


function closeNewMonthModal() {

    newMonthModal.classList.add(
        "hidden"
    );

    newMonthMessage.textContent =
        "";

}


// --------------------------------------------------
// CONFIRM NEW MONTH
// --------------------------------------------------

confirmNewMonthButton.addEventListener(
    "click",
    async function () {

        newMonthMessage.textContent =
            "Yeni ay oluşturuluyor...";


        confirmNewMonthButton.disabled =
            true;


        try {

            const response = await fetch(
                `${API_URL}/api/new-month`,
                {
                    method: "POST"
                }
            );


            const data =
                await response.json();


            if (!data.success) {

                newMonthMessage.textContent =
                    data.message;

                confirmNewMonthButton.disabled =
                    false;

                return;

            }


            newMonthMessage.textContent =
                "✓ Yeni ay başarıyla başlatıldı.";


            await loadDashboard();


            await loadAllTransactions();


            setTimeout(
                function () {

                    closeNewMonthModal();


                    showPage(
                        "homePage"
                    );

                },
                800
            );


        } catch (error) {

            console.error(
                "Yeni ay hatası:",
                error
            );


            newMonthMessage.textContent =
                "Yeni ay oluşturulamadı.";

        } finally {

            confirmNewMonthButton.disabled =
                false;

        }

    }
);

// --------------------------------------------------
// CHANGE PASSWORD
// --------------------------------------------------

changePasswordButton.addEventListener(
    "click",
    function () {

        passwordMessage.textContent = "";

        passwordForm.reset();

        passwordModal.classList.remove(
            "hidden"
        );

        currentPassword.focus();

    }
);


closePasswordModalButton.addEventListener(
    "click",
    closePasswordModal
);


passwordModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            passwordModal
        ) {

            closePasswordModal();

        }

    }
);


function closePasswordModal() {

    passwordModal.classList.add(
        "hidden"
    );

    passwordForm.reset();

    passwordMessage.textContent = "";

}


// --------------------------------------------------
// PASSWORD FORM
// --------------------------------------------------

passwordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const current =
            currentPassword.value;

        const newPass =
            newPassword.value;

        const confirm =
            confirmNewPassword.value;


        // Frontend kontrolleri

        if (newPass.length < 4) {

            passwordMessage.textContent =
                "Yeni şifre en az 4 karakter olmalıdır.";

            return;

        }


        if (newPass !== confirm) {

            passwordMessage.textContent =
                "Yeni şifreler eşleşmiyor.";

            return;

        }


        if (current === newPass) {

            passwordMessage.textContent =
                "Yeni şifre eski şifreyle aynı olamaz.";

            return;

        }


        passwordMessage.textContent =
            "Şifre değiştiriliyor...";


        try {

            const response = await fetch(
                `${API_URL}/api/password`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        current_password:
                            current,

                        new_password:
                            newPass
                    })
                }
            );


            const data =
                await response.json();


            if (!data.success) {

                passwordMessage.textContent =
                    data.message;

                return;

            }


            passwordMessage.textContent =
                "✓ Şifre başarıyla değiştirildi.";


            setTimeout(
                function () {

                    closePasswordModal();

                },
                800
            );


        } catch (error) {

            console.error(
                "Şifre değiştirme hatası:",
                error
            );


            passwordMessage.textContent =
                "Şifre değiştirilemedi.";

        }

    }
);