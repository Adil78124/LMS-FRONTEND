import React, { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    // Загрузка прогресса из localStorage
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading progress from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Сохранение прогресса в localStorage
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }, [progress]);

  const markLessonCompleted = (courseId, lessonId) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || {
        lessons: {},
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0,
      };

      if (!courseProgress.lessons[lessonId]) {
        courseProgress.lessons[lessonId] = {
          isCompleted: true,
          completedAt: new Date().toISOString(),
        };
        courseProgress.completedLessons += 1;
      } else if (!courseProgress.lessons[lessonId].isCompleted) {
        courseProgress.lessons[lessonId].isCompleted = true;
        courseProgress.lessons[lessonId].completedAt = new Date().toISOString();
        courseProgress.completedLessons += 1;
      }

      if (courseProgress.totalLessons > 0) {
        courseProgress.progressPercentage = Math.round(
          (courseProgress.completedLessons / courseProgress.totalLessons) * 100
        );
      }

      return {
        ...prev,
        [courseId]: courseProgress,
      };
    });
  };

  const isLessonCompleted = (courseId, lessonId) => {
    return progress[courseId]?.lessons?.[lessonId]?.isCompleted || false;
  };

  const getCourseProgress = (courseId) => {
    return progress[courseId] || {
      lessons: {},
      completedLessons: 0,
      totalLessons: 0,
      progressPercentage: 0,
    };
  };

  const setCourseTotalLessons = (courseId, totalLessons) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || {
        lessons: {},
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0,
      };

      courseProgress.totalLessons = totalLessons;
      
      if (totalLessons > 0) {
        courseProgress.progressPercentage = Math.round(
          (courseProgress.completedLessons / totalLessons) * 100
        );
      }

      return {
        ...prev,
        [courseId]: courseProgress,
      };
    });
  };

  const value = {
    progress,
    markLessonCompleted,
    isLessonCompleted,
    getCourseProgress,
    setCourseTotalLessons,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
