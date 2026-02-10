// Клиент Supabase для подключения к базе данных
// Установите: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL и ключ не настроены. Проверьте .env файл.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Вспомогательные функции для работы с данными

/**
 * Получить текущего пользователя
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Получить профиль пользователя
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Получить все опубликованные курсы
 */
export const getCourses = async (filters = {}) => {
  let query = supabase
    .from('courses')
    .select('*, categories(*), profiles!courses_author_id_fkey(*)')
    .eq('is_published', true);
  
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  
  if (filters.level) {
    query = query.eq('level', filters.level);
  }
  
  if (filters.search) {
    query = query.or(`title_ru.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Получить курс по ID
 */
export const getCourseById = async (courseId) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(*),
      profiles!courses_author_id_fkey(*),
      course_learning_points(*),
      course_requirements(*),
      lessons(*)
    `)
    .eq('id', courseId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Получить корзину пользователя
 */
export const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      courses(*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

/**
 * Добавить курс в корзину
 */
export const addToCart = async (userId, courseId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      course_id: courseId,
      quantity: 1,
    }, {
      onConflict: 'user_id,course_id',
    });
  
  if (error) throw error;
  return data;
};

/**
 * Удалить курс из корзины
 */
export const removeFromCart = async (userId, courseId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  
  if (error) throw error;
  return data;
};

/**
 * Очистить корзину
 */
export const clearCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

/**
 * Создать заказ
 */
/**
 * Создать заказ
 * Номер заказа генерируется автоматически триггером в БД
 */
export const createOrder = async (orderData) => {
  // Создаем заказ (order_number будет сгенерирован автоматически триггером)
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.userId,
      // order_number не указываем - генерируется автоматически триггером
      total_amount: orderData.total,
      customer_name: orderData.customer.name,
      customer_phone: orderData.customer.phone,
      customer_email: orderData.customer.email || null,
      delivery_address: orderData.customer.address,
      comment: orderData.customer.comment || null,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Добавляем элементы заказа
  if (orderData.items && orderData.items.length > 0) {
    const orderItems = orderData.items.map(item => ({
      order_id: data.id,
      course_id: item.courseId || item.id,
      course_title: item.title,
      course_price: item.price || item.currentPrice,
      quantity: item.quantity || 1,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
  }
  
  // Очищаем корзину после создания заказа (опционально)
  if (orderData.clearCart !== false) {
    await clearCart(orderData.userId);
  }
  
  return data;
};

/**
 * Получить заказы пользователя
 */
export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

/**
 * Получить прогресс пользователя
 */
export const getUserProgress = async (userId, courseId = null) => {
  let query = supabase
    .from('user_progress')
    .select('*, lessons(*), courses(*)')
    .eq('user_id', userId);
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Отметить урок как завершенный
 */
export const markLessonCompleted = async (userId, courseId, lessonId) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,course_id,lesson_id',
    });
  
  if (error) throw error;
  return data;
};

/**
 * Получить купленные курсы пользователя
 */
export const getPurchasedCourses = async (userId) => {
  const { data, error } = await supabase
    .from('purchased_courses')
    .select(`
      *,
      courses(*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};
