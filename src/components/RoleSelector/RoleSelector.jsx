import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './RoleSelector.css';

const ROLES = [
  {
    value: 'schoolkid',
    label: 'auth.roleSchoolkid',
    image: '/images/roles/schoolboy.jpg',
  },
  {
    value: 'student',
    label: 'auth.roleStudent',
    image: '/images/roles/studentboy.jpg',
  },
  {
    value: 'teacher',
    label: 'auth.roleTeacher',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&q=80',
  },
];

const RoleSelector = ({ selectedRole, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="role-selector role-selector--panels">
      <div className="role-selector__content">
        <h2 className="role-selector__title">{t('auth.chooseRole')}</h2>
        <p className="role-selector__subtitle">{t('auth.chooseRoleDesc')}</p>

        <div className="role-selector__panels">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              className={`role-selector__panel ${selectedRole === role.value ? 'role-selector__panel--selected' : ''}`}
              onClick={() => onSelect(role.value)}
            >
              <div className="role-selector__panel-image-wrap">
                <img
                  src={role.image}
                  alt={t(role.label)}
                  className="role-selector__panel-image"
                  loading="lazy"
                />
              </div>
              <span className="role-selector__panel-label">{t(role.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
