import clsx from 'clsx';
import {PluginArc} from './PluginArc/PluginArc';
import styles from './PluginEcosystem.module.scss';

export function PluginEcosystem() {
    return (
        <section className={clsx(styles.section, 'section')}>
            <header className="section-header">
                <span className="eyebrow">Plugin ecosystem</span>
                <h2 className="title">An ecosystem that never stops growing.</h2>
                <p className="description">
                    Every driver is a standalone plugin that talks JSON-RPC over stdin/stdout. Write one in any language
                    that speaks it, install it live, no restart needed.
                </p>
            </header>
            <PluginArc />
        </section>
    );
}
