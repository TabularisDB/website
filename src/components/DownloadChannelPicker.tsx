import { APP_VERSION } from "@/lib/version";
import { NIGHTLY_RELEASE } from "@/lib/nightly";
import type { ReleaseChannel } from "@/lib/downloadConfig";

interface DownloadChannelPickerProps {
  channel: ReleaseChannel;
  onChange: (channel: ReleaseChannel) => void;
  compact?: boolean;
}

export function DownloadChannelPicker({
  channel,
  onChange,
  compact = false,
}: DownloadChannelPickerProps) {
  return (
    <div className={`dl-channel${compact ? " dl-channel--compact" : ""}`}>
      <div className="dl-channel-tabs" role="group" aria-label="Release channel">
        <button
          type="button"
          className={`dl-channel-tab${channel === "stable" ? " is-active" : ""}`}
          aria-pressed={channel === "stable"}
          onClick={() => onChange("stable")}
        >
          Stable <span>v{APP_VERSION}</span>
        </button>
        <button
          type="button"
          className={`dl-channel-tab${channel === "nightly" ? " is-active" : ""}`}
          aria-pressed={channel === "nightly"}
          onClick={() => onChange("nightly")}
        >
          Nightly <span>{NIGHTLY_RELEASE.tag.replace("nightly-", "")}</span>
        </button>
      </div>
      {channel === "nightly" && (
        <p className="dl-channel-warning">
          Preview build from the latest successful CI run. It may be unstable and does not auto-update through package managers.
        </p>
      )}
    </div>
  );
}
