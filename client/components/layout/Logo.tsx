import { Triangle } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = "md", className = "", showText = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-amber-500 to-red-600 rounded-full shadow-lg flex items-center justify-center`}>
        <Triangle className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'} text-white`} />
      </div>
      {showText && (
        <div className="ml-2">
          <h1 className={`font-bold text-amber-800 ${textSizeClasses[size]}`}>泰山宫</h1>
          <p className={`text-amber-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            道法通天，慧心相通
          </p>
        </div>
      )}
    </div>
  );
}