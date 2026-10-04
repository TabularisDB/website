import {PlugIcon} from 'lucide-react';
import {PluginArc} from './PluginArc/PluginArc';

export function PluginEcosystem() {
    return (
        <section className="section">
            <header className="section-header">
                <span className="eyebrow">
                    <PlugIcon />
                    Plugin ecosystem
                </span>
                <h1 className="title">An ecosystem that never stops growing.</h1>
                <p className="description">
                    Every driver is a standalone plugin that talks JSON-RPC over stdin/stdout. Write one in any language
                    that speaks it, install it live, no restart needed.
                </p>
            </header>
            <PluginArc />
        </section>
    );
}
