import React from 'react';

export default function GradientBorder({ 
  children, 
  radius = '11px', 
  padding = '1px', 
  className = '',
  hoverIntensify = false,
  style = {},
}) {
  const [hovered, setHovered] = React.useState(false);

  const baseGradient = 'linear-gradient(135deg, rgba(44,58,30,0.25), rgba(200,184,138,0.5), rgba(44,58,30,0.25))';
  const hoverGradient = 'linear-gradient(135deg, rgba(44,58,30,0.5), rgba(200,184,138,0.8), rgba(44,58,30,0.5))';

  return (
    <div
      className={className}
      style={{
        background: hoverIntensify && hovered ? hoverGradient : baseGradient,
        padding,
        borderRadius: radius,
        transition: 'all 200ms ease-out',
        ...style,
      }}
      onMouseEnter={hoverIntensify ? () => setHovered(true) : undefined}
      onMouseLeave={hoverIntensify ? () => setHovered(false) : undefined}
    >
      {children}
    </div>
  );
}