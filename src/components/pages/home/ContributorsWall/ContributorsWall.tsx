import clsx from 'clsx';
import {GitPullRequestIcon, UsersIcon} from 'lucide-react';
import Image from 'next/image';
import {Button} from '@/components/ui/Button/Button';
import {REPO_CONTRIBUTORS} from '@/lib/community/contributors';
import {avatarUrl, TEAM_MEMBERS} from '@/lib/community/leaderboard';
import styles from './ContributorsWall.module.scss';

export function ContributorsWall() {
    const team = new Set(TEAM_MEMBERS.map((login) => login.toLowerCase()));
    const contributors = REPO_CONTRIBUTORS.map((contributor) => ({
        ...contributor,
        team: team.has(contributor.login.toLowerCase()),
    })).sort((a, b) => Number(b.team) - Number(a.team));

    return (
        <section className="section">
            <header className="section-header">
                <span className="eyebrow">
                    <UsersIcon />
                    Contributors
                </span>
                <h2 className="title">Built in the open, with the community.</h2>
                <p className="description">
                    Every pull request, plugin and bug report makes Tabularis better. Thank you to everyone who helps
                    build it.
                </p>
            </header>

            <ul className={styles.wall}>
                {contributors.map((contributor) => (
                    <li key={contributor.login}>
                        <a
                            href={`https://github.com/${contributor.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                            title={`@${contributor.login}${contributor.team ? ' · Maintainer' : ''}`}
                            aria-label={`@${contributor.login}${contributor.team ? ', maintainer,' : ''} on GitHub`}
                        >
                            <Image
                                src={avatarUrl(contributor.avatarUrl, 56)}
                                alt=""
                                width={56}
                                height={56}
                                className={clsx(styles.avatar, contributor.team && styles.team)}
                            />
                        </a>
                    </li>
                ))}
            </ul>

            <Button href="/contribute" variant="secondary">
                <GitPullRequestIcon size={16} aria-hidden="true" />
                Start contributing
            </Button>
        </section>
    );
}
