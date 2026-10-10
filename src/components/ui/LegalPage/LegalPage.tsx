import type {LegalPageData} from '@/lib/legal';
import styles from './LegalPage.module.scss';

export function LegalPage({page}: {page: LegalPageData}) {
    return (
        <div className="container">
            <article className={styles.article}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{page.title}</h1>
                    <p className={styles.updated}>Last updated: {page.updated}</p>
                </header>
                <div className={styles.content} dangerouslySetInnerHTML={{__html: page.html}} />
            </article>
        </div>
    );
}
