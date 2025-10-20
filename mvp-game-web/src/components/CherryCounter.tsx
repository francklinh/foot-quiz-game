import { useState } from "react";

type CherryCounterProps = {
  count: number;
  className?: string;
};

export function CherryCounter({ count, className = "" }: CherryCounterProps) {
  return (
    <div className={`flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg ${className}`}>
      <div className="text-2xl animate-bounce-slow">🍒</div>
      <div className="text-white font-bold text-xl">{count}</div>
    </div>
  );
}