-- ============================================
-- SQL Схема для Supabase
-- Образовательная платформа LMS
-- ============================================

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (расширение auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ТАБЛИЦА КАТЕГОРИЙ КУРСОВ
-- ============================================
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_kz TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ТАБЛИЦА КУРСОВ
-- ============================================
CREATE TABLE public.courses (
  id SERIAL PRIMARY KEY,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_kz TEXT NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  description_kz TEXT,
  full_description_ru TEXT,
  full_description_en TEXT,
  full_description_kz TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language TEXT DEFAULT 'ru',
  image_url TEXT,
  old_price DECIMAL(10, 2) DEFAULT 0,
  current_price DECIMAL(10, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ТАБЛИЦА ЧТО ВЫ УЗНАЕТЕ (для курсов)
-- ============================================
CREATE TABLE public.course_learning_points (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  text_ru TEXT NOT NULL,
  text_en TEXT NOT NULL,
  text_kz TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ТАБЛИЦА ТРЕБОВАНИЙ (для курсов)
-- ============================================
CREATE TABLE public.course_requirements (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  text_ru TEXT NOT NULL,
  text_en TEXT NOT NULL,
  text_kz TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ТАБЛИЦА УРОКОВ
-- ============================================
CREATE TABLE public.lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_kz TEXT NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  description_kz TEXT,
  content_ru TEXT,
  content_en TEXT,
  content_kz TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  lesson_order INTEGER NOT NULL,
  lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practice', 'dialogue', 'project', 'test')),
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, lesson_order)
);

-- ============================================
-- 7. ТАБЛИЦА КОРЗИНЫ
-- ============================================
CREATE TABLE public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- 8. ТАБЛИЦА ЗАКАЗОВ
-- ============================================
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. ТАБЛИЦА ЭЛЕМЕНТОВ ЗАКАЗА
-- ============================================
CREATE TABLE public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,
  course_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. ТАБЛИЦА ПРОГРЕССА ОБУЧЕНИЯ
-- ============================================
CREATE TABLE public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- ============================================
-- 11. ТАБЛИЦА КУПЛЕННЫХ КУРСОВ
-- ============================================
CREATE TABLE public.purchased_courses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE SET NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_author ON public.courses(author_id);
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course ON public.user_progress(course_id);
CREATE INDEX idx_purchased_courses_user ON public.purchased_courses(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_courses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ПОЛИТИКИ ДЛЯ PROFILES
-- ============================================
-- Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ CATEGORIES
-- ============================================
-- Все могут видеть категории
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- ============================================
-- ПОЛИТИКИ ДЛЯ COURSES
-- ============================================
-- Все могут видеть опубликованные курсы
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- Преподаватели могут видеть свои курсы (даже неопубликованные)
CREATE POLICY "Teachers can view own courses"
  ON public.courses FOR SELECT
  USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Преподаватели могут создавать курсы
CREATE POLICY "Teachers can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Преподаватели могут обновлять свои курсы
CREATE POLICY "Teachers can update own courses"
  ON public.courses FOR UPDATE
  USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ LESSONS
-- ============================================
-- Все могут видеть уроки опубликованных курсов
CREATE POLICY "Lessons of published courses are viewable"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = lessons.course_id AND is_published = true
    )
  );

-- Пользователи могут видеть уроки купленных курсов
CREATE POLICY "Users can view lessons of purchased courses"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchased_courses
      WHERE user_id = auth.uid() AND course_id = lessons.course_id
    )
  );

-- Преподаватели могут видеть уроки своих курсов
CREATE POLICY "Teachers can view own course lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND author_id = auth.uid()
    )
  );

-- Преподаватели могут создавать уроки для своих курсов
CREATE POLICY "Teachers can create lessons for own courses"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND author_id = auth.uid()
    )
  );

-- Преподаватели могут обновлять уроки своих курсов
CREATE POLICY "Teachers can update own course lessons"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND author_id = auth.uid()
    )
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ CART_ITEMS
-- ============================================
-- Пользователи могут видеть только свою корзину
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут добавлять в свою корзину
CREATE POLICY "Users can add to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свою корзину
CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут удалять из своей корзины
CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ ORDERS
-- ============================================
-- Пользователи могут видеть только свои заказы
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать заказы для себя
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ ORDER_ITEMS
-- ============================================
-- Пользователи могут видеть элементы своих заказов
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Пользователи могут создавать элементы для своих заказов
CREATE POLICY "Users can create own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- ПОЛИТИКИ ДЛЯ USER_PROGRESS
-- ============================================
-- Пользователи могут видеть только свой прогресс
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать свой прогресс
CREATE POLICY "Users can create own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свой прогресс
CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- ПОЛИТИКИ ДЛЯ PURCHASED_COURSES
-- ============================================
-- Пользователи могут видеть только свои купленные курсы
CREATE POLICY "Users can view own purchased courses"
  ON public.purchased_courses FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать записи о покупке (через заказ)
CREATE POLICY "Users can create own purchased courses"
  ON public.purchased_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для генерации номера заказа
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_id INTEGER;
BEGIN
  -- Получаем следующий ID из последовательности
  SELECT nextval('orders_id_seq') INTO next_id;
  -- Генерируем номер заказа
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_id::TEXT, 6, '0');
  -- Устанавливаем ID
  NEW.id := next_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации номера заказа
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для автоматического добавления курсов в purchased_courses при создании заказа
CREATE OR REPLACE FUNCTION public.handle_order_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Добавляем курсы из заказа в purchased_courses
  INSERT INTO public.purchased_courses (user_id, course_id, order_id)
  SELECT 
    NEW.user_id,
    oi.course_id,
    NEW.id
  FROM public.order_items oi
  WHERE oi.order_id = NEW.id
  ON CONFLICT (user_id, course_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического добавления курсов при создании заказа
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_created();

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- ============================================

-- Вставляем категории
INSERT INTO public.categories (name_ru, name_en, name_kz, slug, icon) VALUES
('Программирование', 'Programming', 'Бағдарламалау', 'programming', '💻'),
('Дизайн', 'Design', 'Дизайн', 'design', '🎨'),
('Языки', 'Languages', 'Тілдер', 'languages', '🌍'),
('Бизнес', 'Business', 'Бизнес', 'business', '💼'),
('Маркетинг', 'Marketing', 'Маркетинг', 'marketing', '📢'),
('Веб-разработка', 'Web Development', 'Веб-дамыту', 'web-dev', '🌐'),
('Data Science', 'Data Science', 'Деректер ғылымы', 'data-science', '📊'),
('Мобильная разработка', 'Mobile Development', 'Мобильді дамыту', 'mobile-dev', '📱'),
('Школьные предметы', 'School Subjects', 'Мектеп пәндері', 'school', '📚');

-- ============================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ============================================
COMMENT ON TABLE public.profiles IS 'Профили пользователей (расширение auth.users)';
COMMENT ON TABLE public.categories IS 'Категории курсов';
COMMENT ON TABLE public.courses IS 'Курсы платформы';
COMMENT ON TABLE public.lessons IS 'Уроки курсов';
COMMENT ON TABLE public.cart_items IS 'Корзина пользователей';
COMMENT ON TABLE public.orders IS 'Заказы пользователей';
COMMENT ON TABLE public.order_items IS 'Элементы заказов';
COMMENT ON TABLE public.user_progress IS 'Прогресс обучения пользователей';
COMMENT ON TABLE public.purchased_courses IS 'Купленные курсы пользователей';
