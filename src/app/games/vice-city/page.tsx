import type {Metadata} from 'next';
import {getViceCityGameDocument} from '@/lib/games/viceCity';

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
                height="309"
                sandbox="allow-scripts"
                style={{display: 'block', border: 0, borderRadius: 10}}
            />
        </section>
    );
}
