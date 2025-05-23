# Налаштування сервісного акаунту Firebase

Для правильної роботи серверної частини додатку необхідно налаштувати сервісний акаунт Firebase.

## Крок 1: Отримання ключа сервісного акаунту

1. Відкрийте [Firebase Console](https://console.firebase.google.com/) і виберіть ваш проект
2. Натисніть на шестерню (⚙️) у верхньому меню і виберіть **Project settings** (Налаштування проекту)
3. Перейдіть на вкладку **Service accounts** (Сервісні акаунти)
4. Знайдіть розділ **Firebase Admin SDK** і натисніть кнопку **Generate new private key** (Згенерувати новий приватний ключ)
5. У діалоговому вікні, що відкриється, натисніть **Generate key** (Згенерувати ключ)
6. Буде завантажено JSON-файл із конфіденційними даними вашого сервісного акаунту

## Крок 2: Налаштування змінних середовища

1. Створіть файл `.env` у кореневій директорії проекту
2. Додайте наступні змінні, замінивши значення на відповідні з вашого JSON-файлу:

```
FIREBASE_PROJECT_ID=sportrent-ba741
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sportrent-ba741.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
PORT=3000
```

Для `FIREBASE_PRIVATE_KEY` потрібно скопіювати значення поля `private_key` з JSON-файлу разом з лапками. Це важливо, оскільки приватний ключ містить символи переносу рядка (`\n`), які повинні зберегтися.

## Важливі зауваження щодо безпеки

1. **НІКОЛИ не додавайте файл `.env` до системи контролю версій**. Переконайтесь, що цей файл додано до `.gitignore`.
2. **Не публікуйте JSON-файл з ключами сервісного акаунту у відкритому репозиторії**.
3. Для продакшн-середовища краще використовувати **змінні середовища** хостингу, а не файл `.env`.

## Перевірка налаштувань

Після правильного налаштування сервісного акаунту, запустіть сервер:

```
npm run server
```

Якщо все налаштовано правильно, ви побачите повідомлення:
```
🔥 Initializing Firebase with service account credentials
Server running on port 3000
``` 