# 🗄️ Руководство по миграции в Supabase

## 📋 Шаги для настройки базы данных

### 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### 2. Выполнение SQL схемы

1. В панели Supabase перейдите в **SQL Editor**
2. Откройте файл `supabase-schema.sql`
3. Скопируйте весь SQL код
4. Вставьте в SQL Editor
5. Нажмите **Run** для выполнения

### 3. Настройка аутентификации

1. Перейдите в **Authentication** → **Settings**
2. Включите **Email** провайдер
3. Настройте email templates (опционально)

### 4. Получение ключей API

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon/public key** (для клиентской части)
   - **service_role key** (только для серверной части, НЕ используйте в клиенте!)

### 5. Настройка переменных окружения

Создайте файл `.env` в папке `frontend`:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Установка Supabase клиента

```bash
cd frontend
npm install @supabase/supabase-js
```

### 7. Создание клиента Supabase

Создайте файл `frontend/src/services/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 🔐 Безопасность (RLS)

Все таблицы защищены **Row Level Security (RLS)**:

- ✅ Пользователи видят только свои данные
- ✅ Все могут видеть опубликованные курсы
- ✅ Преподаватели могут управлять своими курсами
- ✅ Корзина и заказы приватны для каждого пользователя

## 📊 Структура данных

### Основные таблицы:

1. **profiles** - Профили пользователей
2. **categories** - Категории курсов
3. **courses** - Курсы
4. **lessons** - Уроки
5. **cart_items** - Корзина
6. **orders** - Заказы
7. **order_items** - Элементы заказов
8. **user_progress** - Прогресс обучения
9. **purchased_courses** - Купленные курсы

## 🔄 Миграция данных

### Из mockData в Supabase:

1. Экспортируйте данные из `mockData.js`
2. Используйте SQL INSERT или Supabase Dashboard
3. Или создайте скрипт миграции

### Пример миграции курсов:

```javascript
// migration-script.js
import { supabase } from './services/supabaseClient';
import { mockCourses } from './data/mockData';

async function migrateCourses() {
  for (const course of mockCourses) {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title_ru: course.title,
        title_en: course.title, // или переведите
        title_kz: course.title, // или переведите
        category_id: course.categoryId,
        author_id: null, // или создайте авторов
        current_price: course.currentPrice,
        old_price: course.oldPrice,
        // ... остальные поля
      });
    
    if (error) console.error('Error:', error);
  }
}
```

## 🧪 Тестирование

### Проверка RLS:

1. Создайте тестового пользователя
2. Войдите в систему
3. Проверьте, что видите только свои данные

### Проверка запросов:

```javascript
// Получить все курсы
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('is_published', true);

// Получить корзину пользователя
const { data, error } = await supabase
  .from('cart_items')
  .select('*, courses(*)')
  .eq('user_id', userId);
```

## 📝 Важные замечания

1. **RLS включен** - все запросы автоматически фильтруются
2. **Автоматическое создание профиля** - при регистрации создается запись в `profiles`
3. **Автоматическое добавление курсов** - при создании заказа курсы автоматически добавляются в `purchased_courses`
4. **Мультиязычность** - все тексты хранятся в трех языках (ru, en, kz)

## 🔧 Дополнительные настройки

### Storage для изображений:

```sql
-- Создайте bucket для изображений курсов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-images', 'course-images', true);
```

### Функции для статистики:

```sql
-- Функция для получения статистики преподавателя
CREATE OR REPLACE FUNCTION get_teacher_stats(teacher_id UUID)
RETURNS TABLE (
  total_courses INTEGER,
  total_students BIGINT,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::INTEGER as total_courses,
    SUM(c.students_count)::BIGINT as total_students,
    SUM(c.current_price * c.students_count * 0.7)::DECIMAL as total_earnings
  FROM public.courses c
  WHERE c.author_id = teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚀 Готово!

После выполнения всех шагов ваша база данных готова к использованию!
