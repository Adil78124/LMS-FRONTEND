// ⚠️ ВАЖНО: Этот файл содержит данные для экспорта в Supabase
// Все данные, связанные с БД, хранятся здесь отдельно
// В будущем эти данные будут импортированы в Supabase
//
// 📋 ПОЛНАЯ SQL СХЕМА: см. файл supabase-schema.sql
// 📖 РУКОВОДСТВО: см. файл supabase-migration-guide.md
// 🔧 КЛИЕНТ: см. файл ../services/supabaseClient.js

// Структура таблиц для Supabase (устаревшая версия, используйте supabase-schema.sql)
export const supabaseSchema = {
  // Таблица курсов
  courses: {
    table: 'courses',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      title: 'text NOT NULL',
      description: 'text',
      full_description: 'text',
      author_id: 'uuid REFERENCES users(id)',
      category_id: 'uuid REFERENCES categories(id)',
      level: 'text', // beginner, intermediate, advanced
      language: 'text', // ru, en, kz
      price: 'numeric',
      old_price: 'numeric',
      rating: 'numeric DEFAULT 0',
      reviews_count: 'integer DEFAULT 0',
      students_count: 'integer DEFAULT 0',
      duration: 'integer', // в минутах
      image_url: 'text',
      is_published: 'boolean DEFAULT false',
      created_at: 'timestamp DEFAULT now()',
      updated_at: 'timestamp DEFAULT now()',
    },
  },
  
  // Таблица категорий
  categories: {
    table: 'categories',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      name_ru: 'text NOT NULL',
      name_en: 'text NOT NULL',
      name_kz: 'text NOT NULL',
      slug: 'text UNIQUE NOT NULL',
      icon: 'text',
      created_at: 'timestamp DEFAULT now()',
    },
  },
  
  // Таблица уроков
  lessons: {
    table: 'lessons',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      course_id: 'uuid REFERENCES courses(id) ON DELETE CASCADE',
      title: 'text NOT NULL',
      description: 'text',
      content: 'jsonb', // JSON контент урока (текст, видео, задания)
      type: 'text', // theory, practice, video, quiz, project
      duration: 'integer', // в минутах
      order_index: 'integer NOT NULL',
      is_free: 'boolean DEFAULT false',
      created_at: 'timestamp DEFAULT now()',
      updated_at: 'timestamp DEFAULT now()',
    },
  },
  
  // Таблица прогресса пользователей
  user_progress: {
    table: 'user_progress',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
      course_id: 'uuid REFERENCES courses(id) ON DELETE CASCADE',
      lesson_id: 'uuid REFERENCES lessons(id) ON DELETE CASCADE',
      is_completed: 'boolean DEFAULT false',
      progress_percentage: 'integer DEFAULT 0',
      last_accessed_at: 'timestamp',
      completed_at: 'timestamp',
      created_at: 'timestamp DEFAULT now()',
      updated_at: 'timestamp DEFAULT now()',
      UNIQUE: '(user_id, lesson_id)',
    },
  },
  
  // Таблица покупок курсов
  purchases: {
    table: 'purchases',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
      course_id: 'uuid REFERENCES courses(id) ON DELETE CASCADE',
      price: 'numeric NOT NULL',
      payment_method: 'text',
      payment_status: 'text DEFAULT pending', // pending, completed, failed, refunded
      transaction_id: 'text',
      purchased_at: 'timestamp DEFAULT now()',
      UNIQUE: '(user_id, course_id)',
    },
  },
  
  // Таблица корзины
  cart_items: {
    table: 'cart_items',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
      course_id: 'uuid REFERENCES courses(id) ON DELETE CASCADE',
      added_at: 'timestamp DEFAULT now()',
      UNIQUE: '(user_id, course_id)',
    },
  },
  
  // Таблица отзывов
  reviews: {
    table: 'reviews',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
      course_id: 'uuid REFERENCES courses(id) ON DELETE CASCADE',
      rating: 'integer NOT NULL CHECK (rating >= 1 AND rating <= 5)',
      comment: 'text',
      created_at: 'timestamp DEFAULT now()',
      updated_at: 'timestamp DEFAULT now()',
      UNIQUE: '(user_id, course_id)',
    },
  },
  
  // Таблица пользователей (базовая структура)
  users: {
    table: 'users',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()',
      email: 'text UNIQUE NOT NULL',
      full_name: 'text',
      avatar_url: 'text',
      role: 'text DEFAULT student', // student, teacher, admin
      bio: 'text',
      created_at: 'timestamp DEFAULT now()',
      updated_at: 'timestamp DEFAULT now()',
    },
  },
};

// Пример данных для экспорта (можно расширить)
export const sampleData = {
  categories: [
    {
      name_ru: 'Программирование',
      name_en: 'Programming',
      name_kz: 'Бағдарламалау',
      slug: 'programming',
      icon: 'code',
    },
    {
      name_ru: 'Дизайн',
      name_en: 'Design',
      name_kz: 'Дизайн',
      slug: 'design',
      icon: 'palette',
    },
    {
      name_ru: 'Языки',
      name_en: 'Languages',
      name_kz: 'Тілдер',
      slug: 'languages',
      icon: 'language',
    },
    {
      name_ru: 'Бизнес',
      name_en: 'Business',
      name_kz: 'Бизнес',
      slug: 'business',
      icon: 'briefcase',
    },
    {
      name_ru: 'Маркетинг',
      name_en: 'Marketing',
      name_kz: 'Маркетинг',
      slug: 'marketing',
      icon: 'megaphone',
    },
  ],
};

// Функция для экспорта данных (когда будет подключен Supabase)
export const exportToSupabase = async (supabaseClient) => {
  // Пример использования:
  // const { data, error } = await supabaseClient.from('courses').insert(coursesData);
  console.log('Экспорт данных в Supabase будет реализован при подключении БД');
};
