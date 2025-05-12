import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантаження змінних середовища з .env файлу
dotenv.config();

// Спробуємо різні підходи до ініціалізації Firebase
let firebaseInitialized = false;

try {
  // 1. Спочатку спробуємо прямо з JSON-файлу
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    console.log('🔥 Initializing Firebase with service account JSON file');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
  }
} catch (error) {
  console.error('Error initializing Firebase from file:', error);
}

// 2. Якщо перший метод не спрацював, спробуємо з ENV змінних
if (!firebaseInitialized && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    console.log('🔥 Initializing Firebase with environment variables');
    
    // Виправлення проблеми з форматуванням приватного ключа
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Якщо ключ з рядковими "\n", перетворюємо їх на фактичні переноси рядків
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Якщо ключ у лапках, видаляємо їх
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Переконуємося, що він має правильний формат
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.log('Попередження: Приватний ключ має неправильний формат');
      console.log('Перші 20 символів ключа:', privateKey.substring(0, 20));
    }
    
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key": privateKey,
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "universe_domain": "googleapis.com"
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    firebaseInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase from ENV:', error);
  }
}

// 3. Якщо нічого не спрацювало, спробуємо спрощений метод без сервісного акаунту
if (!firebaseInitialized) {
  try {
    console.log('🔥 Trying to initialize Firebase with application default credentials');
    
    // Спрощена ініціалізація без сервісного акаунту
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'sportrent-ba741'
    });
    
    firebaseInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase with default credentials:', error);
  }
}

// Якщо нічого не спрацювало, виводимо помилку
if (!firebaseInitialized) {
  console.error('❌ Firebase initialization failed with all methods. Check credentials and try again.');
  console.log('Continuing without Firebase, some features will not work!');
}

// Ініціалізуємо Firestore, якщо Firebase запустився успішно
const db = firebaseInitialized ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 3000;

// Розширені CORS налаштування
const corsOptions = {
  origin: '*', // Тимчасово дозволяю всі домени для відлагодження
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Source'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Логування запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} від ${req.headers.origin || 'невідомо'}`);
  next();
});

// Тестовий GET-маршрут для перевірки роботи сервера
app.get('/test', (req, res) => {
    res.json({ 
      status: 'OK',
      message: 'Сервер працює!',
      timestamp: new Date().toISOString() 
    });
  });
  
// Тестовий POST-маршрут
app.post('/test', (req, res) => {
const { data } = req.body;
res.json({ 
    status: 'OK',
    receivedData: data || 'Немає даних у тілі запиту',
    method: 'POST'
});
});

// Статичний HTML-відповідь (опціонально)
app.get('/test-page', (req, res) => {
res.send(`
    <html>
    <body>
        <h1>Тестова сторінка</h1>
        <p>Сервер успішно обробляє GET-запити!</p>
    </body>
    </html>
`);
});

const authenticate = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; // Зберігаємо дані користувача в запиті
      next();
    } catch (error) {
      res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
  };

// Маршрут для отримання орендованого обладнання з фільтрацією за ціною
app.get('/api/rentals', async (req, res) => {
  try {
    console.log('GET /api/rentals, параметри:', req.query);
    
    // Перевіряємо чи Firebase ініціалізований
    if (!firebaseInitialized || !db) {
      console.error('Firebase не ініціалізовано. Не можемо отримати дані.');
      return res.status(503).json({ 
        error: 'Database unavailable', 
        message: 'Сервіс бази даних тимчасово недоступний. Спробуйте пізніше.' 
      });
    }
    
    const userId = req.query.userId;
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Infinity;

    if (!userId) {
      console.log('GET /api/rentals - Помилка: Не вказано userId');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`GET /api/rentals - Пошук оренд для userId: ${userId}, ціновий діапазон: ${minPrice}-${maxPrice}`);

    // Отримуємо дані з Firebase
    try {
      const rentalsRef = db.collection('rentals');
      const query = rentalsRef.where('userId', '==', userId);
      console.log('Виконуємо запит до Firebase...');
      const snapshot = await query.get();
      console.log(`Firebase повернув ${snapshot.size} документів`);

      // Фільтруємо результати за ціною
      const rentals = [];
      snapshot.forEach(doc => {
        const rental = { id: doc.id, ...doc.data() };
        if (rental.price >= minPrice && rental.price <= maxPrice) {
          rentals.push(rental);
        }
      });

      console.log(`Після фільтрації за ціною залишилось ${rentals.length} оренд`);
      res.json(rentals);
    } catch (firestoreError) {
      console.error('Помилка доступу до Firestore:', firestoreError);
      return res.status(500).json({ error: 'Database access error', details: firestoreError.message });
    }
  } catch (error) {
    console.error('Загальна помилка при отриманні оренд:', error);
    res.status(500).json({ error: 'Failed to fetch rentals', details: error.message });
  }
});

// Маршрут для збереження інформації про оренду обладнання
app.post('/api/rentals', async (req, res) => {
  try {
    // Перевіряємо чи Firebase ініціалізований
    if (!firebaseInitialized || !db) {
      console.error('Firebase не ініціалізовано. Не можемо зберегти дані.');
      return res.status(503).json({ 
        error: 'Database unavailable', 
        message: 'Сервіс бази даних тимчасово недоступний. Спробуйте пізніше.' 
      });
    }
    
    const { userId, equipmentId, name, price, date, status, image, sportType } = req.body;

    // Додаткове логування
    console.log("Отримані дані:", {
      userId, 
      equipmentId, 
      name, 
      price, 
      "equipmentId type": typeof equipmentId,
      "equipmentId value": equipmentId
    });

    if (!userId || !equipmentId || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Перевірка, чи equipmentId є дійсним
    if (typeof equipmentId !== 'string' || !equipmentId.trim()) {
      return res.status(400).json({ error: 'Invalid equipment ID' });
    }

    // Зберігаємо дані в Firebase - виправлений метод створення документа
    const rentalData = {
      userId,
      equipmentId,
      name,
      price,
      date: date || new Date().toISOString(),
      status: status || 'очікує оплати',
      image,
      sportType
    };
    
    // Використовуємо add() замість doc().set() для автоматичного генерування ID
    const rentalRef = await db.collection('rentals').add(rentalData);

    // Починаємо транзакцію без doc() на цьому етапі
    await db.runTransaction(async (transaction) => {
      // Переконаймося, що equipmentId - це рядок без пробілів
      const safeEquipmentId = String(equipmentId).trim();
      console.log("Використовую ID обладнання:", safeEquipmentId);
      
      // Перевіряємо, чи існує такий документ у колекції інвентаря
      const inventoryCollection = db.collection('inventory');
      const docRef = inventoryCollection.doc(safeEquipmentId);
      const inventoryDoc = await transaction.get(docRef);
      
      if (!inventoryDoc.exists) {
        throw new Error(`Equipment not found with ID: ${safeEquipmentId}`);
      }
      
      const currentQuantity = inventoryDoc.data().quantity;
      if (currentQuantity < 1) {
        throw new Error('Equipment out of stock');
      }
      
      transaction.update(docRef, { quantity: currentQuantity - 1 });
    });

    res.status(201).json({ 
      id: rentalRef.id, 
      message: 'Rental created successfully' 
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ error: `Failed to create rental: ${error.message}` });
  }
});

// Додаємо спеціальний маршрут для перевірки CORS
app.get('/api/cors-test', (req, res) => {
  // Виводимо всі заголовки запиту для відлагодження
  console.log('CORS Test Headers:', req.headers);
  
  res.json({
    success: true,
    message: 'CORS налаштовано правильно',
    client: req.headers.origin || 'невідомий',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Додаємо спеціальний маршрут для перевірки зєднання з Firebase
app.get('/api/firebase-test', async (req, res) => {
  try {
    // Перевіряємо чи Firebase ініціалізований
    if (!firebaseInitialized || !db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase не ініціалізовано',
        initialized: firebaseInitialized,
        dbAvailable: !!db,
        timestamp: new Date().toISOString()
      });
    }
    
    // Спроба отримати тестовий документ з Firebase
    // Використовуємо .limit(1) для зменшення навантаження
    const testQuery = db.collection('inventory').limit(1);
    console.log('Тестуємо зєднання з Firestore...');
    
    const snapshot = await testQuery.get();
    const testDoc = snapshot.empty ? null : snapshot.docs[0].data();
    
    res.json({
      success: true,
      message: 'Зєднання з Firebase успішне',
      data: testDoc ? 'Знайдено тестовий документ' : 'Тестовий документ не знайдено',
      docCount: snapshot.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Помилка зєднання з Firebase:', error);
    
    // Відправляємо детальну інформацію про помилку
    res.status(500).json({
      success: false,
      message: 'Помилка зєднання з Firebase',
      error: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    });
  }
});

// Для всіх інших запитів - відправляємо React додаток
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});