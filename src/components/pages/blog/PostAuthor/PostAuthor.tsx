import Link from 'next/link';
import {authorAvatarUrl, authorGitHubUrl} from '@/lib/blog/authors';
import type {Author} from '@/lib/blog/authors';
import styles from './PostAuthor.module.scss';

interface PostAuthorProps {
    authors: Author[];
}

export function PostAuthor({authors}: PostAuthorProps) {
    if (!authors || authors.length === 0) return null;

    return (
        <section className={styles.section} aria-label="About the author">
            <h2 className={styles.heading}>Written by</h2>

            {authors.map((author) => (
                <div className={styles.author} key={author.handle}>
                    <img src={authorAvatarUrl(author.github)} alt={author.name} className={styles.avatar} />
                    <div className={styles.info}>
                        <div className={styles.nameRow}>
                            <Link href={`/blog/author/${author.handle}`} className={styles.name}>
                                {author.name}
                            </Link>
                            <a
                                href={authorGitHubUrl(author.github)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.github}
                            >
                                @{author.github}
                            </a>
                        </div>
                        {author.bio && <p className={styles.bio}>{author.bio}</p>}
                    </div>
                </div>
            ))}
        </section>
    );
}
