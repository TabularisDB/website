import {getAllVideoDemos} from '@/lib/videos';
import styles from './VideosGrid.module.scss';
import {VideoCard} from './VideoCard/VideoCard';

export function VideosGrid() {
    const videos = getAllVideoDemos();

    return (
        <div className={styles.grid}>
            {videos.map((video) => (
                <VideoCard video={video} key={video.slug} />
            ))}
        </div>
    );
}
