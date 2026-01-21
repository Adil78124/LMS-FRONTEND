import React, { useState, useEffect } from 'react';
import './PromotionalBanner.css';

const PromotionalBanner = ({ variant = 'large' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 9,
    minutes: 2,
    seconds: 4
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value) => {
    return value.toString().padStart(2, '0');
  };

  if (variant === 'large') {
    return (
      <div className="promotional-banner large">
        <div className="banner-content">
          <div className="banner-text">
            <div className="banner-logo">S</div>
            <h2 className="banner-title">Один LMS до новых знаний</h2>
          </div>
          <div className="countdown-container">
            <div className="countdown-label">до финала распродажи</div>
            <div className="countdown-timer">
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.days)}</div>
                <div className="time-label">день</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.hours)}</div>
                <div className="time-label">часов</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.minutes)}</div>
                <div className="time-label">минуты</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.seconds)}</div>
                <div className="time-label">секунды</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="promotional-banner small">
      <div className="banner-logo-small">S</div>
      <div className="banner-content-small">
        <h3 className="banner-title-small">Один LMS до новых знаний</h3>
        <p className="banner-date">С 19 ноября по 3 декабря</p>
        <p className="banner-description">Максимально тёплые скидки на курсы этой осенью</p>
      </div>
    </div>
  );
};

export default PromotionalBanner;
