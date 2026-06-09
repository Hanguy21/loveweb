"use client";

import { useEffect, useRef } from "react";

interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  targetX: number;
  targetY: number;
}

interface HeartCanvasProps {
  paused?: boolean;
}

export default function HeartCanvas({ paused = false }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      mouseRef.current = { x, y };
      if (pausedRef.current) return;
      // Spawn 2-3 hearts on move
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 0.5,
          alpha: 0.9,
          size: Math.random() * 10 + 6,
          targetX: x,
          targetY: y,
        });
      }
      // Cap hearts to avoid memory issues
      if (heartsRef.current.length > 150) {
        heartsRef.current.splice(0, heartsRef.current.length - 150);
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const s = size / 2;
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s * 0.1, -s * 0.1, -s, -s * 0.1, -s, s * 0.4);
      ctx.bezierCurveTo(-s, s * 1.0, 0, s * 1.4, 0, s * 1.6);
      ctx.bezierCurveTo(0, s * 1.4, s, s * 1.0, s, s * 0.4);
      ctx.bezierCurveTo(s, -s * 0.1, s * 0.1, -s * 0.1, 0, s * 0.4);
      ctx.closePath();
      ctx.restore();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      heartsRef.current = heartsRef.current.filter((h) => h.alpha > 0.02);
      for (const h of heartsRef.current) {
        // Slight attraction toward last mouse position
        const dx = mouseRef.current.x - h.x;
        const dy = mouseRef.current.y - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          h.vx += (dx / dist) * 0.05;
          h.vy += (dy / dist) * 0.05;
        }
        h.x += h.vx;
        h.y += h.vy;
        h.vy -= 0.03; // Float upward slowly
        h.vx *= 0.98;
        h.vy *= 0.98;
        h.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, h.alpha);
        const gradient = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.size);
        gradient.addColorStop(0, "#ff6b9d");
        gradient.addColorStop(1, "#ff1493");
        ctx.fillStyle = gradient;
        drawHeart(ctx, h.x, h.y, h.size);
        ctx.fill();
        ctx.restore();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ cursor: "default" }}
    />
  );
}
