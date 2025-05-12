// Конфігурація API URL в залежності від середовища
const isDevelopment = import.meta.env.DEV;

// URL для локальної розробки
const DEV_API_URL = 'http://localhost:3000/api';

// URL для продакшн-середовища - змініть на URL вашого бекенду
const PROD_API_URL = 'https://avloga228-github-io.onrender.com';

// Експортуємо URL в залежності від середовища
export const API_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;

// Допоміжна функція для створення повного URL шляху
export const apiPath = (path) => {
  // Видаляємо початковий слеш, якщо він є, щоб уникнути дублювання
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${trimmedPath}`;
}; 