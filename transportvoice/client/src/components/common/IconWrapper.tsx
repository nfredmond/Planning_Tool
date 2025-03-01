import React from 'react';
import { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A wrapper component for react-icons to fix TypeScript errors
 * This component properly handles the IconType from react-icons
 */
const IconWrapper: React.FC<IconWrapperProps> = ({ 
  icon: Icon, 
  size = 24, 
  color,
  className,
  style
}) => {
  // Use createElement instead of JSX to avoid TypeScript errors
  return React.createElement(Icon as React.ComponentType<any>, {
    size,
    color,
    className,
    style
  });
};

export default IconWrapper; 