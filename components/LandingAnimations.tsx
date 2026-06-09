"use client";

import { useEffect } from "react";

/**
 * Wires up IntersectionObserver for scroll-triggered animations.
 * Renders nothing — pure side-effect component.
 */
export default function LandingAnimations() {
  useEffect(() => {
    // Respect prefers-reduced-motion at the JS level too
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => {
              el.classList.add("is-visible");
            }, parseInt(delay, 10));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    const mockupObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mockup-active");
            mockupObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll("[data-animate], [data-animate-sm]").forEach((el) => {
      observer.observe(el);
    });

    document.querySelectorAll("[data-mockup]").forEach((el) => {
      mockupObserver.observe(el);
    });

    return () => {
      observer.disconnect();
      mockupObserver.disconnect();
    };
  }, []);

  return null;
}
