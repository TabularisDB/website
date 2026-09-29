export interface FeaturedOnLogo {
    name: string;
    href: string;
    logo: string;
}

export const FEATURED_ON: FeaturedOnLogo[] = [
    {name: 'Product Hunt', href: 'https://www.producthunt.com', logo: '/img/logos/producthunt.svg'},
    {name: 'G2', href: 'https://www.g2.com', logo: '/img/logos/g2.svg'},
    {name: 'SourceForge', href: 'https://sourceforge.net', logo: '/img/logos/sourceforge.svg'},
    {name: 'DevHunt', href: 'https://devhunt.org', logo: '/img/logos/devhunt.svg'},
    {name: 'DevGlobe', href: 'https://devglobe.co', logo: '/img/logos/devglobe.svg'},
    {name: 'AccurateReviews', href: 'https://accuratereviews.com', logo: '/img/logos/accuratereviews.svg'},
];
