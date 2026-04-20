"use client";

import { useState } from "react";
import { SPONSORS, type Sponsor } from "@/lib/sponsors";
import { SponsorCard, SponsorModal } from "@/components/SponsorsSection";

export function SponsorsGrid() {
  const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);

  return (
    <>
      <section className="section">
        <div className="sponsors-grid sponsors-grid--full">
          {SPONSORS.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onLearnMore={() => setActiveSponsor(sponsor)}
            />
          ))}
        </div>
      </section>

      <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />
    </>
  );
}
