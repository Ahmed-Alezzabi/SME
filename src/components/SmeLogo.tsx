import React from "react";
// @ts-ignore
import npsmeLogo from "../assets/images/Logo-01.png";

interface SmeLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export default function SmeLogo({ className = "", size = "100%", showText = false }: SmeLogoProps) {
  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={npsmeLogo}
        alt="NPSME Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
      
      {showText && (
        <div className="text-center mt-2 space-y-1">
          <p className="text-[10px] font-bold text-slate-700 leading-none">البرنامج الوطني للمشروعات الصغرى والمتوسطة</p>
          <p className="text-[8px] font-bold text-slate-500 font-sans tracking-tight leading-none">THE NATIONAL PROGRAM FOR SMALL & MEDIUM ENTERPRISES</p>
        </div>
      )}
    </div>
  );
}

