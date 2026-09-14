import {Button} from '@/components/ui/Button/Button';
import type {VideoDemo} from '@/lib/videos/index';
import clsx from 'clsx';
import {FeatureVideoPreview} from '../FeatureVideoPreview/FeatureVideoPreview';
import type {Feature} from '../Features.data';
import styles from './FeatureBlock.module.scss';
import {ArrowRight} from 'lucide-react';

interface FeatureBlockProps {
    feature: Feature;
    video: VideoDemo | null;
    reversed: boolean;
}

export function FeatureBlock({feature, video, reversed}: FeatureBlockProps) {
    return (
        <div className={clsx(styles.block, reversed && styles.reversed)}>
            <div className={styles.visualCol}>
                {video && <FeatureVideoPreview poster={video.poster} src={video.src} />}
            </div>
            <div className={styles.textCol}>
                <span className={styles.eyebrow}>
                    {feature.icon}
                    {feature.eyebrow}
                </span>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
                <Button href={feature.href} className={styles.learnMore} size="sm">
                    Learn more <ArrowRight />
                </Button>
            </div>
        </div>
    );
}
