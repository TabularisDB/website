"use client";

import { useState, useRef, Children } from "react";

interface CarouselGridProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function CarouselGrid({ children, className = "", itemClassName = "" }: CarouselGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const count = Children.count(children);

  function handleScroll() {
    const el = sliderRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIndex(index);
  }

  function scrollTo(index: number) {
    const clamped = Math.max(0, Math.min(count - 1, index));
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: el.offsetWidth * clamped, behavior: "smooth" });
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return;
    scrollTo(delta > 0 ? activeIndex + 1 : activeIndex - 1);
  }

  return (
    <>
      <div
        ref={sliderRef}
        className={`carousel-grid ${className}`.trim()}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Children.map(children, (child) => (
          <div className={`carousel-grid-item ${itemClassName}`.trim()}>
            {child}
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === activeIndex ? " active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to item ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
