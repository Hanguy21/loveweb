"use client";

import { useEffect, useRef } from "react";

interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  fadeSpeed: number;
  size: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
}

interface HeartCanvasProps {
  paused?: boolean;
}

export default function HeartCanvas({ paused = false }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, active: false });
  const lastMouseRef = useRef({ x: -999, y: -999 });
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

      // Tính tốc độ di chuyển chuột → spawn nhiều hơn khi quẹt nhanh
      const dx = x - lastMouseRef.current.x;
      const dy = y - lastMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastMouseRef.current = { x, y };

      mouseRef.current = { x, y, active: true };
      if (pausedRef.current) return;

      const count = Math.min(Math.floor(speed * 0.4) + 1, 6);
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          alpha: 0.95,
          fadeSpeed: Math.random() * 0.003 + 0.004,
          size: Math.random() * 6 + 5,
          angle: Math.random() * Math.PI * 2,
          orbitRadius: Math.random() * 25 + 10,
          orbitSpeed: (Math.random() - 0.5) * 0.06,
          color: `hsl(${Math.random() * 20 + 340}, 100%, 70%)`,
        });
      }

      if (heartsRef.current.length > 200) {
        heartsRef.current.splice(0, heartsRef.current.length - 200);
      }
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    function drawHeart(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string
    ) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(x, y);
      ctx.beginPath();
      const s = size / 2;
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s * 0.1, -s * 0.1, -s, -s * 0.1, -s, s * 0.4);
      ctx.bezierCurveTo(-s, s * 1.0, 0, s * 1.4, 0, s * 1.6);
      ctx.bezierCurveTo(0, s * 1.4, s, s * 1.0, s, s * 0.4);
      ctx.bezierCurveTo(s, -s * 0.1, s * 0.1, -s * 0.1, 0, s * 0.4);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      heartsRef.current = heartsRef.current.filter((h) => h.alpha > 0.01);

      for (const h of heartsRef.current) {
        if (mouseRef.current.active) {
          // Vị trí đích: quỹ đạo xoay quanh chuột
          h.angle += h.orbitSpeed;
          const targetX = mouseRef.current.x + Math.cos(h.angle) * h.orbitRadius;
          const targetY = mouseRef.current.y + Math.sin(h.angle) * h.orbitRadius;

          // Lực hút về đích
          h.vx += (targetX - h.x) * 0.022;
          h.vy += (targetY - h.y) * 0.022;
        } else {
          // Bay tự do khi chuột rời màn hình
          h.vx += (Math.random() - 0.5) * 0.1;
          h.vy += (Math.random() - 0.5) * 0.1;
        }

        // Lực cản — giữ hạt không bắn vọt
        h.vx *= 0.85;
        h.vy *= 0.85;

        h.x += h.vx;
        h.y += h.vy;
        h.alpha -= h.fadeSpeed;

        // Scale down theo alpha — teo nhỏ trước khi biến mất
        const displaySize = h.size * Math.max(0, h.alpha);
        drawHeart(ctx, h.x, h.y, displaySize, h.alpha, h.color);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
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
