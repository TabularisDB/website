import type {ComponentType} from 'react';
import {GitHubIcon, DiscordIcon, BlueskyIcon, XBrandIcon, MastodonIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';

interface IconProps {
    size?: number;
    className?: string;
}

interface Social {
    label: string;
    href: string;
    Icon: ComponentType<IconProps>;
    rel?: string;
}

export const SOCIAL_LINKS: Social[] = [
    {label: 'GitHub', href: SOCIAL_URLS.github, Icon: GitHubIcon},
    {label: 'Discord', href: SOCIAL_URLS.discord, Icon: DiscordIcon},
    {label: 'Bluesky', href: SOCIAL_URLS.bluesky, Icon: BlueskyIcon},
    {label: 'X', href: SOCIAL_URLS.x, Icon: XBrandIcon},
    {label: 'Mastodon', href: SOCIAL_URLS.mastodon, Icon: MastodonIcon, rel: 'me'},
];

interface SocialLinksProps {
    linkClassName?: string;
    iconSize?: number;
}

export function SocialLinks({linkClassName, iconSize = 18}: SocialLinksProps) {
    return (
        <>
            {SOCIAL_LINKS.map(({label, href, Icon, rel}) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel={`noopener noreferrer${rel ? ` ${rel}` : ''}`}
                    className={linkClassName}
                    aria-label={label}
                >
                    <Icon size={iconSize} />
                </a>
            ))}
        </>
    );
}
