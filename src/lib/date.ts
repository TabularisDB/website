export function formatDate(iso: string): string {
    const hasTime = iso.includes('T');
    const d = new Date(hasTime ? iso : iso + 'T12:00:00Z');
    const dateStr = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
    if (hasTime) {
        return `${dateStr}, ${iso.slice(11, 16)}`;
    }
    return dateStr;
}
