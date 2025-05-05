# Налаштування Firebase Admin SDK для вашого проекту

Для коректної роботи серверної частини додатку необхідно налаштувати Firebase Admin SDK. Є два способи налаштування:

## Спосіб 1: Налаштування через JSON файл (рекомендований)

### Крок 1: Згенеруйте ключ сервісного акаунту Firebase

1. Відкрийте [Firebase Console](https://console.firebase.google.com/) і виберіть ваш проект
2. Натисніть на шестерню (⚙️) у верхньому меню і виберіть **Project settings** (Налаштування проекту)
3. Перейдіть на вкладку **Service accounts** (Сервісні акаунти)
4. Знайдіть розділ **Firebase Admin SDK** і натисніть кнопку **Generate new private key** (Згенерувати новий приватний ключ)
5. У діалоговому вікні, що відкриється, натисніть **Generate key** (Згенерувати ключ)
6. Збережіть завантажений JSON-файл у кореневій папці проекту з назвою `firebase-service-account.json`

### Крок 2: Перевірте налаштування

Запустіть сервер з наступною командою:

```
npm run server:dev
```

Якщо все налаштовано правильно, ви побачите повідомлення:
```
🔥 Initializing Firebase with service account JSON file
Server running on port 3000
```

## Спосіб 2: Налаштування через змінні середовища (.env файл)

Якщо з якихось причин ви не хочете використовувати JSON файл, ви можете налаштувати Firebase через змінні середовища:

### Крок 1: Створіть файл .env

1. Створіть файл `.env` у кореневій папці проекту
2. Додайте наступні змінні (замініть значення на ваші):

```
FIREBASE_PROJECT_ID=ваш_project_id_з_json_файлу
FIREBASE_CLIENT_EMAIL=ваш_client_email_з_json_файлу
FIREBASE_PRIVATE_KEY="ваш_private_key_з_json_файлу"
PORT=3000
```

**ВАЖЛИВО:**
- Для FIREBASE_PRIVATE_KEY скопіюйте значення ПОВНІСТЮ в подвійних лапках, оскільки воно містить символи переносу рядка (`\n`)
- Не прибирайте подвійні лапки з початку та кінця значення

### Крок 2: Перевірте налаштування

Запустіть сервер:

```
npm run server:dev
```

Якщо все налаштовано правильно, ви побачите повідомлення:
```
🔥 Initializing Firebase with environment variables
Server running on port 3000
```

## Вирішення проблем

### Проблема: Помилка `Cannot read properties of undefined (reading 'cert')` або `Cannot read properties of undefined (reading 'INTERNAL')`

Ці помилки часто пов'язані з несумісністю версій Node.js та Firebase Admin SDK або з неправильним імпортом модулів.

#### Крок 1: Перевірте версію Node.js

Відкрийте термінал і виконайте:
```
node -v
```

Для надійної роботи з Firebase Admin SDK рекомендовано використовувати Node.js версії 16, 18 або 20 (LTS версії).

Якщо ви використовуєте Node.js v22+ (як у вашому випадку), можуть виникати проблеми сумісності.

#### Крок 2: Оновіть Firebase Admin SDK до актуальної версії

```
npm install firebase-admin@latest
```

#### Крок 3: Переконайтеся, що firebase-service-account.json правильно сформований

JSON файл повинен бути валідним і містити всі необхідні поля. Переконайтеся, що файл не містить додаткових пробілів у кінці.

#### Крок 4: Спробуйте встановити конкретну версію Firebase Admin SDK, яка сумісна з вашою версією Node.js

```
npm install firebase-admin@11.11.0
```

### Проблема: Node.js ESM компатибільність

Якщо ви використовуєте ES модулі (у вас є `"type": "module"` у package.json), переконайтеся, що імпорти та експорти правильно сформовані:

```javascript
// Правильний імпорт для ESM
import admin from 'firebase-admin';

// Неправильний підхід, який може викликати помилки
// import { initializeApp } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
```

## Безпека

1. **НІКОЛИ не додавайте файли з конфіденційними даними до системи контролю версій**:
   - `.env`
   - `firebase-service-account.json`

2. Переконайтеся, що ці файли додані до `.gitignore` 