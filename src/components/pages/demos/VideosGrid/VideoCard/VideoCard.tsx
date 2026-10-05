import Image from 'next/image';
import {VideoDemo} from '@/lib/videos';
import styles from './VideoCard.module.scss';
import Link from 'next/link';

interface VideoCardProps {
    video: VideoDemo;
}

export function VideoCard({video}: VideoCardProps) {
    return (
        <Link href={`/demos/${video.slug}`} className={styles.card}>
            <div className={styles.cover}>
                <Image src={video.poster} alt="" width={1592} height={1080} className={styles.videoCover} />
            </div>
            <div className={styles.infos}>
                <h3 className={styles.title}>{video.title}</h3>
                <p className={styles.description}>{video.description}</p>
            </div>
        </Link>
    );
}
