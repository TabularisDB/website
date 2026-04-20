import { APP_VERSION } from "@/lib/version";

export type Platform = "windows" | "macos" | "linux";

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
  command: string;
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
        command: "brew install --cask tabularis",
      },
      {
        kind: "file",
        label: "Apple Silicon",
        desc: "M1 / M2 / M3 / M4 (aarch64)",
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

export const ALL_PLATFORMS: Platform[] = ["windows", "macos", "linux"];
