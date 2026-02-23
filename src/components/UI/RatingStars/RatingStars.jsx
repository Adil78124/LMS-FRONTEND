import React from 'react';
import { IconStar } from '../Icons/Icons';
import './RatingStars.css';

/**
 * Рейтинг звёздами: только отображение (value 0–5) или выбор (interactive + onChange).
 */
const RatingStars = ({ value = 0, max = 5, size = 16, interactive = false, onChange, className = '' }) => {
  const rating = Math.min(max, Math.max(0, Number(value)));
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  if (interactive && typeof onChange === 'function') {
    return (
      <span className={`rating-stars rating-stars--interactive ${className}`} role="group" aria-label="Рейтинг">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            className={`rating-stars__star ${rating >= star ? 'rating-stars__star--filled' : ''}`}
            onClick={() => onChange(star)}
            aria-label={`${star} из ${max}`}
            aria-pressed={rating >= star}
          >
            <IconStar size={size} filled={rating >= star} />
          </button>
        ))}
      </span>
    );
  }

  return (
    <span className={`rating-stars ${className}`} aria-label={`Рейтинг: ${rating} из ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`rating-stars__star ${i < full ? 'rating-stars__star--filled' : ''} ${i === full && hasHalf ? 'rating-stars__star--half' : ''}`}
          aria-hidden
        >
          <IconStar size={size} filled={i < full || (i === full && hasHalf)} />
        </span>
      ))}
    </span>
  );
};

export default RatingStars;
