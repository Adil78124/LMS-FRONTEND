import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/UI/Card/Card';
import Loader from '../../components/UI/Loader/Loader';
import './Analytics.css';

const Analytics = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getAnalytics()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatRevenue = (n) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n ?? 0) + ' ₸';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="container">
          <div className="analytics__loading">
            <Loader />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="container">
          <div className="analytics__header">
            <h1 className="analytics__title">{t('teaching.analytics')}</h1>
          </div>
          <Card className="analytics__error">
            <p>{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  const maxChartCount = Math.max(1, ...(data.enrollmentsByDay?.map((x) => x.count) ?? [0]));

  return (
    <div className="analytics">
      <div className="container">
        <div className="analytics__header">
          <h1 className="analytics__title">{t('teaching.analytics')}</h1>
          <p className="analytics__subtitle">{t('teaching.analyticsSubtitle')}</p>
        </div>

        <div className="analytics__stats">
          <Card className="analytics__stat-card analytics__stat-card--primary">
            <div className="analytics__stat-icon">👥</div>
            <div className="analytics__stat-value">{data.totalStudents?.toLocaleString() ?? 0}</div>
            <div className="analytics__stat-label">{t('teaching.analyticsTotalStudents')}</div>
          </Card>
          <Card className="analytics__stat-card">
            <div className="analytics__stat-icon">📅</div>
            <div className="analytics__stat-value">{data.newEnrollmentsWeek ?? 0}</div>
            <div className="analytics__stat-label">{t('teaching.analyticsNewWeek')}</div>
          </Card>
          <Card className="analytics__stat-card">
            <div className="analytics__stat-icon">📆</div>
            <div className="analytics__stat-value">{data.newEnrollmentsMonth ?? 0}</div>
            <div className="analytics__stat-label">{t('teaching.analyticsNewMonth')}</div>
          </Card>
          <Card className="analytics__stat-card">
            <div className="analytics__stat-icon">⭐</div>
            <div className="analytics__stat-value">{data.averageRating ?? 0}</div>
            <div className="analytics__stat-label">{t('teaching.analyticsAvgRating')}</div>
          </Card>
        </div>

        {data.topCourse && (
          <Card className="analytics__top-card">
            <h3 className="analytics__block-title">{t('teaching.analyticsTopCourse')}</h3>
            <div className="analytics__top-content">
              <span className="analytics__top-title">{data.topCourse.title}</span>
              <span className="analytics__top-count">
                {data.topCourse.studentsCount?.toLocaleString()} {t('teaching.students')}
              </span>
            </div>
          </Card>
        )}

        {data.enrollmentsByDay?.length > 0 && (
          <Card className="analytics__chart-card">
            <h3 className="analytics__block-title">{t('teaching.analyticsChartTitle')}</h3>
            <div className="analytics__chart">
              {data.enrollmentsByDay.map((item) => (
                <div key={item.date} className="analytics__chart-bar-wrap">
                  <div
                    className="analytics__chart-bar"
                    style={{
                      height: maxChartCount ? `${(item.count / maxChartCount) * 100}%` : '0%',
                    }}
                    title={`${formatDate(item.date)}: ${item.count}`}
                  />
                  <span className="analytics__chart-label">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {data.coursesTable?.length > 0 && (
          <Card className="analytics__table-card">
            <h3 className="analytics__block-title">{t('teaching.analyticsTableTitle')}</h3>
            <div className="analytics__table-wrap">
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th>{t('teaching.courseTitle')}</th>
                    <th>{t('teaching.students')}</th>
                    <th>{t('course.reviews')}</th>
                    <th>⭐ {t('teaching.analyticsAvgRating')}</th>
                    <th>{t('teaching.analyticsRevenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coursesTable.map((row) => (
                    <tr key={row.id}>
                      <td className="analytics__table-title">{row.title}</td>
                      <td>{row.students?.toLocaleString() ?? 0}</td>
                      <td>{row.reviews ?? 0}</td>
                      <td>{row.rating ?? 0}</td>
                      <td className="analytics__table-revenue">{formatRevenue(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {(!data.coursesTable?.length && !data.enrollmentsByDay?.length) && (
          <Card className="analytics__empty">
            <div className="analytics__coming-soon">
              <span className="analytics__icon">📊</span>
              <h2 className="analytics__coming-title">{t('teaching.analyticsComingSoon')}</h2>
              <p className="analytics__coming-text">
                Создайте курсы и привлеките студентов — здесь появится детальная статистика.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
