# Альтернативний спосіб налаштування Firebase

Якщо у вас виникають проблеми з налаштуванням Firebase через змінні середовища, ви можете використати альтернативний підхід - безпосередньо використати JSON файл сервісного акаунту.

## Крок 1: Отримайте JSON файл сервісного акаунту

1. Відкрийте [Firebase Console](https://console.firebase.google.com/) і виберіть ваш проект
2. Натисніть на шестерню (⚙️) у верхньому меню і виберіть **Project settings** (Налаштування проекту)
3. Перейдіть на вкладку **Service accounts** (Сервісні акаунти)
4. Знайдіть розділ **Firebase Admin SDK** і натисніть кнопку **Generate new private key** (Згенерувати новий приватний ключ)
5. У діалоговому вікні, що відкриється, натисніть **Generate key** (Згенерувати ключ)
6. Збережіть завантажений JSON-файл у папці вашого проекту з назвою `firebase-service-account.json`

## Крок 2: Змініть server.js для використання JSON файлу

Відкрийте `server.js` і змініть код ініціалізації Firebase наступним чином:

```javascript
import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Завантаження змінних середовища з .env файлу
dotenv.config();

// Шлях до файлу сервісного акаунту
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
  // Перевіряємо чи існує файл
  const fs = await import('fs');
  if (fs.existsSync(serviceAccountPath)) {
    console.log('🔥 Initializing Firebase with service account JSON file');
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn('⚠️ Service account file not found. Using Application Default Credentials');
    admin.initializeApp();
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.warn('⚠️ Using Firebase Application Default Credentials instead');
  admin.initializeApp();
}

const db = admin.firestore();

// Rest of your code...
```

## Крок 3: Додайте JSON файл до .gitignore

Не забудьте додати файл `firebase-service-account.json` до вашого `.gitignore`, щоб уникнути комітування конфіденційних даних у репозиторій:

```
# Додайте цей рядок до .gitignore
firebase-service-account.json
```

## Крок 4: Запустіть сервер

Тепер ви можете запустити сервер:

```
npm run server:dev
``` 