import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [coursesExpanded, setCoursesExpanded] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-banner">
        <div className="banner-illustration">
          <div className="illustration-item"></div>
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-title">
          <svg className="sidebar-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10l7-7 7 7M3 10v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M8 17v-5h4v5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          <span>Моё обучение</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <button 
              className="nav-section-header"
              onClick={() => setCoursesExpanded(!coursesExpanded)}
            >
              <svg className="nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 7h14M6 3v4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Курсы</span>
              <span className={`dropdown-arrow ${coursesExpanded ? 'expanded' : ''}`}>▼</span>
            </button>
            {coursesExpanded && (
              <div className="nav-submenu">
                <a href="#" className="nav-submenu-item">Прохожу</a>
                <a href="#" className="nav-submenu-item">Избранные</a>
                <a href="#" className="nav-submenu-item">Хочу пройти</a>
                <a href="#" className="nav-submenu-item">Архив</a>
              </div>
            )}
          </div>

          <a href="#" className="nav-item">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 6v6c0 4.5 3 7.5 7 8 4-.5 7-3.5 7-8V6l-7-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>Классы</span>
          </a>

          <a href="#" className="nav-item">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a6 6 0 0 1 6 6v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M6 14a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>Уведомления</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="help-link">
            <svg className="help-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M8 12v-1M8 6v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Помощь</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
