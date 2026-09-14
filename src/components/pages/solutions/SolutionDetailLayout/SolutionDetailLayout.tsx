import {WikiContent} from '@/components/pages/wiki/WikiContent/WikiContent';
import styles from './SolutionDetailLayout.module.scss';
import {SeoMeta} from '@/lib/seo/seoPages';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';

interface SolutionDetailLayoutProps {
    pageInfos: {
        meta: SeoMeta;
        html: string;
    };
}

export function SolutionDetailLayout({pageInfos}: SolutionDetailLayoutProps) {
    return (
        <article className={styles.wrapper}>
            <Breadcrumbs crumbs={[{label: 'Solutions', href: '/solutions'}, {label: pageInfos.meta.title}]} />
            <WikiContent html={pageInfos.html} />
        </article>
    );
}
