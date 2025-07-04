import React from 'react';
import '@/styles/background-effects.css';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large Gradient Orbs with Enhanced Animation */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl gentle-pulse float-animation"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl gentle-pulse float-animation delay-2s"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl gentle-pulse float-animation delay-4s"></div>

      {/* Additional Smaller Orbs */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-emerald-400/25 to-teal-600/25 rounded-full blur-2xl gentle-pulse"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-full blur-2xl gentle-pulse delay-3s"></div>

      {/* Floating Particles with Enhanced Positioning */}
      <div className="absolute inset-0">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-bounce particle-${i % 4}`}
          ></div>
        ))}
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] slow-rotate"></div>

      {/* Enhanced Animated Lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="rgb(147, 51, 234)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 Q150,50 300,100 T600,100 T900,100"
          stroke="url(#line-gradient-1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M100,200 Q250,150 400,200 T700,200 T1000,200"
          stroke="url(#line-gradient-1)"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse delay-1s"
        />
        <path
          d="M50,300 Q200,250 350,300 T650,300 T950,300"
          stroke="url(#line-gradient-2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse delay-2s"
        />
      </svg>

      {/* Rotating Geometric Shapes */}
      <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-blue-400/20 rotate-45 slow-rotate"></div>
      <div className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-purple-400/20 rounded-full slow-rotate reverse-rotate"></div>
    </div>
  );
};
