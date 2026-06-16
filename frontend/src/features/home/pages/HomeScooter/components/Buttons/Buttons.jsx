import React from 'react';
import { Link } from 'react-router-dom';
import './Buttons.css';

export const Button = ({ variant = 'black', fullWidth = false, children, ...props }) => {
  const classes = [
    'horizon-btn',
    `horizon-btn--${variant}`,
    fullWidth ? 'horizon-btn--full' : '',
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export const LinkButton = ({ variant = 'black', fullWidth = false, children, ...props }) => {
  const classes = [
    'horizon-btn',
    `horizon-btn--${variant}`,
    fullWidth ? 'horizon-btn--full' : '',
  ].filter(Boolean).join(' ');

  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  );
};
