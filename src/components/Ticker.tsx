import { useEffect, useRef } from "react";

interface TickerProps {
  messages: string[];
}

export function Ticker({ messages }: TickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[#FFD700] py-3 overflow-hidden">
      <div className="relative flex">
        <div 
          ref={tickerRef}
          className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap"
        >
          {[...messages, ...messages, ...messages].map((message, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-6 text-[16px] text-[#0A2647]"
            >
              <span className="mr-2">★</span>
              {message}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
