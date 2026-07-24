import type { ReactNode } from "react";
import { DownloadButtons } from "@/components/DownloadButtons";
import { GithubStarsButton } from "@/components/GithubStarsButton";
import { HeroVideoPreview } from "@/components/HeroVideoPreview";
import { getRepoStars, getTotalDownloads } from "@/lib/github";

interface ClosingCtaProps {
  title?: string;
  lede?: string;
  showVideo?: boolean;
  /** Secondary links (Discord, docs, share, …) rendered under the download row. */
  children?: ReactNode;
}

export async function ClosingCta({
  title = "Ready to try Tabularis?",
  lede = "Free and open source (Apache 2.0). Download it for Windows, macOS, or Linux — and if it looks useful, a star on GitHub helps more developers discover it.",
  showVideo = false,
  children,
}: ClosingCtaProps) {
  const [stars, downloads] = await Promise.all([
    getRepoStars(),
    getTotalDownloads(),
  ]);
  return (
    <section className="section closing-cta">
      <div
        className={`closing-cta__card${showVideo ? " closing-cta__card--with-video" : ""}`}
      >
        <div
          className={`closing-cta__main${showVideo ? " closing-cta__main--with-video" : ""}`}
        >
          <div className="closing-cta__copy">
            <h2 className="closing-cta__title">{title}</h2>
            <p className="closing-cta__lede">{lede}</p>
            <DownloadButtons
              showInstallLink
              downloads={downloads}
              trailing={<GithubStarsButton stars={stars} />}
            />
          </div>
          {showVideo && (
            <div className="closing-cta__video">
              <HeroVideoPreview
                src="/videos/overview.mp4"
                poster="/videos/overview-hero.webp"
                posterSmall="/videos/overview-hero-800.webp"
                analyticsCategory="closing-cta-video"
                sizes="(max-width: 860px) calc(100vw - 5rem), 400px"
                eager={false}
              />
            </div>
          )}
        </div>
        {children && (
          <div className="cta-links closing-cta__secondary">{children}</div>
        )}
      </div>
    </section>
  );
}
