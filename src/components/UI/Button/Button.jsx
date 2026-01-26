import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const disabledClass = disabled || loading ? 'btn--disabled' : '';
  const loadingClass = loading ? 'btn--loading' : '';

  const classes = `${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${disabledClass} ${loadingClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      <span className={loading ? 'btn__content--loading' : ''}>{children}</span>
    </button>
  );
};

export default Button;
