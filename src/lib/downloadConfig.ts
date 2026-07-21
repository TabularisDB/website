import { APP_VERSION } from "@/lib/version";
import { NIGHTLY_RELEASE } from "@/lib/nightly";

export type Platform = "windows" | "macos" | "linux";
export type ReleaseChannel = "stable" | "nightly";

export type FileOption = {
  kind: "file";
  label: string;
  desc: string;
  ext: string;
  url: string;
};
export type CommandOption = {
  kind: "command";
  label: string;
  desc: string;
  command: string | string[];
};
export type DownloadOption = FileOption | CommandOption;
export type DownloadNote = { text: string; command?: string };

export interface PlatformConfig {
  label: string;
  options: DownloadOption[];
  note?: DownloadNote;
}

const BASE = `https://github.com/TabularisDB/tabularis/releases/download/v${APP_VERSION}`;

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  windows: {
    label: "Windows",
    options: [
      {
        kind: "command",
        label: "WinGet",
        desc: "Recommended — installs and auto-updates",
        command: "winget install Debba.Tabularis",
      },
      {
        kind: "file",
        label: "Installer",
        desc: "Direct download",
        ext: ".exe",
        url: `${BASE}/tabularis_${APP_VERSION}_x64-setup.exe`,
      },
      {
        kind: "file",
        label: "MSI Package",
        desc: "Enterprise / group policy deployment",
        ext: ".msi",
        url: `${BASE}/tabularis_${APP_VERSION}_x64_en-US.msi`,
      },
      {
        kind: "file",
        label: "Portable",
        desc: "No installation required — run anywhere",
        ext: ".zip",
        url: `${BASE}/tabularis_${APP_VERSION}_x64-portable.exe`,
      },
    ],
  },
  macos: {
    label: "macOS",
    options: [
      {
        kind: "command",
        label: "Homebrew",
        desc: "Recommended — installs and auto-updates",
        command: [
          "brew tap TabularisDB/tabularis",
          "brew install --cask tabularis",
        ],
      },
      {
        kind: "file",
        label: "Apple Silicon",
        desc: "M1 / M2 / M3 / M4 / M5 (aarch64)",
        ext: ".dmg",
        url: `${BASE}/tabularis_${APP_VERSION}_aarch64.dmg`,
      },
      {
        kind: "file",
        label: "Intel",
        desc: "x86_64",
        ext: ".dmg",
        url: `${BASE}/tabularis_${APP_VERSION}_x64.dmg`,
      },
    ],
    note: {
      text: "If macOS blocks the app after a direct download, run:",
      command: "xattr -c /Applications/tabularis.app",
    },
  },
  linux: {
    label: "Linux",
    options: [
      {
        kind: "command",
        label: "Snap",
        desc: "Ubuntu, Debian and Snap-enabled distros",
        command: "snap install tabularis",
      },
      {
        kind: "command",
        label: "Flatpak",
        desc: "Most Linux distributions",
        command: [
          "flatpak remote-add --if-not-exists flatpark https://dl.flatpark.org/flatpark.flatpakrepo",
          "flatpak install flatpark dev.tabularis.Tabularis",
        ],
      },
      {
        kind: "command",
        label: "AUR",
        desc: "Arch Linux / Manjaro",
        command: "yay -S tabularis-bin",
      },
      {
        kind: "file",
        label: "AppImage",
        desc: "Universal — no installation needed",
        ext: ".AppImage",
        url: `${BASE}/tabularis_${APP_VERSION}_amd64.AppImage`,
      },
      {
        kind: "file",
        label: "Debian / Ubuntu",
        desc: "apt-based distros",
        ext: ".deb",
        url: `${BASE}/tabularis_${APP_VERSION}_amd64.deb`,
      },
      {
        kind: "file",
        label: "Fedora / RHEL",
        desc: "rpm-based distros",
        ext: ".rpm",
        url: `${BASE}/tabularis-${APP_VERSION}-1.x86_64.rpm`,
      },
    ],
  },
};

function nightlyFile(
  label: string,
  desc: string,
  ext: string,
  matches: (name: string) => boolean,
): FileOption | null {
  const asset = NIGHTLY_RELEASE.assets.find((candidate) => matches(candidate.name));
  return asset ? { kind: "file", label, desc, ext, url: asset.url } : null;
}

function available(options: Array<FileOption | null>): DownloadOption[] {
  return options.filter((option): option is FileOption => option !== null);
}

export const NIGHTLY_PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  windows: {
    label: "Windows",
    options: available([
      nightlyFile("Installer", "Direct nightly download", ".exe", (name) =>
        name.endsWith("_x64-setup.exe"),
      ),
      nightlyFile("MSI Package", "Enterprise / group policy deployment", ".msi", (name) =>
        name.endsWith("_x64_en-US.msi"),
      ),
      nightlyFile("Portable", "No installation required — run anywhere", ".exe", (name) =>
        name.endsWith("_x64-portable.exe"),
      ),
    ]),
  },
  macos: {
    label: "macOS",
    options: available([
      nightlyFile("Apple Silicon", "M1 / M2 / M3 / M4 / M5 (aarch64)", ".dmg", (name) =>
        name.endsWith("_aarch64.dmg"),
      ),
      nightlyFile("Intel", "x86_64", ".dmg", (name) => name.endsWith("_x64.dmg")),
    ]),
    note: {
      text: "If macOS blocks the app after a direct download, run:",
      command: "xattr -c /Applications/tabularis.app",
    },
  },
  linux: {
    label: "Linux",
    options: available([
      nightlyFile("AppImage", "Universal — no installation needed", ".AppImage", (name) =>
        name.endsWith("_amd64.AppImage"),
      ),
      nightlyFile("Debian / Ubuntu", "apt-based distros", ".deb", (name) =>
        name.endsWith("_amd64.deb"),
      ),
      nightlyFile("Fedora / RHEL", "rpm-based distros", ".rpm", (name) =>
        name.endsWith(".x86_64.rpm"),
      ),
    ]),
  },
};

export function getPlatformConfig(
  platform: Platform,
  channel: ReleaseChannel,
): PlatformConfig {
  return channel === "nightly"
    ? NIGHTLY_PLATFORM_CONFIG[platform]
    : PLATFORM_CONFIG[platform];
}

export const ALL_PLATFORMS: Platform[] = ["windows", "macos", "linux"];
