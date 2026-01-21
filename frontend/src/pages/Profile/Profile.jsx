import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ProgressContext';
import { mockCourses } from '../../data/mockData';
import Card from '../../components/UI/Card/Card';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  // Получаем курсы с прогрессом
  const coursesWithProgress = mockCourses.map((course) => {
    const courseProgress = progress[course.id] || {
      completedLessons: 0,
      totalLessons: course.lessons?.length || 0,
      progressPercentage: 0,
    };
    return { ...course, progress: courseProgress };
  });

  const inProgressCourses = coursesWithProgress.filter((c) => c.progress.progressPercentage > 0 && c.progress.progressPercentage < 100);
  const completedCourses = coursesWithProgress.filter((c) => c.progress.progressPercentage === 100);

  const totalLessons = coursesWithProgress.reduce((sum, c) => sum + c.progress.totalLessons, 0);
  const completedLessons = coursesWithProgress.reduce((sum, c) => sum + c.progress.completedLessons, 0);

  return (
    <div className="profile">
      <div className="container">
        <h1 className="profile__title">{t('profile.title')}</h1>

        <div className="profile__layout">
          <aside className="profile__sidebar">
            <Card className="profile__card">
              <div className="profile__avatar">
                <span>U</span>
              </div>
              <h2 className="profile__name">{t('profile.user')}</h2>
              <p className="profile__email">user@example.com</p>
            </Card>

            <Card className="profile__card">
              <h3 className="profile__card-title">{t('profile.statistics')}</h3>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.totalLessons')}</span>
                <span className="profile__stat-value">{totalLessons}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.completedLessons')}</span>
                <span className="profile__stat-value">{completedLessons}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.completedCourses')}</span>
                <span className="profile__stat-value">{completedCourses.length}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.inProgress')}</span>
                <span className="profile__stat-value">{inProgressCourses.length}</span>
              </div>
            </Card>
          </aside>

          <main className="profile__main">
            {inProgressCourses.length > 0 && (
              <section className="profile__section">
                <h2 className="profile__section-title">{t('profile.inProgress')}</h2>
                <div className="profile__courses">
                  {inProgressCourses.map((course) => (
                    <Link key={course.id} to={`/course/${course.id}`} className="profile__course">
                      <Card hoverable>
                        <div className="profile__course-header">
                          <h3>{course.title}</h3>
                          <span className="profile__course-progress">{course.progress.progressPercentage}%</span>
                        </div>
                        <div className="profile__course-progress-bar">
                          <div
                            className="profile__course-progress-fill"
                            style={{ width: `${course.progress.progressPercentage}%` }}
                          />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {completedCourses.length > 0 && (
              <section className="profile__section">
                <h2 className="profile__section-title">{t('profile.completedCourses')}</h2>
                <div className="profile__courses">
                  {completedCourses.map((course) => (
                    <Link key={course.id} to={`/course/${course.id}`} className="profile__course">
                      <Card hoverable>
                        <div className="profile__course-header">
                          <h3>{course.title}</h3>
                          <span className="profile__course-completed">✅ {t('profile.completed')}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
