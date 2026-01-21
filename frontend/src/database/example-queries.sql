-- ============================================
-- ПРИМЕРЫ ЗАПРОСОВ ДЛЯ SUPABASE
-- ============================================

-- ============================================
-- 1. ПОЛУЧЕНИЕ ДАННЫХ
-- ============================================

-- Получить все опубликованные курсы с категориями
SELECT 
  c.*,
  cat.name_ru as category_name,
  p.full_name as author_name
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.author_id = p.id
WHERE c.is_published = true
ORDER BY c.created_at DESC;

-- Получить курс с уроками и автором
SELECT 
  c.*,
  json_agg(
    json_build_object(
      'id', l.id,
      'title_ru', l.title_ru,
      'order', l.lesson_order,
      'duration', l.duration_minutes,
      'is_free', l.is_free
    ) ORDER BY l.lesson_order
  ) as lessons,
  p.full_name as author_name
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
LEFT JOIN profiles p ON c.author_id = p.id
WHERE c.id = 1
GROUP BY c.id, p.full_name;

-- Получить корзину пользователя с курсами
SELECT 
  ci.*,
  c.title_ru,
  c.current_price,
  c.image_url
FROM cart_items ci
JOIN courses c ON ci.course_id = c.id
WHERE ci.user_id = 'user-uuid-here';

-- Получить заказы пользователя
SELECT 
  o.*,
  json_agg(
    json_build_object(
      'course_id', oi.course_id,
      'title', oi.course_title,
      'price', oi.course_price,
      'quantity', oi.quantity
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'user-uuid-here'
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Получить прогресс пользователя по курсу
SELECT 
  up.*,
  l.title_ru as lesson_title,
  l.lesson_order
FROM user_progress up
JOIN lessons l ON up.lesson_id = l.id
WHERE up.user_id = 'user-uuid-here'
  AND up.course_id = 1
ORDER BY l.lesson_order;

-- Получить купленные курсы пользователя
SELECT 
  pc.*,
  c.title_ru,
  c.image_url,
  c.current_price
FROM purchased_courses pc
JOIN courses c ON pc.course_id = c.id
WHERE pc.user_id = 'user-uuid-here';

-- ============================================
-- 2. СТАТИСТИКА
-- ============================================

-- Статистика преподавателя
SELECT 
  COUNT(DISTINCT c.id) as total_courses,
  SUM(c.students_count) as total_students,
  SUM(c.current_price * c.students_count * 0.7) as total_earnings
FROM courses c
WHERE c.author_id = 'teacher-uuid-here';

-- Популярные курсы (по количеству студентов)
SELECT 
  c.*,
  cat.name_ru as category_name
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
WHERE c.is_published = true
ORDER BY c.students_count DESC
LIMIT 10;

-- Курсы по категориям
SELECT 
  cat.name_ru,
  COUNT(c.id) as courses_count
FROM categories cat
LEFT JOIN courses c ON cat.id = c.category_id AND c.is_published = true
GROUP BY cat.id, cat.name_ru
ORDER BY courses_count DESC;

-- ============================================
-- 3. ОБНОВЛЕНИЕ ДАННЫХ
-- ============================================

-- Обновить рейтинг курса
UPDATE courses
SET 
  rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM reviews
    WHERE course_id = courses.id
  ),
  reviews_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE course_id = courses.id
  )
WHERE id = 1;

-- Обновить количество студентов курса
UPDATE courses
SET students_count = (
  SELECT COUNT(DISTINCT user_id)
  FROM purchased_courses
  WHERE course_id = courses.id
)
WHERE id = 1;

-- ============================================
-- 4. ПОЛЕЗНЫЕ VIEW (Представления)
-- ============================================

-- View для курсов с полной информацией
CREATE OR REPLACE VIEW courses_full AS
SELECT 
  c.*,
  cat.name_ru as category_name_ru,
  cat.name_en as category_name_en,
  cat.name_kz as category_name_kz,
  cat.slug as category_slug,
  p.full_name as author_name,
  COUNT(DISTINCT l.id) as lessons_count,
  COUNT(DISTINCT pc.user_id) as actual_students_count
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.author_id = p.id
LEFT JOIN lessons l ON c.id = l.course_id
LEFT JOIN purchased_courses pc ON c.id = pc.course_id
WHERE c.is_published = true
GROUP BY c.id, cat.id, p.id;

-- View для статистики пользователя
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT pc.course_id) as purchased_courses,
  COUNT(DISTINCT up.lesson_id) as completed_lessons,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as total_spent
FROM profiles u
LEFT JOIN purchased_courses pc ON u.id = pc.user_id
LEFT JOIN user_progress up ON u.id = up.user_id AND up.is_completed = true
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;

-- ============================================
-- 5. ФУНКЦИИ ДЛЯ БИЗНЕС-ЛОГИКИ
-- ============================================

-- Функция для расчета прогресса курса
CREATE OR REPLACE FUNCTION calculate_course_progress(
  p_user_id UUID,
  p_course_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Получаем общее количество уроков
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = p_course_id;
  
  -- Получаем количество завершенных уроков
  SELECT COUNT(*) INTO completed_lessons
  FROM user_progress
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND is_completed = true;
  
  -- Возвращаем процент прогресса
  IF total_lessons > 0 THEN
    RETURN (completed_lessons * 100 / total_lessons);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Использование:
-- SELECT calculate_course_progress('user-uuid', 1);

-- Функция для проверки доступа к уроку
CREATE OR REPLACE FUNCTION can_access_lesson(
  p_user_id UUID,
  p_lesson_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  lesson_is_free BOOLEAN;
  course_is_purchased BOOLEAN;
BEGIN
  -- Проверяем, бесплатный ли урок
  SELECT is_free INTO lesson_is_free
  FROM lessons
  WHERE id = p_lesson_id;
  
  IF lesson_is_free THEN
    RETURN true;
  END IF;
  
  -- Проверяем, куплен ли курс
  SELECT EXISTS(
    SELECT 1 FROM purchased_courses pc
    JOIN lessons l ON pc.course_id = l.course_id
    WHERE pc.user_id = p_user_id
      AND l.id = p_lesson_id
  ) INTO course_is_purchased;
  
  RETURN course_is_purchased;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. МИГРАЦИЯ ДАННЫХ ИЗ MOCKDATA
-- ============================================

-- Пример SQL для миграции категорий
INSERT INTO categories (name_ru, name_en, name_kz, slug, icon)
VALUES
  ('Программирование', 'Programming', 'Бағдарламалау', 'programming', '💻'),
  ('Дизайн', 'Design', 'Дизайн', 'design', '🎨'),
  ('Языки', 'Languages', 'Тілдер', 'languages', '🌍'),
  ('Бизнес', 'Business', 'Бизнес', 'business', '💼'),
  ('Маркетинг', 'Marketing', 'Маркетинг', 'marketing', '📢'),
  ('Веб-разработка', 'Web Development', 'Веб-дамыту', 'web-dev', '🌐'),
  ('Data Science', 'Data Science', 'Деректер ғылымы', 'data-science', '📊'),
  ('Мобильная разработка', 'Mobile Development', 'Мобильді дамыту', 'mobile-dev', '📱'),
  ('Школьные предметы', 'School Subjects', 'Мектеп пәндері', 'school', '📚')
ON CONFLICT (slug) DO NOTHING;

-- Пример миграции курса (нужно адаптировать под ваши данные)
-- INSERT INTO courses (
--   title_ru, title_en, title_kz,
--   description_ru, description_en, description_kz,
--   category_id, current_price, old_price,
--   level, rating, students_count, duration_minutes,
--   is_published
-- )
-- VALUES (
--   'Python для начинающих',
--   'Python for Beginners',
--   'Бастапқыларға арналған Python',
--   'Описание курса...',
--   'Course description...',
--   'Курс сипаттамасы...',
--   1, -- category_id
--   4000,
--   6000,
--   'beginner',
--   4.9,
--   15000,
--   720,
--   true
-- );
