import {getAllVideoDemos} from '@/lib/videos';
import {ArrowRightIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './VideosGrid.module.scss';

export function VideosGrid() {
    const videos = getAllVideoDemos();

    return (
        <div className={styles.grid}>
            {videos.map((video) => (
                <Link key={video.slug} href={`/demos/${video.slug}`} className={styles.card}>
                    <div className={styles.coverWrapper}>
                        <Image
                            src={`/og/demos/${video.slug}.png`}
                            alt=""
                            width={1200}
                            height={630}
                            className={styles.cover}
                        />
                    </div>

                    <div className={styles.infos}>
                        <h3 className={styles.title}>{video.title}</h3>
                        <p className={styles.description}>{video.description}</p>
                        <span className={styles.link}>
                            Watch demo <ArrowRightIcon aria-hidden="true" />
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
