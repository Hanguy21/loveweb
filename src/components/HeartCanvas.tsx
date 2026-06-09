"use client";

import { useEffect, useRef } from "react";

const N = 120;
const SPRITE_SIZE = 9;       // half-size of sprite canvas
const REPEL_RADIUS = 110;
const REPEL_STRENGTH = 0.9;
const MAX_SPEED = 3.5;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  naturalSpeed: number;
  size: number;
  alpha: number;
  spriteIndex: number;
}

interface HeartCanvasProps {
  paused?: boolean;
}

function buildSprites(): OffscreenCanvas[] {
  const HUES = [340, 347, 352, 357, 362];
  return HUES.map((hue) => {
    const sz = SPRITE_SIZE * 2;
    const oc = new OffscreenCanvas(sz, sz);
    const ox = oc.getContext("2d")!;
    const cx = SPRITE_SIZE;
    const cy = SPRITE_SIZE;
    const s = SPRITE_SIZE * 0.85;
    ox.beginPath();
    ox.moveTo(cx, cy + s * 0.4);
    ox.bezierCurveTo(cx - s * 0.1, cy - s * 0.1, cx - s, cy - s * 0.1, cx - s, cy + s * 0.4);
    ox.bezierCurveTo(cx - s, cy + s * 1.0, cx, cy + s * 1.4, cx, cy + s * 1.6);
    ox.bezierCurveTo(cx, cy + s * 1.4, cx + s, cy + s * 1.0, cx + s, cy + s * 0.4);
    ox.bezierCurveTo(cx + s, cy - s * 0.1, cx + s * 0.1, cy - s * 0.1, cx, cy + s * 0.4);
    ox.closePath();
    ox.fillStyle = `hsl(${hue}, 100%, 68%)`;
    ox.fill();
    return oc;
  });
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

    // Check OffscreenCanvas support
    if (typeof OffscreenCanvas === "undefined") return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const sprites = buildSprites();

    // Khởi tạo particles phân bổ đều theo grid + jitter
    const cols = Math.ceil(Math.sqrt(N * (window.innerWidth / window.innerHeight)));
    const rows = Math.ceil(N / cols);
    const particles: Particle[] = Array.from({ length: N }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const naturalSpeed = 0.15 + Math.random() * 0.30;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: (col / cols) * window.innerWidth + (Math.random() - 0.5) * (window.innerWidth / cols),
        y: (row / rows) * window.innerHeight + (Math.random() - 0.5) * (window.innerHeight / rows),
        vx: Math.cos(angle) * naturalSpeed,
        vy: Math.sin(angle) * naturalSpeed,
        naturalSpeed,
        size: Math.random() * 4 + 4,
        alpha: Math.random() * 0.30 + 0.45,
        spriteIndex: Math.floor(Math.random() * 5),
      };
    });

    const mouse = { x: -9999, y: -9999, active: false };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // --- Physics ---

        // 1. Repulsion từ chuột (chỉ khi không paused)
        if (mouse.active && !pausedRef.current) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // 2. Giữ tốc độ gần natural speed (anti-gravity: không tắt dần)
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0) {
          // Nudge nhẹ về natural speed — đủ để không tăng tốc vô hạn
          p.vx += ((p.vx / speed) * p.naturalSpeed - p.vx) * 0.012;
          p.vy += ((p.vy / speed) * p.naturalSpeed - p.vy) * 0.012;
        }

        // 3. Giới hạn tốc độ tối đa (sau repulsion)
        const spd2 = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd2 > MAX_SPEED) {
          p.vx *= MAX_SPEED / spd2;
          p.vy *= MAX_SPEED / spd2;
        }

        // 4. Cập nhật vị trí
        p.x += p.vx;
        p.y += p.vy;

        // 5. Wrap-around edges
        if (p.x < -12) p.x = canvas.width + 12;
        else if (p.x > canvas.width + 12) p.x = -12;
        if (p.y < -12) p.y = canvas.height + 12;
        else if (p.y > canvas.height + 12) p.y = -12;

        // --- Draw ---
        const sprite = sprites[p.spriteIndex];
        const ratio = p.size / SPRITE_SIZE;
        const dw = sprite.width * ratio;
        const dh = sprite.height * ratio;
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprite, p.x - dw / 2, p.y - dh / 2, dw, dh);
      }

      ctx.globalAlpha = 1;
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
