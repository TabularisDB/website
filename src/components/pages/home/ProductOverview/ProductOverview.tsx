import {Diagram} from './Diagram/Diagram';
import styles from './ProductOverview.module.scss';

export function ProductOverview() {
    return (
        <section className={(styles.section, 'section')}>
            <header className="section-header">
                <span className="eyebrow">What it is</span>
                <h2 className="title">A SQL client built for a world where agents write queries too.</h2>
                <p className="description">
                    In 2026, a lot of real SQL gets drafted and run by AI agents inside Claude Code, Cursor and Devin,
                    not just typed by a person. Tabularis is the open source desktop client built for that shift.
                </p>
            </header>
            <Diagram />
        </section>
    );
}
