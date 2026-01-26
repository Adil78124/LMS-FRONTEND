import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockCourses } from '../../data/mockData';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import './Teaching.css';

const Teaching = () => {
  const { t } = useLanguage();
  // В реальном приложении здесь будет загрузка курсов преподавателя из API
  const [myCourses] = useState([]); // Моковые данные - пустой массив для демонстрации

  // Для демонстрации показываем все курсы (в реальности только курсы текущего пользователя)
  const teacherCourses = mockCourses.filter(course => course.authorId <= 12);

  return (
    <div className="teaching">
      <div className="container">
        <div className="teaching__header">
          <h1 className="teaching__title">{t('teaching.title')}</h1>
          <p className="teaching__subtitle">
            Создавайте и управляйте своими курсами. Зарабатывайте, делясь знаниями.
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => alert(t('teaching.createCourse') + ' - функция в разработке')}
          >
            {t('teaching.createCourse')}
          </Button>
        </div>

        <div className="teaching__stats">
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">{teacherCourses.length}</div>
            <div className="teaching__stat-label">{t('teaching.myCourses')}</div>
          </Card>
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">
              {teacherCourses.reduce((sum, c) => sum + c.studentsCount, 0).toLocaleString()}
            </div>
            <div className="teaching__stat-label">{t('teaching.students')}</div>
          </Card>
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">
              {teacherCourses.reduce((sum, c) => sum + (c.currentPrice * c.studentsCount * 0.7), 0).toLocaleString()} ₸
            </div>
            <div className="teaching__stat-label">{t('teaching.earnings')}</div>
          </Card>
        </div>

        <div className="teaching__section">
          <div className="teaching__section-header">
            <h2 className="teaching__section-title">{t('teaching.myCourses')}</h2>
            <Button 
              variant="outline"
              onClick={() => alert(t('teaching.createCourse') + ' - функция в разработке')}
            >
              + {t('teaching.createCourse')}
            </Button>
          </div>

          {teacherCourses.length > 0 ? (
            <div className="teaching__courses">
              {teacherCourses.map((course) => (
                <Card key={course.id} className="teaching__course-card" hoverable>
                  <div className="teaching__course-header">
                    <div className="teaching__course-info">
                      <h3 className="teaching__course-title">{course.title}</h3>
                      <p className="teaching__course-meta">
                        {course.studentsCount} {t('teaching.students')} • 
                        {course.rating} ⭐ • 
                        {course.currentPrice > 0 ? `${course.currentPrice} ₸` : t('catalog.free')}
                      </p>
                    </div>
                    <div className="teaching__course-status">
                      <span className={`teaching__status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                        {course.isPublished ? t('teaching.published') : t('teaching.draft')}
                      </span>
                    </div>
                  </div>
                  <div className="teaching__course-actions">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => alert(t('teaching.editCourse') + ' - функция в разработке')}
                    >
                      {t('teaching.editCourse')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => alert(t('teaching.addLesson') + ' - функция в разработке')}
                    >
                      {t('teaching.addLesson')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => alert(t('teaching.students') + ' - функция в разработке')}
                    >
                      {t('teaching.students')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => alert(t('teaching.statistics') + ' - функция в разработке')}
                    >
                      {t('teaching.statistics')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="teaching__empty">
              <div className="teaching__empty-icon">📚</div>
              <h3 className="teaching__empty-title">{t('teaching.noCourses')}</h3>
              <p className="teaching__empty-text">{t('teaching.createFirst')}</p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => alert(t('teaching.createCourse') + ' - функция в разработке')}
              >
                {t('teaching.createCourse')}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teaching;
