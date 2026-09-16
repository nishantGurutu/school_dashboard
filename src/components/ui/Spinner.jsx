import React from 'react';

export const Spinner = ({ size = 16, color = 'currentColor' }) => (
  <span
    aria-label="Loading"
    role="status"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: 'inline-block',
      border: `2px solid ${color}55`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      verticalAlign: '-3px'
    }}
  />
);

export default Spinner;