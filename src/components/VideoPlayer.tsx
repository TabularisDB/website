"use client";

import { useEffect, useRef, useState } from "react";
import { applyIntrinsicAspectRatio } from "@/lib/videoLoader";
import { VideoLoaderOverlay, VideoErrorOverlay } from "@/components/VideoOverlays";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  wrapperClassName?: string;
  videoClassName?: string;
  ariaLabel?: string;
}

type VideoStatus = "loading" | "ready" | "error";

export function VideoPlayer({
  src,
  poster,
  wrapperClassName = "video-wrapper",
  videoClassName,
  ariaLabel,
}: VideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<VideoStatus>("loading");
  const [inView, setInView] = useState(false);
  const resolvedPoster =
    poster ?? (src.endsWith(".mp4") ? src.replace(/\.mp4$/, ".jpg") : undefined);

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  // Defer fetching the (multi-MB) video until the player is near the
  // viewport, so it doesn't compete with above-the-fold resources.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const markReady = () => setStatus("ready");
  const markError = () => setStatus("error");
  const handleRetry = () => {
    setStatus("loading");
    videoRef.current?.load();
  };

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {status === "loading" && <VideoLoaderOverlay />}
      {status === "error" && <VideoErrorOverlay onRetry={handleRetry} />}
      <video
        ref={videoRef}
        src={inView ? src : undefined}
        poster={resolvedPoster}
        preload="none"
        controls
        muted
        playsInline
        loop
        autoPlay
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        className={videoClassName}
        aria-label={ariaLabel}
        onLoadedMetadata={(e) => {
          if (wrapperRef.current) {
            applyIntrinsicAspectRatio(wrapperRef.current, e.currentTarget);
          }
        }}
        onCanPlay={markReady}
        onPlaying={markReady}
        onLoadedData={markReady}
        onTimeUpdate={markReady}
        onError={markError}
      />
    </div>
  );
}
