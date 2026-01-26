import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../UI/Loader/Loader';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setLoading(true);
      
      // Прокрутка наверх сразу при смене страницы
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Минимальная задержка для плавного перехода (можно настроить)
      const timer = setTimeout(() => {
        setLoading(false);
        setDisplayLocation(location);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <>
      {loading && <Loader fullScreen />}
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;
