"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * The hero's interactive image card — three independent effects layered on
 * one image, each on its own wrapping element so their transforms never
 * overwrite each other:
 *   1. A slow autonomous "Ken Burns" zoom (pure CSS, always running).
 *   2. A mouse-tracked 3D tilt, following the cursor within the card.
 *   3. A scroll-linked parallax drift as the page scrolls past the hero.
 * Both JS-driven effects mutate refs' styles directly via
 * requestAnimationFrame rather than React state — mousemove/scroll fire far
 * too often to justify a re-render on every event.
 */
export function HeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const parallaxEl = parallaxRef.current;
    const tiltEl = tiltRef.current;
    const glowEl = glowRef.current;
    if (!root || !parallaxEl || !tiltEl || !glowEl) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let frame = 0;

    function handlePointerMove(e: PointerEvent) {
      const rect = root!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rotateY = (px - 0.5) * 14;
        const rotateX = (0.5 - py) * 12;
        tiltEl!.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        glowEl!.style.background = `radial-gradient(380px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.22), transparent 70%)`;
      });
    }

    function handlePointerLeave() {
      tiltEl!.style.transform = "rotateX(0deg) rotateY(0deg)";
      glowEl!.style.background = "transparent";
    }

    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root!.getBoundingClientRect();
        const offset = Math.max(-24, Math.min(24, rect.top * -0.08));
        parallaxEl!.style.transform = `translateY(${offset}px)`;
      });
    }

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-sm [perspective:1200px] sm:max-w-md">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand/20 blur-3xl" />

      <div ref={parallaxRef} className="will-change-transform">
        <div
          ref={tiltRef}
          className="relative aspect-[2/3] overflow-hidden rounded-[2rem] shadow-2xl transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform"
        >
          <div className="absolute inset-0 animate-[hero-zoom_16s_ease-in-out_infinite] motion-reduce:animate-none">
            <Image
              // next/image encodes the src internally — wrapping it in
              // encodeURI() here would double-encode the spaces (%2520
              // instead of %20) and 404.
              src="/UU7 hero image 2.jpg"
              alt="A roulette wheel, playing cards, dice, poker chips, and a slot machine reel showing 777"
              fill
              priority
              sizes="(min-width: 640px) 420px, 90vw"
              className="object-cover"
            />
          </div>
          <div ref={glowRef} className="pointer-events-none absolute inset-0 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
        </div>
      </div>
    </div>
  );
}
