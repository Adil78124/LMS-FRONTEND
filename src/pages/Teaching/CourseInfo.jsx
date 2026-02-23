import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { courseService } from '../../services/courseService';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import './CourseInfo.css';

const CourseInfo = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    fullDescription: '',
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    courseService
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          setCourse(data);
          setForm({
            title: data.title || '',
            description: data.description || '',
            fullDescription: data.fullDescription || '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('course.notFound'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, t]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!course?.id) return;
    setSaving(true);
    setError('');
    try {
      await courseService.update(course.id, {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        fullDescription: form.fullDescription?.trim() || undefined,
      });
      setCourse((c) => (c ? { ...c, ...form } : null));
      setEditing(false);
      setToast(t('teaching.courseSaved'));
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="course-info">
      {loading && (
        <div className="course-info__loading">
          <Loader />
        </div>
      )}

      {!loading && error && !course && (
        <Card className="course-info__error">
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/teaching')}>
            {t('teaching.myCoursesManage')}
          </Button>
        </Card>
      )}

      {!loading && course && (
        <>
      <div className="course-info__header">
        <h1 className="course-info__title">{t('teaching.aboutCourse')}</h1>
        <div className="course-info__actions">
          {!editing ? (
            <>
              <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                {t('teaching.editDescription')}
              </Button>
              <Link to={`/course/${course.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">{t('teaching.openPromoPage')}</Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Card className="course-info__card">
          <form onSubmit={handleSave} className="course-info__form">
            {error && <div className="course-info__error" role="alert">{error}</div>}
            <div className="course-info__row">
              <label className="course-info__label">{t('teaching.courseTitle')}</label>
              <input
                type="text"
                className="course-info__input"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={64}
              />
              <span className="course-info__counter">{form.title.length}/64</span>
            </div>
            <div className="course-info__row">
              <label className="course-info__label">{t('teaching.courseDescription')}</label>
              <textarea
                className="course-info__input course-info__textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                maxLength={1000}
              />
            </div>
            <div className="course-info__row">
              <label className="course-info__label">{t('teaching.fullDescription')}</label>
              <textarea
                className="course-info__input course-info__textarea"
                rows={8}
                value={form.fullDescription}
                onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))}
                maxLength={5000}
              />
            </div>
          </form>
        </Card>
      ) : (
        <div className="course-info__content">
          <Card className="course-info__card course-info__card--read">
            {course.description || course.fullDescription ? (
              <>
                {course.description && (
                  <p className="course-info__desc">{course.description}</p>
                )}
                {course.fullDescription && (
                  <div className="course-info__full">
                    {course.fullDescription.split('\n').map((line, i) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="course-info__empty">
                <p className="course-info__empty-text">{t('teaching.addDescriptionHint')}</p>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  {t('teaching.editDescription')}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      <aside className="course-info__sidebar">
        <Card className="course-info__side-card">
          <h3 className="course-info__side-title">{t('teaching.certificatesNotIssued')}</h3>
        </Card>
        <Card className="course-info__side-card">
          <h3 className="course-info__side-title">{t('teaching.courseIncludes')}</h3>
          <p className="course-info__side-text">{t('teaching.addLessonsToContent')}</p>
          <Link to={`/teaching/course/${course.id}/lessons`}>
            <Button variant="outline" size="sm">{t('teaching.content')} →</Button>
          </Link>
        </Card>
      </aside>

      {toast && (
        <div className="course-info__toast" role="status">
          {toast}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default CourseInfo;
