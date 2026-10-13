import {getAllVideoDemos} from '@/lib/videos';
import Image from 'next/image';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import styles from './VideosGrid.module.scss';

export function VideosGrid() {
    const videos = getAllVideoDemos();

    return (
        <CardGrid className={styles.grid}>
            {videos.map((video) => (
                <Card key={video.slug}>
                    <Card.Cover>
                        <Image src={`/og/demos/${video.slug}.png`} alt="" width={1200} height={630} />
                    </Card.Cover>
                    <Card.Body>
                        <Card.Content>
                            <Card.Title>{video.title}</Card.Title>
                            <Card.Description>{video.description}</Card.Description>
                        </Card.Content>
                        <Card.Link href={`/demos/${video.slug}`} ariaLabel={`Watch the ${video.title} demo`}>
                            Watch demo
                        </Card.Link>
                    </Card.Body>
                </Card>
            ))}
        </CardGrid>
    );
}
