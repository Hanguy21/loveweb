"use client";

import { useEffect, useRef } from "react";

const N = 200;       // số hạt cố định
const SCALE = 10;    // kích thước trái tim lớn (±160px width)

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tOffset: number; // vị trí trên đường cong trái tim (0..2π)
  size: number;
  hue: number;
}

interface HeartCanvasProps {
  paused?: boolean;
}

export default function HeartCanvas({ paused = false }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const animFrameRef = useRef<number>(0);

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

    // Khởi tạo N hạt phân tán ngẫu nhiên toàn màn hình
    const particles: Particle[] = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      tOffset: (i / N) * Math.PI * 2,
      size: Math.random() * 3 + 2.5,
      hue: Math.random() * 20 + 340,
    }));

    const mouse = { x: -9999, y: -9999, active: false };
    let attraction = 0;   // 0 = lơ lửng tự do, 1 = hoàn toàn tụ thành tim
    let globalAngle = 0;  // góc xoay toàn cụm — tạo hiệu ứng quay

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    function drawHeart(
      x: number, y: number, size: number,
      alpha: number, hue: number, glow: boolean
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
      ctx.fillStyle = `hsl(${hue}, 100%, 68%)`;
      if (glow) {
        ctx.shadowColor = `hsl(${hue}, 100%, 80%)`;
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.restore();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ramp attraction lên/xuống mượt mà
      const shouldAttract = mouse.active && !pausedRef.current;
      attraction += shouldAttract ? 0.022 : -0.014;
      attraction = Math.max(0, Math.min(1, attraction));

      // Toàn bộ cụm xoay chậm — nhanh hơn khi đã tụ lại
      globalAngle += 0.006 * (0.2 + attraction * 0.8);

      for (const p of particles) {
        if (attraction > 0) {
          // Tính điểm đích trên đường cong trái tim quanh cursor
          const t = p.tOffset + globalAngle;
          const sin3 = Math.pow(Math.sin(t), 3);
          const tx = mouse.x + SCALE * 16 * sin3;
          const ty = mouse.y - SCALE * (
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          );
          // Lực lò xo kéo về đích
          p.vx += (tx - p.x) * 0.055 * attraction;
          p.vy += (ty - p.y) * 0.055 * attraction;
        }

        // Nhiễu ngẫu nhiên khi lơ lửng (giảm dần khi đã tụ)
        const drift = (1 - attraction) * 0.22;
        p.vx += (Math.random() - 0.5) * drift;
        p.vy += (Math.random() - 0.5) * drift;

        // Lực cản
        p.vx *= 0.87;
        p.vy *= 0.87;

        p.x += p.vx;
        p.y += p.vy;

        // Giữ hạt trong màn hình
        if (p.x < -30) p.vx += 1;
        if (p.x > canvas.width + 30) p.vx -= 1;
        if (p.y < -30) p.vy += 1;
        if (p.y > canvas.height + 30) p.vy -= 1;

        const alpha = 0.3 + attraction * 0.6;
        const size = p.size * (0.75 + attraction * 0.6);
        drawHeart(p.x, p.y, size, alpha, p.hue, attraction > 0.4);
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
