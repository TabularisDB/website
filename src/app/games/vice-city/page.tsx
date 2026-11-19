import type {Metadata} from 'next';
import {getViceCityGameDocument, VICE_CITY_FRAME_HEIGHT} from '@/lib/games/viceCity';

export const metadata: Metadata = {
    title: 'Vice City Getaway | Tabularis',
};

export default function ViceCityGamePage() {
    return (
        <section className="container">
            <iframe
                srcDoc={getViceCityGameDocument()}
                title="Play Vice City Getaway"
                width="100%"
                sandbox="allow-scripts"
                style={{display: 'block', height: VICE_CITY_FRAME_HEIGHT, border: 0, borderRadius: 10}}
            />
        </section>
    );
}
