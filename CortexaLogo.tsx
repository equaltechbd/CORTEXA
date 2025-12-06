import React, { useEffect, useRef } from 'react';

interface CortexaLogoProps {
  size?: number;
  particleCount?: number;
  className?: string;
}

export const CortexaLogo: React.FC<CortexaLogoProps> = ({ 
  size = 200, 
  particleCount = 150,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize SVG structure
    containerRef.current.innerHTML = `
      <svg class="cortexa-loader-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; overflow: visible;">
        <g id="particle-group-${size}"></g>
      </svg>
    `;

    const particleGroup = containerRef.current.querySelector(`[id^="particle-group-"]`);
    if (!particleGroup) return;

    const centerX = 100;
    const centerY = 100;
    const colors = ['#4F94CD', '#40E0D0', '#2C6688', '#5DADE2']; 

    for (let i = 0; i < particleCount; i++) {
      // --- THE GEOMETRY FIX ---
      // Standard "C" (Open on the Right).
      // SVG: 0 deg is Right. 90 is Down. 180 is Left. 270 is Up.
      // Dots from 45 (Bottom-Right) -> 180 (Left) -> 315 (Top-Right).
      
      const angleDeg = 45 + (Math.random() * 270); 
      const angleRad = angleDeg * (Math.PI / 180);

      // Radius: 55 to 85 gives that "Thick" C look
      const radius = 55 + (Math.random() * 30); 
      
      const finalX = centerX + radius * Math.cos(angleRad);
      const finalY = centerY + radius * Math.sin(angleRad);

      // Random Scattering for the start of animation
      const startDistance = 200 + Math.random() * 150; 
      const startAngle = Math.random() * Math.PI * 2; 
      const tx = startDistance * Math.cos(startAngle);
      const ty = startDistance * Math.sin(startAngle);

      // Create SVG Element
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", finalX.toString());
      circle.setAttribute("cy", finalY.toString());
      circle.setAttribute("r", (1.2 + Math.random() * 1.8).toString()); 
      circle.setAttribute("fill", colors[Math.floor(Math.random() * colors.length)]);
      circle.classList.add("particle");
      
      // Apply Animation Variables inline
      circle.style.setProperty("--tx", `${tx}px`);
      circle.style.setProperty("--ty", `${ty}px`);
      circle.style.setProperty("--delay", `${Math.random() * 1.5}s`);
      circle.style.animation = `gatherAndPulse 3.5s ease-in-out infinite`;
      circle.style.animationDelay = `${Math.random() * 1.5}s`;

      particleGroup.appendChild(circle);
    }
  }, [size, particleCount]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
    ></div>
  );
};