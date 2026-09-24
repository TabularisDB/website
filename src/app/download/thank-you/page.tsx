import {DownloadThankYou} from '@/components/pages/download/DownloadThankYou/DownloadThankYou';
import type {Metadata} from 'next';
import {Suspense} from 'react';

export const metadata: Metadata = {
    title: 'Your download has started! | Tabularis',
    description:
        'Thank you for downloading Tabularis. Explore our community and resources while your download completes.',
    robots: {index: false, follow: false},
};

export default function DownloadThankYouPage() {
    return (
        <div className="container">
            <Suspense>
                <DownloadThankYou />
            </Suspense>
        </div>
    );
}
