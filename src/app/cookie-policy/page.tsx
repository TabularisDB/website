import CookiePolicy from '@/components/pages/cookies-policy/CookiePolicy';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | Tabularis',
    description: 'Learn how Tabularis uses cookies and how you can control them.',
};

export default function CookiePolicyPage() {
    return <CookiePolicy />;
}
