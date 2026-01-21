import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  hoverable = false,
  elevated = false,
  onClick,
  ...props
}) => {
  const baseClass = 'card';
  const hoverableClass = hoverable ? 'card--hoverable' : '';
  const elevatedClass = elevated ? 'card--elevated' : '';
  const clickableClass = onClick ? 'card--clickable' : '';

  const classes = `${baseClass} ${hoverableClass} ${elevatedClass} ${clickableClass} ${className}`.trim();

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
