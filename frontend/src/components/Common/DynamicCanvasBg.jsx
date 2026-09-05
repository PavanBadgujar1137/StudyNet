import React, { useEffect, useRef } from "react";

const DynamicCanvasBg = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Color palette for glowing particles
    const colors = [
      "rgba(37, 99, 235, ",   // Royal blue
      "rgba(124, 58, 237, ",  // Violet
      "rgba(96, 165, 250, ",  // Sky blue
      "rgba(236, 72, 153, ",  // Pink accent
    ];

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 3 + 1.5;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.25;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }

      update() {
        // Smooth mouse position easing
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Position update
        this.x += this.vx;
        this.y += this.vy;

        // Pulse size
        this.pulseAngle += this.pulseSpeed;
        const currentRadius = this.radius + Math.sin(this.pulseAngle) * 0.8;

        // Boundary rebound
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction: push/pull effect
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }

        return currentRadius;
      }

      draw(currentRadius) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase}${this.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `${this.colorBase}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Initialize particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Ambient floating glow orbs
    const ambientOrbs = [
      { x: width * 0.2, y: height * 0.2, r: 280, color: "rgba(37, 99, 235, 0.08)", vx: 0.2, vy: 0.15 },
      { x: width * 0.8, y: height * 0.6, r: 320, color: "rgba(124, 58, 237, 0.07)", vx: -0.15, vy: -0.2 },
      { x: width * 0.5, y: height * 0.85, r: 240, color: "rgba(96, 165, 250, 0.08)", vx: 0.1, vy: -0.1 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render ambient background glow orbs
      ambientOrbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const radialGradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.r
        );
        radialGradient.addColorStop(0, orb.color);
        radialGradient.addColorStop(1, "rgba(243, 244, 246, 0)");

        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render mouse interactive glow halo
      const mouseGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        220
      );
      mouseGradient.addColorStop(0, "rgba(96, 165, 250, 0.12)");
      mouseGradient.addColorStop(0.5, "rgba(124, 58, 237, 0.05)");
      mouseGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = mouseGradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles & connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const rad = p1.update();
        p1.draw(rad);

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - distance / 130) * 0.18;
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: 0.9 }}
    />
  );
};

export default DynamicCanvasBg;
