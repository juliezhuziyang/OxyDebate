
import { useEffect, useRef } from 'react';

export const DynamicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Initialize particles with enhanced variety
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.5 + 0.8,
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create multiple gradient layers for enhanced depth
      const time = Date.now() * 0.001;
      
      // Primary animated gradient
      const gradient1 = ctx.createRadialGradient(
        mousePos.current.x * canvas.width + Math.sin(time * 0.5) * 50,
        mousePos.current.y * canvas.height + Math.cos(time * 0.3) * 30,
        0,
        mousePos.current.x * canvas.width,
        mousePos.current.y * canvas.height,
        Math.max(canvas.width, canvas.height) * 0.8
      );
      
      gradient1.addColorStop(0, `rgba(59, 130, 246, ${0.12 + Math.sin(time) * 0.03})`);
      gradient1.addColorStop(0.4, `rgba(139, 92, 246, ${0.06 + Math.cos(time * 1.2) * 0.02})`);
      gradient1.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
      
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Secondary flowing gradient
      const gradient2 = ctx.createRadialGradient(
        (1 - mousePos.current.x) * canvas.width + Math.cos(time * 0.7) * 40,
        (1 - mousePos.current.y) * canvas.height + Math.sin(time * 0.4) * 35,
        0,
        (1 - mousePos.current.x) * canvas.width,
        (1 - mousePos.current.y) * canvas.height,
        Math.max(canvas.width, canvas.height) * 0.6
      );
      
      gradient2.addColorStop(0, `rgba(139, 92, 246, ${0.08 + Math.sin(time * 1.5) * 0.02})`);
      gradient2.addColorStop(0.5, `rgba(59, 130, 246, ${0.04 + Math.cos(time * 0.8) * 0.01})`);
      gradient2.addColorStop(1, 'rgba(139, 92, 246, 0.01)');
      
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tertiary accent gradient
      const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient3.addColorStop(0, `rgba(59, 130, 246, ${0.03 + Math.sin(time * 2) * 0.01})`);
      gradient3.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      gradient3.addColorStop(1, `rgba(59, 130, 246, ${0.03 + Math.cos(time * 1.8) * 0.01})`);
      
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Enhanced mouse interaction with repulsion
        const dx = mousePos.current.x * canvas.width - particle.x;
        const dy = mousePos.current.y * canvas.height - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 250) {
          const force = (250 - distance) / 250;
          // Repulsion effect
          particle.vx -= (dx / distance) * force * 0.012;
          particle.vy -= (dy / distance) * force * 0.012;
        }
        
        // Add subtle wave motion
        particle.vx += Math.sin(time + particle.x * 0.01) * 0.002;
        particle.vy += Math.cos(time + particle.y * 0.01) * 0.002;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Apply friction
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Enhanced particle rendering with dynamic colors
        const colorPhase = (time + index * 0.5) % (Math.PI * 2);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Dynamic color mixing
        const r = Math.floor(59 + Math.sin(colorPhase) * 30);
        const g = Math.floor(130 + Math.cos(colorPhase * 1.2) * 40);
        const b = Math.floor(246 + Math.sin(colorPhase * 0.8) * 10);
        
        // Enhanced glow effect
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.8})`);
        glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.3})`);
        glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Enhanced connections with dynamic opacity
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const pulseOpacity = 0.2 + Math.sin(time * 2 + distance * 0.01) * 0.1;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${pulseOpacity * (1 - distance / 180)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        opacity: 0.9,
        filter: 'blur(0.5px)'
      }}
    />
  );
};
