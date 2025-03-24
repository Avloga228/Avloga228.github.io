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

document.addEventListener("DOMContentLoaded", function () {
    const rentButtons = document.querySelectorAll(".rent-button");

    for (let i = 0; i < rentButtons.length; i++) {
        rentButtons[i].addEventListener("click", function () {
            const itemName = this.dataset.name;
            const rentDate = new Date().toLocaleDateString(); // Поточна дата
            const duration = 0; // Значення за замовчуванняс

            // Отримуємо ціну з атрибута data-price
            const price = parseInt(this.dataset.price); // Перетворюємо на число

            const newOrder = {
                name: itemName,
                date: rentDate,
                duration: duration,
                price: price,
                status: "очікує оплати"
            };

            let rentedItems = JSON.parse(localStorage.getItem("rentedItems")) || [];
            rentedItems.push(newOrder);
            localStorage.setItem("rentedItems", JSON.stringify(rentedItems));

            alert(`${itemName} додано до ваших оренд!`);
        });
    };
});

document.addEventListener("DOMContentLoaded", function () {
    let rentedItems = JSON.parse(localStorage.getItem("rentedItems")) || [];
    const ordersContainer = document.getElementById("orders-list"); // Контейнер для списку оренд

    let i = 0;

    do {
        if (rentedItems.length === 0) {
            ordersContainer.innerHTML = "<p>У вас поки що немає оренд.</p>";
            break; // Вихід із циклу, якщо масив порожній
        }

        const order = rentedItems[i];

        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order");

        orderDiv.innerHTML = `
            <h3>${order.name}</h3>
            <p>Дата оренди: ${order.date}</p>
            <p>Тривалість: ${order.duration} дні</p>
            <p>Сума: ${order.price} грн</p>
            <div class="con-stan">
                <p>Стан оренди: </p>
                <p class="stan">${order.status}</p>
            </div>
            ${order.status === "очікує оплати" ? `<a href="payment.html"><button>Оплатити</button></a>` : ""}
        `;

        ordersContainer.appendChild(orderDiv);

        i++;
    } while (i < rentedItems.length);
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

        const selectedItem = rentedItems.find(item => item.name === selectedItemName);
        if (selectedItem) {
            const totalAmount = selectedItem.price * rentalDuration;
            paymentAmountInput.value = `${totalAmount} грн`;
        }
    }

    // Обробка форми оплати
    paymentForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Очищаємо попередні помилки
        clearErrors();
        
        // Валідація форми
        let isValid = true;

        // Перевірка вибору обладнання
        if (equipmentSelect.selectedIndex === -1) {
            showError(equipmentSelect, "Будь ласка, оберіть обладнання");
            isValid = false;
        }

        // Перевірка тривалості оренди
        if (!rentalDurationInput.value || parseInt(rentalDurationInput.value) <= 0) {
            showError(rentalDurationInput, "Введіть коректну кількість днів");
            isValid = false;
        }

        // Перевірка даних картки
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

        // Якщо форма не валідна - припиняємо виконання
        if (!isValid) {
            return;
        }

        // Якщо все валідне - обробляємо оплату
        const selectedItemName = equipmentSelect.value;
        const rentalDuration = parseInt(rentalDurationInput.value);

        // Оновлення статусу оренди
        const updatedItems = rentedItems.map(item => {
            if (item.name === selectedItemName) {
                return {
                    ...item,
                    status: "оплачено",
                    duration: rentalDuration,
                    paymentDate: new Date().toLocaleDateString()
                };
            }
            return item;
        });

        localStorage.setItem("rentedItems", JSON.stringify(updatedItems));
        alert("Оплата успішно проведена!");
        paymentForm.reset();
        paymentAmountInput.value = "0 грн";
        
        // Перенаправлення на сторінку оренд
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