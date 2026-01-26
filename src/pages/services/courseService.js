// Сервис для работы с курсами
// В будущем здесь будут реальные API запросы к бэкенду
// Сейчас используется mock данные

import { coursesData } from '../data/coursesData';

/**
 * Получить все курсы
 * @returns {Promise<Array>} Массив всех курсов
 * 
 * В будущем заменить на:
 * return fetch('/api/courses').then(res => res.json());
 */
export const getAllCourses = async () => {
  // Имитация задержки API запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(coursesData);
    }, 100);
  });
};

/**
 * Получить курс по ID
 * @param {number} courseId - ID курса
 * @returns {Promise<Object|null>} Объект курса или null если не найден
 * 
 * В будущем заменить на:
 * return fetch(`/api/courses/${courseId}`).then(res => res.json());
 */
export const getCourseById = async (courseId) => {
  // Имитация задержки API запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = coursesData.find(c => c.id === parseInt(courseId));
      resolve(course || null);
    }, 100);
  });
};

/**
 * Получить курсы по категории
 * @param {string} category - Категория курса
 * @returns {Promise<Array>} Массив курсов в категории
 * 
 * В будущем заменить на:
 * return fetch(`/api/courses?category=${category}`).then(res => res.json());
 */
export const getCoursesByCategory = async (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = coursesData.filter(c => c.category === category);
      resolve(courses);
    }, 100);
  });
};

/**
 * Получить популярные курсы (по рейтингу)
 * @param {number} limit - Количество курсов
 * @returns {Promise<Array>} Массив популярных курсов
 * 
 * В будущем заменить на:
 * return fetch(`/api/courses/popular?limit=${limit}`).then(res => res.json());
 */
export const getPopularCourses = async (limit = 6) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = [...coursesData]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
      resolve(courses);
    }, 100);
  });
};

/**
 * Поиск курсов
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Массив найденных курсов
 * 
 * В будущем заменить на:
 * return fetch(`/api/courses/search?q=${query}`).then(res => res.json());
 */
export const searchCourses = async (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const courses = coursesData.filter(c => 
        c.title.toLowerCase().includes(lowerQuery) ||
        c.author.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery)
      );
      resolve(courses);
    }, 100);
  });
};

/**
 * Получить курсы пользователя (купленные)
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} Массив курсов пользователя
 * 
 * В будущем заменить на:
 * return fetch(`/api/users/${userId}/courses`).then(res => res.json());
 */
export const getUserCourses = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // В реальном приложении это будет запрос к API
      resolve([]);
    }, 100);
  });
};

/**
 * Купить курс
 * @param {number} courseId - ID курса
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} Результат покупки
 * 
 * В будущем заменить на:
 * return fetch('/api/purchases', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ courseId, userId })
 * }).then(res => res.json());
 */
export const purchaseCourse = async (courseId, userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // В реальном приложении это будет запрос к API
      const course = coursesData.find(c => c.id === courseId);
      if (course) {
        resolve({ success: true, course });
      } else {
        reject(new Error('Курс не найден'));
      }
    }, 500);
  });
};
