import type { ReactNode } from "react";
import { DownloadButtons } from "@/components/DownloadButtons";
import { GithubStarsButton } from "@/components/GithubStarsButton";
import { getRepoStars, getTotalDownloads } from "@/lib/github";

interface ClosingCtaProps {
  title?: string;
  lede?: string;
  /** Secondary links (Discord, docs, share, …) rendered under the download row. */
  children?: ReactNode;
}

export async function ClosingCta({
  title = "Ready to try Tabularis?",
  lede = "Free and open source (Apache 2.0). Download it for Windows, macOS, or Linux — and if it looks useful, a star on GitHub helps more developers discover it.",
  children,
}: ClosingCtaProps) {
  const [stars, downloads] = await Promise.all([
    getRepoStars(),
    getTotalDownloads(),
  ]);
  return (
    <section className="section closing-cta">
      <div className="closing-cta__card">
        <h2 className="closing-cta__title">{title}</h2>
        <p className="closing-cta__lede">{lede}</p>
        <DownloadButtons
          showInstallLink
          downloads={downloads}
          trailing={<GithubStarsButton stars={stars} />}
        />
        {children && (
          <div className="cta-links closing-cta__secondary">{children}</div>
        )}
      </div>
    </section>
  );
}
