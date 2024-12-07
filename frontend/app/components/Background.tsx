'use client';
import { useEffect, useRef } from "react";

const BackgroundAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      const dots: { x: number; y: number; vx: number; vy: number }[] = [];
      const numDots = 50;
      const maxDistance = 150;
  
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
        });
      }
  
      let mouseX = 0;
      let mouseY = 0;
  
      canvas.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
  
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        dots.forEach((dot) => {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < 100) {
            dot.x += (dx / distance) * 2;
            dot.y += (dy / distance) * 2;
          }
  
          dot.x += dot.vx;
          dot.y += dot.vy;
  
          if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
  
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(191, 219, 254, 0.5)";
          ctx.fill();
        });
  
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
  
            if (distance < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(dots[i].x, dots[i].y);
              ctx.lineTo(dots[j].x, dots[j].y);
              ctx.strokeStyle = `rgba(59, 130, 246, ${
                1 - distance / maxDistance
              })`;
              ctx.stroke();
            }
          }
        }
  
        requestAnimationFrame(animate);
      };
  
      animate();
  
      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }, []);
  
    return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
  };
  export default BackgroundAnimation;