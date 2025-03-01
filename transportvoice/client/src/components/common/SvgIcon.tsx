import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface SvgIconProps {
  svgString: string;
  size?: number;
  color?: string;
  boxProps?: BoxProps;
}

/**
 * Component to render an SVG icon from a string
 */
export const SvgIcon: React.FC<SvgIconProps> = ({
  svgString,
  size = 24,
  color,
  boxProps
}) => {
  // Create a sanitized version of the SVG string with our custom styles
  const processedSvg = React.useMemo(() => {
    if (!svgString) return '';
    
    let processed = svgString;
    
    // If a color is specified, add a fill attribute to the svg element
    if (color) {
      processed = processed.replace('<svg', `<svg fill="${color}"`);
    }
    
    // Make sure we have width and height set
    if (!processed.includes('width="')) {
      processed = processed.replace('<svg', `<svg width="${size}"`);
    }
    
    if (!processed.includes('height="')) {
      processed = processed.replace('<svg', `<svg height="${size}"`);
    }
    
    return processed;
  }, [svgString, size, color]);
  
  // If there's no SVG string, return empty box
  if (!svgString) {
    return <Box width={size} height={size} {...boxProps} />;
  }
  
  return (
    <Box
      {...boxProps}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
      sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          width: size,
          height: size
        },
        ...boxProps?.sx
      }}
    />
  );
}; 