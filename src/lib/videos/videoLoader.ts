export function applyIntrinsicAspectRatio(wrapper: HTMLElement, video: HTMLVideoElement): void {
  const sync = () => {
    if (video.videoWidth && video.videoHeight) {
      wrapper.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  };
  if (video.readyState >= 1) sync();
  else video.addEventListener("loadedmetadata", sync, { once: true });
}

const VIDEO_READY_EVENTS = ["canplay", "playing", "loadeddata"] as const;

export function enhanceWrappedVideo(video: HTMLVideoElement): void {
  const wrapper = video.closest<HTMLElement>(".video-wrapper");
  if (!wrapper || video.dataset.enhanced !== undefined) return;
  video.dataset.enhanced = "";

  applyIntrinsicAspectRatio(wrapper, video);

  const loader = wrapper.querySelector<HTMLElement>(".video-loader");
  const errorEl = wrapper.querySelector<HTMLElement>(".video-error");
  if (!loader) return;

  const showLoader = () => {
    if (!video.error) loader.hidden = false;
  };
  const showReady = () => {
    loader.hidden = true;
    if (errorEl) errorEl.hidden = true;
  };
  const showError = () => {
    loader.hidden = true;
    if (errorEl) errorEl.hidden = false;
  };

  let abort: AbortController | null = null;
  const attachEvents = () => {
    abort?.abort();
    abort = new AbortController();
    const { signal } = abort;

    if (video.readyState >= 3) {
      showReady();
      return;
    }
    for (const evt of VIDEO_READY_EVENTS) {
      video.addEventListener(evt, showReady, { once: true, signal });
    }
    video.addEventListener("error", showError, { once: true, signal });
  };

  attachEvents();

  if (video.dataset.autoplay !== undefined) {
    const startPlayback = () => {
      showLoader();
      video.autoplay = true;
      delete video.dataset.autoplay;
      video.play().catch(() => {
        if (video.error) showError();
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      startPlayback();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            startPlayback();
          }
        },
        { rootMargin: "300px" },
      );
      observer.observe(wrapper);
    }
  } else {
    video.addEventListener("loadstart", showLoader, { once: true });
    if (video.networkState === HTMLMediaElement.NETWORK_LOADING) showLoader();
  }

  const retryBtn = errorEl?.querySelector<HTMLButtonElement>(".video-error-retry");
  retryBtn?.addEventListener("click", () => {
    if (errorEl) errorEl.hidden = true;
    loader.hidden = false;
    attachEvents();
    video.load();
    video.play().catch(() => {
      if (video.error) showError();
    });
  });
}