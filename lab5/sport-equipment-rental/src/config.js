// Конфігурація API URL в залежності від середовища
const isDevelopment = import.meta.env.DEV;

// URL для локальної розробки
const DEV_API_URL = 'http://localhost:3000/api';

// URL для продакшн-середовища
// Якщо ваш бекенд не використовує префікс /api, використовуйте наступний рядок:
// const PROD_API_URL = 'https://avloga228-github-io.onrender.com';
// Якщо ваш бекенд використовує префікс /api, використовуйте наступний рядок:
const PROD_API_URL = 'https://avloga228-github-io.onrender.com/api';

// Експортуємо URL в залежності від середовища
export const API_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;

// Допоміжна функція для створення повного URL шляху
export const apiPath = (path) => {
  // Видаляємо початковий слеш, якщо він є, щоб уникнути дублювання
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Перевірка, чи потрібно додавати префікс /api для продакшн URL
  // Розкоментуйте наступні рядки, якщо бекенд не використовує префікс /api
  /*
  if (!isDevelopment && !PROD_API_URL.includes('/api')) {
    return `${PROD_API_URL}/api/${trimmedPath}`;
  }
  */
  
  return `${API_URL}/${trimmedPath}`;
}; 