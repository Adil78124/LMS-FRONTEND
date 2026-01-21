import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import './Loader.css';

const Loader = ({ fullScreen = false, size = 'md' }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`loader ${fullScreen ? 'loader--fullscreen' : ''} loader--${size}`}>
      <div className="loader__spinner">
        <div className="loader__circle"></div>
        <div className="loader__circle"></div>
        <div className="loader__circle"></div>
      </div>
      <div className="loader__text">{t('common.loading')}</div>
    </div>
  );
};

export default Loader;
