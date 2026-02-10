import { API_BASE_URL } from '../config/api';

const base = `${API_BASE_URL}/content`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || data.error || 'Ошибка запроса';
    throw new Error(msg);
  }
  return data;
}

export const contentService = {
  // Модули урока
  getModules(lessonId) {
    return request(`${base}/lesson/${lessonId}/modules`);
  },
  createModule(lessonId, body) {
    return request(`${base}/lesson/${lessonId}/modules`, { method: 'POST', body: JSON.stringify(body) });
  },
  getModule(id) {
    return request(`${base}/modules/${id}`);
  },
  updateModule(id, body) {
    return request(`${base}/modules/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  deleteModule(id) {
    return request(`${base}/modules/${id}`, { method: 'DELETE' });
  },

  // Подмодули
  getUnderModules(moduleId) {
    return request(`${base}/module/${moduleId}/under-modules`);
  },
  createUnderModule(moduleId, body) {
    return request(`${base}/module/${moduleId}/under-modules`, { method: 'POST', body: JSON.stringify(body) });
  },
  getUnderModule(id) {
    return request(`${base}/under-modules/${id}`);
  },
  updateUnderModule(id, body) {
    return request(`${base}/under-modules/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  deleteUnderModule(id) {
    return request(`${base}/under-modules/${id}`, { method: 'DELETE' });
  },

  // Контент подмодуля
  getContent(underModuleId) {
    return request(`${base}/under-module/${underModuleId}/content`);
  },
  createContent(underModuleId, body) {
    return request(`${base}/under-module/${underModuleId}/content`, { method: 'POST', body: JSON.stringify(body) });
  },
  getContentItem(id) {
    return request(`${base}/modules-content/${id}`);
  },
  updateContent(id, body) {
    return request(`${base}/modules-content/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  deleteContent(id) {
    return request(`${base}/modules-content/${id}`, { method: 'DELETE' });
  },

  // Прохождение и доступ
  markComplete(underModuleId) {
    return request(`${base}/under-modules/${underModuleId}/complete`, { method: 'POST' });
  },
  getAccess(underModuleId) {
    return request(`${base}/under-modules/${underModuleId}/access`);
  },

  // Баллы и зачёт (≥70%)
  getLessonScore(lessonId) {
    return request(`${base}/lesson/${lessonId}/score`);
  },
  getLessonScoresDetail(lessonId) {
    return request(`${base}/lesson/${lessonId}/scores-detail`);
  },
  getCourseScore(courseId) {
    return request(`${base}/course/${courseId}/score`);
  },
  setCompletionScore(underModuleId, body) {
    return request(`${base}/under-modules/${underModuleId}/score`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // Загрузка видео через проводник
  async uploadVideo(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${base}/upload/video`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || data.error || 'Ошибка загрузки';
      throw new Error(msg);
    }
    return data; // { path, filename }
  },
};
