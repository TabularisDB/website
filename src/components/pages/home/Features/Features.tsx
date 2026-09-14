import {JsonLd} from '@/components/layout/JsonLd';
import {buildVideoObjectJsonLd} from '@/lib/seo';
import {getVideoDemoBySlug} from '@/lib/videos/index';
import clsx from 'clsx';
import {FeatureBlock} from './FeatureBlock/FeatureBlock';
import {FEATURES} from './Features.data';
import styles from './Features.module.scss';

export function Features() {
    const items = FEATURES.map((feature) => ({
        feature,
        video: getVideoDemoBySlug(feature.videoSlug),
    }));

    return (
        <section className={clsx(styles.section, 'section')}>
            <JsonLd
                data={items
                    .filter((item) => item.video)
                    .map((item) =>
                        buildVideoObjectJsonLd({
                            title: item.video!.title,
                            description: item.video!.description,
                            src: item.video!.src,
                            poster: item.video!.poster,
                            uploadDate: item.video!.uploadDate,
                        }),
                    )}
            />

            <header className="section-header">
                <span className="eyebrow">Features</span>
                <h2 className="title">A complete SQL workspace: editor, notebooks, query builder, and more.</h2>
                <p className="description">
                    Everything you need to write, understand, and manage SQL, without leaving the app.
                </p>
            </header>

            <div className={styles.blocks}>
                {items.map((item, i) => (
                    <FeatureBlock
                        key={item.feature.id}
                        feature={item.feature}
                        video={item.video}
                        reversed={i % 2 !== 0}
                    />
                ))}
            </div>
        </section>
    );
}
