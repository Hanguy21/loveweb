"use client";

const cloudShapes = [
  "M10,40 Q20,10 40,20 Q50,0 70,15 Q90,0 100,20 Q120,10 130,30 Q140,50 110,50 Q90,70 60,55 Q30,70 10,50 Z",
  "M5,35 Q15,5 35,15 Q55,-5 75,10 Q95,0 110,20 Q125,35 100,45 Q80,65 55,50 Q25,65 5,45 Z",
  "M15,30 Q25,5 50,15 Q65,-5 85,10 Q105,5 115,25 Q125,45 95,45 Q75,60 50,45 Q20,60 15,40 Z",
];

const clouds = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  shape: cloudShapes[i % cloudShapes.length],
  width: 120 + Math.floor(i * 17 + 40) % 130,
  top: (i * 11 + 5) % 55,
  initialLeft: (i * 15) % 110 - 10,
  duration: 35 + (i * 7) % 40,
  delay: -(i * 5) % 30,
  opacity: 0.55 + (i % 4) * 0.12,
}));

export default function Clouds() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute"
          style={{
            top: `${cloud.top}%`,
            left: `${cloud.initialLeft}%`,
            width: cloud.width,
            opacity: cloud.opacity,
            animation: `cloudFloat ${cloud.duration}s linear ${cloud.delay}s infinite`,
          }}
        >
          <svg viewBox="0 0 140 70" width="100%" xmlns="http://www.w3.org/2000/svg">
            <path d={cloud.shape} fill="white" />
          </svg>
        </div>
      ))}
    </div>
  );
}
