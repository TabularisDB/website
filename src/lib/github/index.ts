export {REPO_STARS, TOTAL_DOWNLOADS} from './stats';

export function formatStars(count: number): string {
    if (count >= 10000) return `${(count / 1000).toFixed(0)}k`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
}

export function formatDownloads(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 10_000) return `${(count / 1000).toFixed(0)}k`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString('en-US');
}
