

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("equipment-modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const modalQuantity = document.getElementById("modal-quantity");
    const closeModal = document.querySelector(".close");
    const rentButtonModal = document.getElementById("rent-button-modal");

    // Завантажуємо дані про обладнання з localStorage
    const equipmentData = JSON.parse(localStorage.getItem("equipmentData"));
    
    // Функція отримання актуального inventory
    function getInventory() {
        return JSON.parse(localStorage.getItem("inventory")) || {};
    }

    // Відкриття модального вікна при натисканні на картку
    document.querySelectorAll(".equipment-card").forEach(card => {
        card.addEventListener("click", function () {
            // Якщо натиснуто на кнопку оренди, не відкриваємо модальне вікно
            if (event.target.classList.contains("rent-button")) {
                return; // Просто вийти, не відкриваючи модальне вікно
            }
            
            // Якщо натиснуто не на кнопку оренди, відкриваємо модальне вікно
            const imageName = card.querySelector("img").getAttribute("src");
            const data = equipmentData[imageName];

            if (data) {
                modalImage.src = imageName;
                modalTitle.textContent = data.title;
                modalDescription.textContent = data.description;
                modalPrice.textContent = data.price;
                modalQuantity.textContent = data.quantity;
                modal.style.display = "flex";
            }
        });
    });

    // Закриття модального вікна
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Оновлення кількості в модальному вікні при зміні inventory в localStorage
    window.addEventListener("storage", function (event) {
        if (event.key === "inventory" && modal.style.display === "flex") {
            modalQuantity.textContent = getInventory()[modalImage.src] || 0;
        }
    });
});


// Отримання інвентарю з localStorage
function getInventory() {
    return JSON.parse(localStorage.getItem("inventory")) || {};
}

// Оновлення equipmentData на основі inventory
function updateEquipmentData() {
    let inventory = getInventory();

    let equipmentData = {
        "bike.jpg": {
            title: "Велосипед",
            description: "Зручний міський велосипед з міцною рамою і амортизацією, ідеально підходить для поїздок по місту або лісових стежках.",
            price: "200",
            quantity: inventory["bike.jpg"]
        },
        "ski.jpg": {
            title: "Лижі",
            description: "Професійні лижі для катання на схилах з високоякісним кріпленням.",
            price: "300",
            quantity: inventory["ski.jpg"]
        },
        "kayak.jpg": {
            title: "Каяк",
            description: "Легкий та стійкий двомісний каяк для сплавів річками та озерами.",
            price: "500",
            quantity: inventory["kayak.jpg"]
        },
        "samokat.jpg": {
            title: "Самокат",
            description: "Маневрений самокат із міцними колесами, ідеальний для прогулянок містом.",
            price: "100",
            quantity: inventory["samokat.jpg"]
        },
        "roliki.jpg": {
            title: "Ролики",
            description: "Зручні та безпечні ролики для катання по рівних дорогах та скейтпарках.",
            price: "130",
            quantity: inventory["roliki.jpg"]
        },
        "football_myatch.jpg": {
            title: "Футбольний м'яч",
            description: "Офіційний футбольний м'яч з високоякісного матеріалу, стійкий до зносу.",
            price: "50",
            quantity: inventory["football_myatch.jpg"]
        },
        "basketball_myatch.jpg": {
            title: "Баскетбольний м'яч",
            description: "Професійний баскетбольний м'яч з чудовим зчепленням для гри як на відкритих майданчиках, так і в залах.",
            price: "50",
            quantity: inventory["basketball_myatch.jpg"]
        },
        "volleyball_myatch.jpg": {
            title: "Волейбольний м'яч",
            description: "Легкий та міцний волейбольний м'яч для ігор на пляжі чи у спортзалі.",
            price: "50",
            quantity: inventory["volleyball_myatch.jpg"]
        },
        "pingpong.jpg": {
            title: "Ракетки та м'яч для пінгпонгу",
            description: "Набір якісних ракеток та м'ячів для настільного тенісу.",
            price: "120",
            quantity: inventory["pingpong.jpg"]
        },
        "ganteli.jpg": {
            title: "Гантелі",
            description: "Компактні гантелі для домашніх тренувань різної ваги.",
            price: "100",
            quantity: inventory["ganteli.jpg"]
        },
        "kilim.jpg": {
            title: "Фітнес-килимок",
            description: "Зручний і м'який килимок для йоги та фітнесу.",
            price: "50",
            quantity: inventory["kilim.jpg"]
        }
    };

    localStorage.setItem("equipmentData", JSON.stringify(equipmentData));
}

// Викликаємо оновлення даних щоразу при завантаженні сторінки
updateEquipmentData();


document.addEventListener("DOMContentLoaded", function () {
    // Ініціалізація inventory у localStorage
    if (!localStorage.getItem("inventory")) {
        const initialInventory = {
            "bike.jpg": 5,
            "ski.jpg": 3,
            "kayak.jpg": 2,
            "samokat.jpg": 4,
            "roliki.jpg": 6,
            "football_myatch.jpg": 10,
            "basketball_myatch.jpg": 7,
            "volleyball_myatch.jpg": 5,
            "pingpong.jpg": 8,
            "ganteli.jpg": 6,
            "kilim.jpg": 12
        };
        localStorage.setItem("inventory", JSON.stringify(initialInventory));
    }

    // Функція оновлення кількості інвентарю на сторінці
    function updateInventoryDisplay() {
        let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
        document.querySelectorAll(".equipment-card").forEach(card => {
            let imgSrc = card.querySelector("img").getAttribute("src");
            let quantityElement = card.querySelector(".quantity");
            if (quantityElement) {
                quantityElement.textContent = `Доступно: ${inventory[imgSrc] || 0}`;
            }
        });
    }

    // Функція додавання замовлення
    function addOrder(itemName, price, imageSrc) {
        let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
        if (!inventory[imageSrc] || inventory[imageSrc] <= 0) {
            alert(`На жаль, ${itemName} наразі недоступний для оренди.`);
            return;
        }

        inventory[imageSrc]--;
        localStorage.setItem("inventory", JSON.stringify(inventory));
        updateInventoryDisplay(); // Оновлюємо відображення інвентарю

        const newOrder = {
            name: itemName,
            date: new Date().toLocaleDateString(),
            duration: 0,
            price: price,
            status: "очікує оплати",
            image: imageSrc
        };

        let rentedItems = JSON.parse(localStorage.getItem("rentedItems")) || [];
        rentedItems.push(newOrder);
        localStorage.setItem("rentedItems", JSON.stringify(rentedItems));

        alert(`${itemName} додано до ваших оренд!`);
    }

    // Додаємо обробник подій для кнопок оренди
    document.querySelectorAll(".rent-button").forEach(button => {
        button.addEventListener("click", function () {
            addOrder(this.dataset.name, parseInt(this.dataset.price), this.dataset.image);
        });
    });

    // Обробник для кнопки оренди в модальному вікні
    const rentButtonModal = document.getElementById("rent-button-modal");
    if (rentButtonModal) {
        rentButtonModal.addEventListener("click", function () {
            const modalImage = document.getElementById("modal-image");
            addOrder(
                document.getElementById("modal-title").textContent,
                parseInt(document.getElementById("modal-price").textContent),
                modalImage.getAttribute("src")
            );
            document.getElementById("equipment-modal").style.display = "none";
        });
    }

    // Автоматично оновлюємо інвентар, якщо змінилися дані в localStorage
    window.addEventListener("storage", function (event) {
        if (event.key === "inventory") {
            updateInventoryDisplay();
        }
    });

    updateInventoryDisplay(); // Початкове оновлення після завантаження сторінки
});


document.addEventListener("DOMContentLoaded", function () {
    let rentedItems = JSON.parse(localStorage.getItem("rentedItems")) || [];
    const ordersContainer = document.getElementById("orders-list"); // Контейнер для списку оренд

    function getInventory() {
        return JSON.parse(localStorage.getItem("inventory")) || {};
    }

    function setInventory(inventory) {
        localStorage.setItem("inventory", JSON.stringify(inventory));
    }

    function renderOrders() {
        ordersContainer.innerHTML = "";
        if (rentedItems.length === 0) {
            ordersContainer.innerHTML = "<p>У вас поки що немає оренд.</p>";
            return;
        }

        rentedItems.forEach((order, i) => {
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order");

            orderDiv.innerHTML = `
                <div class="con-stan">
                    <h3>${order.name}</h3>
                    <button class="delete-order" data-index="${i}">❌</button>
                </div>
                <p>Дата оренди: ${order.date}</p>
                <p>Тривалість: ${order.duration} дні</p>
                <p>Сума: ${order.price} грн</p>
                <div class="con-stan">
                    <p>Стан оренди: </p>
                    <p class="stan">${order.status}</p>
                </div>
                ${order.status === "очікує оплати" ? `<a href="payment.html"><button id="payment-button">Оплатити</button></a>` : ""}
            `;
            
            ordersContainer.appendChild(orderDiv);
        });
    }

    // Функція для видалення замовлення та повернення в інвентар
    function deleteOrder(index) {
        const item = rentedItems[index];
        if (confirm(`Ви впевнені, що хочете видалити '${item.name}' зі списку?`)) {
            rentedItems.splice(index, 1);
            localStorage.setItem("rentedItems", JSON.stringify(rentedItems));

            // Повертаємо товар в інвентар
            let inventory = getInventory();
            inventory[item.image] = (inventory[item.image] || 0) + 1;
            setInventory(inventory);

            renderOrders();
        }
    }

    // Обробник подій для кнопок видалення
    ordersContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-order")) {
            const index = event.target.getAttribute("data-index");
            deleteOrder(index);
        }
    });

    renderOrders();
});


function initMenuHover() {
    const menuItems = document.querySelectorAll(".menu-item");

    // Наведення на елементи меню змінює стиль
    for (let i = 0; i < menuItems.length; i++) {
        const underline = menuItems[i].querySelector(".underline");
        menuItems[i].addEventListener("mouseover", function () {
            underline.style.visibility = "visible";
            underline.style.opacity = "1";
        });
        menuItems[i].addEventListener("mouseout", function () {
            underline.style.visibility = "hidden";
            underline.style.opacity = "0";
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggle-btn");
    const hiddenSection = document.getElementById("hidden-section");
    initMenuHover();

    // Кнопка для перемикання видимості розділу
    toggleButton.addEventListener("click", function () {
        if (hiddenSection.style.display === 'block') {
            hiddenSection.style.display = 'none';
            toggleButton.textContent = 'Дізнатися про акції';
        } else {
            hiddenSection.style.display = 'block';
            toggleButton.textContent = 'Приховати акції';
        }
    });
});

function getDayLabel(duration) {
    if (duration === 1) {
        return 'день';
    } else if (duration >= 2 && duration <= 4) {
        return 'дні';
    } else {
        return 'днів';
    }
}

function clearRentedItems() {
    localStorage.setItem("rentedItems", JSON.stringify([]));
    alert("Всі оренди були очищені!");
}

function clearEquipmentData() {
    localStorage.removeItem("equipmentData"); // Видаляємо дані повністю
    alert("Всі дані були очищені!");
}

//clearEquipmentData();
//clearRentedItems();

document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо масив орендованих товарів з localStorage
    const rentedItems = JSON.parse(localStorage.getItem("rentedItems")) || [];
    const equipmentSelect = document.getElementById("equipment");
    const rentalDurationInput = document.getElementById("rental-duration");
    const paymentAmountInput = document.getElementById("paymentAmount");
    const paymentForm = document.getElementById("payment-form");
    
    // Додаткові поля для валідації
    const cardName = document.querySelector('input[placeholder="Ім\'я та прізвище"]');
    const cardNumber = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
    const expiryDate = document.querySelector('input[placeholder="DD/MM/YY"]');
    const cvv = document.querySelector('input[placeholder="123"]');

    // Фільтруємо оренди, щоб залишити тільки ті, які очікують оплати
    const itemsToPay = rentedItems.filter(item => item.status === "очікує оплати");

    // Заповнюємо список вибору товарів
    itemsToPay.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = `${item.name} - ${item.price} грн/день`;
        equipmentSelect.appendChild(option);
    });

    // Оновлення суми до сплати
    rentalDurationInput.addEventListener("input", updatePaymentAmount);
    equipmentSelect.addEventListener("change", function() {
        rentalDurationInput.value = '';
        paymentAmountInput.value = "0 грн";
    });

    // Функція для оновлення суми оплати
    function updatePaymentAmount() {
        const selectedItemName = equipmentSelect.value;
        const rentalDuration = parseInt(rentalDurationInput.value);
        
        if (!selectedItemName || !rentalDuration || rentalDuration <= 0) {
            paymentAmountInput.value = "0 грн";
            return;
        }

        if (selectedItemName === "all") {
            const totalAmount = itemsToPay.reduce((sum, item) => sum + item.price, 0) * rentalDuration;
            paymentAmountInput.value = `${totalAmount} грн`;
        } else {
            const selectedItem = rentedItems.find(item => item.name === selectedItemName);
            if (selectedItem) {
                const totalAmount = selectedItem.price * rentalDuration;
                paymentAmountInput.value = `${totalAmount} грн`;
            }
        }
    }

    // Обробка форми оплати
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Усе";
    equipmentSelect.insertBefore(allOption, equipmentSelect.firstChild);

    // Оновлюємо функцію для обробки оплати
    paymentForm.addEventListener("submit", function(event) {
        event.preventDefault();

        clearErrors();

        let isValid = true;

        if (equipmentSelect.selectedIndex === -1) {
            showError(equipmentSelect, "Будь ласка, оберіть обладнання");
            isValid = false;
        }

        if (!rentalDurationInput.value || parseInt(rentalDurationInput.value) <= 0) {
            showError(rentalDurationInput, "Введіть коректну кількість днів");
            isValid = false;
        }

        if (!cardName.value.trim()) {
            showError(cardName, "Введіть ім'я на картці");
            isValid = false;
        }

        if (!cardNumber.value.trim() || !/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
            showError(cardNumber, "Номер картки повинен містити 16 цифр");
            isValid = false;
        }

        if (!expiryDate.value.trim() || !/^\d{2}\/\d{2}\/\d{4}$/.test(expiryDate.value)) {
            showError(expiryDate, "Введіть термін дії у форматі MM/YY");
            isValid = false;
        }

        if (!cvv.value.trim() || !/^\d{3,4}$/.test(cvv.value)) {
            showError(cvv, "CVV повинен містити 3-4 цифри");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const rentalDuration = parseInt(rentalDurationInput.value);

        if (equipmentSelect.value === "all") {
            rentedItems.forEach(item => {
                if (item.status === "очікує оплати") {
                    item.status = "оплачено";
                    item.duration = rentalDuration;
                    item.paymentDate = new Date().toLocaleDateString();
                }
            });
        } else {
            const selectedItemName = equipmentSelect.value;
            rentedItems.some((item, index) => {
                if (item.name === selectedItemName && item.status === "очікує оплати") {
                    item.status = "оплачено";
                    item.duration = rentalDuration;
                    item.paymentDate = new Date().toLocaleDateString();
                    return true; 
                }
            });
        }

        localStorage.setItem("rentedItems", JSON.stringify(rentedItems));
        alert("Оплата успішно проведена!");
        paymentForm.reset();
        paymentAmountInput.value = "0 грн";

        window.location.href = "orders.html";
    });

    // Допоміжні функції для відображення помилок
    function showError(input, message) {
        // Створюємо елемент для помилки, якщо він ще не існує
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        input.style.borderColor = 'red';
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('input, select').forEach(input => {
            input.style.borderColor = '';
        });
    }

    // Форматування введених даних
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    expiryDate.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
    
        // Перевірка довжини та вставка роздільників
        if (value.length > 2 && value.length <= 4) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else if (value.length > 4) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);  // Формат MM/DD/YYYY
        }
    
        e.target.value = value; 
    });    

    cvv.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
});