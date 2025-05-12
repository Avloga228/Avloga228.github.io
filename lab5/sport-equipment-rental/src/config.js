// Конфігурація API URL в залежності від середовища
const isDevelopment = import.meta.env.DEV;
console.log('Середовище розробки:', isDevelopment ? 'Development' : 'Production');

// URL для локальної розробки
const DEV_API_URL = 'http://localhost:3000/api';

// URL для бекенду на Render
const RENDER_BACKEND_URL = 'https://avloga228-github-io.onrender.com';

// URL для продакшн-середовища
// Оскільки на Render бекенд і фронтенд разом, використовуємо локальні шляхи
// А для Vercel (при деплої фронтенду окремо) використовуємо повний URL до бекенду на Render
const PROD_API_URL = RENDER_BACKEND_URL + '/api';

// Експортуємо URL в залежності від середовища
export const API_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;
console.log('Використовується API URL:', API_URL);

// Допоміжна функція для створення повного URL шляху
export const apiPath = (path) => {
  // Видаляємо початковий слеш, якщо він є, щоб уникнути дублювання
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  const fullUrl = `${API_URL}/${trimmedPath}`;
  console.log('Сформований URL для запиту:', fullUrl);
  return fullUrl;
}; 