import {APP_VERSION} from '@/lib/download/version';
import {NIGHTLY_RELEASE} from '@/lib/download/nightly';
import {SOCIAL_URLS} from '@/lib/social';

export type Platform = 'windows' | 'macos' | 'linux';
export type ReleaseChannel = 'stable' | 'nightly';

export type FileOption = {
    kind: 'file';
    label: string;
    desc?: string;
    ext: string;
    url: string;
};
export type OptionWarning = {text: string; linkText: string; href: string};
export type CommandOption = {
    kind: 'command';
    label: string;
    desc?: string;
    command: string | string[];
    warning?: OptionWarning;
    recommended?: boolean;
};
export type DownloadOption = FileOption | CommandOption;
export type DownloadNote = {text: string; command?: string};

export interface PlatformConfig {
    label: string;
    options: DownloadOption[];
    note?: DownloadNote;
}

const BASE = `${SOCIAL_URLS.github}/releases/download/v${APP_VERSION}`;

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
    windows: {
        label: 'Windows',
        options: [
            {
                kind: 'command',
                label: 'WinGet',
                command: 'winget install Debba.Tabularis',
                recommended: true,
            },
            {
                kind: 'file',
                label: 'Installer',
                desc: 'For most users',
                ext: '.exe',
                url: `${BASE}/tabularis_${APP_VERSION}_x64-setup.exe`,
            },
            {
                kind: 'file',
                label: 'MSI Package',
                desc: 'For IT deployment and group policy',
                ext: '.msi',
                url: `${BASE}/tabularis_${APP_VERSION}_x64_en-US.msi`,
            },
            {
                kind: 'file',
                label: 'Portable',
                desc: 'Runs without installing',
                ext: '.exe',
                url: `${BASE}/tabularis_${APP_VERSION}_x64-portable.exe`,
            },
        ],
    },
    macos: {
        label: 'macOS',
        options: [
            {
                kind: 'command',
                label: 'Homebrew',
                command: ['brew install --cask tabularis'],
                recommended: true,
            },
            {
                kind: 'file',
                label: 'Apple Silicon',
                desc: 'M1 and newer',
                ext: '.dmg',
                url: `${BASE}/tabularis_${APP_VERSION}_aarch64.dmg`,
            },
            {
                kind: 'file',
                label: 'Intel',
                desc: 'Older Intel Macs',
                ext: '.dmg',
                url: `${BASE}/tabularis_${APP_VERSION}_x64.dmg`,
            },
        ],
        note: {
            text: 'If macOS blocks the app after a direct download, run:',
            command: 'xattr -c /Applications/tabularis.app',
        },
    },
    linux: {
        label: 'Linux',
        options: [
            {
                kind: 'command',
                label: 'Snap',
                desc: 'Ubuntu and Snap-enabled distros',
                command: 'snap install tabularis',
            },
            {
                kind: 'command',
                label: 'Flatpak',
                desc: 'Any distro with Flatpak',
                command: [
                    'flatpak remote-add --if-not-exists flatpark https://dl.flatpark.org/flatpark.flatpakrepo',
                    'flatpak install flatpark dev.tabularis.Tabularis',
                ],
            },
            {
                kind: 'command',
                label: 'AUR',
                command: 'yay -S tabularis-bin',
            },
            {
                kind: 'file',
                label: 'AppImage',
                desc: 'Any distro, no install',
                ext: '.AppImage',
                url: `${BASE}/tabularis_${APP_VERSION}_amd64.AppImage`,
            },
            {
                kind: 'file',
                label: 'Debian / Ubuntu',
                ext: '.deb',
                url: `${BASE}/tabularis_${APP_VERSION}_amd64.deb`,
            },
            {
                kind: 'file',
                label: 'Fedora / RHEL',
                ext: '.rpm',
                url: `${BASE}/tabularis-${APP_VERSION}-1.x86_64.rpm`,
            },
        ],
    },
};

function nightlyFile(
    label: string,
    desc: string | undefined,
    ext: string,
    matches: (name: string) => boolean,
): FileOption | null {
    const asset = NIGHTLY_RELEASE.assets.find((candidate) => matches(candidate.name));
    return asset ? {kind: 'file', label, desc, ext, url: asset.url} : null;
}

function available(options: Array<DownloadOption | null>): DownloadOption[] {
    return options.filter((option): option is DownloadOption => option !== null);
}

export const NIGHTLY_PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
    windows: {
        label: 'Windows',
        options: available([
            nightlyFile('Installer', 'For most users', '.exe', (name) => name.endsWith('_x64-setup.exe')),
            nightlyFile('MSI Package', 'For IT deployment and group policy', '.msi', (name) =>
                name.endsWith('_x64_en-US.msi'),
            ),
            nightlyFile('Portable', 'Runs without installing', '.exe', (name) =>
                name.endsWith('_x64-portable.exe'),
            ),
        ]),
    },
    macos: {
        label: 'macOS',
        options: available([
            {
                kind: 'command',
                label: 'Homebrew',
                command: ['brew install --cask tabularis@nightly'],
                recommended: true,
            },
            nightlyFile('Apple Silicon', 'M1 and newer', '.dmg', (name) =>
                name.endsWith('_aarch64.dmg'),
            ),
            nightlyFile('Intel', 'Older Intel Macs', '.dmg', (name) => name.endsWith('_x64.dmg')),
        ]),
        note: {
            text: 'If macOS blocks the app after a direct download, run:',
            command: 'xattr -c /Applications/tabularis.app',
        },
    },
    linux: {
        label: 'Linux',
        options: available([
            {
                kind: 'command',
                label: 'AUR',
                command: 'yay -S tabularis-nightly-bin',
            },
            nightlyFile('AppImage', 'Any distro, no install', '.AppImage', (name) =>
                name.endsWith('_amd64.AppImage'),
            ),
            nightlyFile('Debian / Ubuntu', undefined, '.deb', (name) => name.endsWith('_amd64.deb')),
            nightlyFile('Fedora / RHEL', undefined, '.rpm', (name) => name.endsWith('.x86_64.rpm')),
        ]),
    },
};

export function getPlatformConfig(platform: Platform, channel: ReleaseChannel): PlatformConfig {
    return channel === 'nightly' ? NIGHTLY_PLATFORM_CONFIG[platform] : PLATFORM_CONFIG[platform];
}

export const ALL_PLATFORMS: Platform[] = ['windows', 'macos', 'linux'];
