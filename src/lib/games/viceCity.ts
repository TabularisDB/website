import {readFileSync} from 'node:fs';
import {join} from 'node:path';

export const VICE_CITY_FRAME_HEIGHT = 'clamp(342px, 48vw, 420px)';

const source = join(process.cwd(), 'src', 'lib', 'games', 'vice-city');
const sprite = /url\("\.\/([\w-]+\.(svg|webp))"\)/g;

// Keep the sandbox independent of asset requests and preview authentication cookies.
export function getViceCityGameDocument(): string {
    const html = readFileSync(join(source, 'index.html'), 'utf8');
    const css = readFileSync(join(source, 'drive.css'), 'utf8').replace(sprite, (_match, file, extension) => {
        const mime = extension === 'svg' ? 'image/svg+xml' : 'image/webp';
        const data = readFileSync(join(source, file)).toString('base64');
        return `url("data:${mime};base64,${data}")`;
    });
    const js = readFileSync(join(source, 'drive.js'), 'utf8');
    return html
        .replace('<link rel="stylesheet" href="./drive.css">', () => `<style>${css}</style>`)
        .replace('<script src="./drive.js" defer></script>', '')
        .replace('</body>', () => `<script>${js}</script>\n</body>`);
}
