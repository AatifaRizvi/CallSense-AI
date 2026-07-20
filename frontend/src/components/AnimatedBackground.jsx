import React from "react";

function AnimatedBackground({ dark = true }) {
  const gridLine = dark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.06)";

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.15); }
        }
        @keyframes grid-fade {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.15; }
        }
        .blob-1 { animation: float-slow 18s ease-in-out infinite; }
        .blob-2 { animation: float-slower 22s ease-in-out infinite; }
        .blob-3 { animation: float-slow 26s ease-in-out infinite reverse; }
        .bg-grid { animation: grid-fade 8s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div
          className="bg-grid absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className={`blob-1 absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-[110px] ${
            dark ? "bg-indigo-600/25" : "bg-indigo-400/25"
          }`}
        />
        <div
          className={`blob-2 absolute top-40 -right-24 w-[480px] h-[480px] rounded-full blur-[120px] ${
            dark ? "bg-purple-600/20" : "bg-purple-400/20"
          }`}
        />
        <div
          className={`blob-3 absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full blur-[100px] ${
            dark ? "bg-indigo-500/15" : "bg-indigo-300/25"
          }`}
        />
      </div>
    </>
  );
}

export default AnimatedBackground;
