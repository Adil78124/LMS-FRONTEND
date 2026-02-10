import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isStudentRole, isTeacherRole } from '../../utils/roles';
import Loader from '../UI/Loader/Loader';

/**
 * Разрешает рендер только для студента/школьника (или гостя).
 * Преподаватель перенаправляется на /teaching.
 */
export function StudentOrGuestOnly({ children }) {
  const { user, loading } = useAuth();
  const role = user?.role;
  if (loading) return <Loader />;
  if (isTeacherRole(role)) return <Navigate to="/teaching" replace />;
  return children;
}

/**
 * Разрешает рендер только для преподавателя (или админа).
 * Студент/школьник перенаправляется на /catalog, гость — на /login.
 */
export function TeacherOnly({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const role = user?.role;
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (isStudentRole(role)) return <Navigate to="/catalog" replace />;
  return children;
}
