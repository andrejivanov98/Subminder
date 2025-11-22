// src/components/Logo.tsx
interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Container */}
      <div className="h-full aspect-square relative shrink-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            <linearGradient
              id="logoGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              {/* Updated to match Tailwind blue-600 and indigo-600 exactly */}
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="url(#logoGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="160 60"
            transform="rotate(-45 50 50)"
          />

          {/* Inner dot */}
          <circle cx="50" cy="50" r="12" fill="white" />
        </svg>
      </div>

      {/* Text */}
      <span className="font-bold text-xl tracking-tight text-white">
        sub<span className="text-blue-600">minder</span>
      </span>
    </div>
  );
}
