"use client";

import { useEffect, useState, useCallback } from "react";

export function PostContentLightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    const article = document.querySelector("article.post-content");
    if (!article) return;

    const handleClick = (e: Event) => {
      const img = e.target as HTMLElement;
      if (img.tagName !== "IMG") return;
      const imgEl = img as HTMLImageElement;
      if (imgEl.closest(".post-author")) return;
      setSrc(imgEl.src);
      setAlt(imgEl.alt || "");
    };

    article.addEventListener("click", handleClick);
    return () => article.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!src) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [src, close]);

  useEffect(() => {
    const article = document.querySelector("article.post-content");
    if (!article) return;
    article.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      if (!img.closest(".post-author")) {
        img.style.cursor = "zoom-in";
      }
    });
  }, []);

  if (!src) return null;

  return (
    <div className="lightbox-overlay active" onClick={close}>
      <img
        src={src}
        alt={alt}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      <button className="lightbox-close" onClick={close}>
        &times;
      </button>
    </div>
  );
}
