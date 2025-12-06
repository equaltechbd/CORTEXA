import React, { useEffect, useRef } from 'react';

export const CortexaAvatar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize SVG structure
    containerRef.current.innerHTML = `
      <svg class="cortexa-loader-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g id="particle-group"></g>
      </svg>
    `;

    const particleGroup = containerRef.current.querySelector('#particle-group');
    if (!particleGroup) return;

    const numParticles = 150; 
    const centerX = 100;
    const centerY = 100;
    const colors = ['#4F94CD', '#40E0D0', '#2C6688']; 

    for (let i = 0; i < numParticles; i++) {
      // 1. Create the 'C' Shape (Arc from -45 to 225 degrees)
      const angleDeg = -45 + (Math.random() * 270); 
      const angleRad = angleDeg * (Math.PI / 180);
      const radius = 60 + (Math.random() * 25); 
      
      const finalX = centerX + radius * Math.cos(angleRad);
      const finalY = centerY + radius * Math.sin(angleRad);

      // 2. Random Start Positions (Scatter effect)
      const startDistance = 200 + Math.random() * 100; 
      const startAngle = Math.random() * Math.PI * 2; 
      const tx = startDistance * Math.cos(startAngle);
      const ty = startDistance * Math.sin(startAngle);

      // 3. Create SVG Circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", finalX.toString());
      circle.setAttribute("cy", finalY.toString());
      circle.setAttribute("r", (1 + Math.random() * 1.5).toString()); 
      circle.setAttribute("fill", colors[Math.floor(Math.random() * colors.length)]);
      circle.classList.add("particle");
      
      // 4. Set CSS Variables & Animation inline
      circle.style.setProperty("--tx", `${tx}px`);
      circle.style.setProperty("--ty", `${ty}px`);
      circle.style.animation = `gatherAndPulse 3s ease-in-out infinite`;
      circle.style.animationDelay = `${Math.random() * 1.5}s`;

      particleGroup.appendChild(circle);
    }
  }, []);

  return (
    <div className="cortexa-avatar-container" ref={containerRef}></div>
  );
};