// Конфігурація API URL в залежності від середовища
const isDevelopment = import.meta.env.DEV;
console.log('Середовище розробки:', isDevelopment ? 'Development' : 'Production');

// URL для локальної розробки
const DEV_API_URL = 'http://localhost:3000/api';

// URL для бекенду на Render - без слеша на кінці
const RENDER_BACKEND_URL = 'https://avloga228-github-io.onrender.com';

// URL для продакшн-середовища
const PROD_API_URL = `${RENDER_BACKEND_URL}/api`;

// Визначаємо, на якому хості ми знаходимось
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
console.log('Запущено на Vercel:', isVercel);

// Якщо ми на Vercel, завжди використовуємо повний URL до Render
// Якщо ми на Render або локально, використовуємо відносний шлях
export const API_URL = isVercel 
  ? PROD_API_URL 
  : (isDevelopment ? DEV_API_URL : '/api');

console.log('Використовується базовий API URL:', API_URL);

// Допоміжна функція для створення повного URL шляху
export const apiPath = (path) => {
  // Видаляємо початковий та кінцевий слеш, якщо вони є
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  
  // Формуємо URL без подвійних слешів
  const fullUrl = `${API_URL}/${trimmedPath}`;
  console.log('Сформований URL для запиту:', fullUrl);
  return fullUrl;
}; 