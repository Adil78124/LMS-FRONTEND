/**
 * Роли: schoolkid, student — учебный интерфейс; teacher, admin — преподавательский.
 */

export const isStudentRole = (role) =>
  role === 'student' || role === 'schoolkid';

export const isTeacherRole = (role) =>
  role === 'teacher' || role === 'admin';
