import clsx from 'clsx';
import styles from './Diagram.module.scss';
import {AI_AGENTS, NATIVE_DATABASES, PLUGIN_DATABASES} from './Diagram.data';

export function Diagram() {
    return (
        <div className={styles.diagram}>
            <div className={styles.sources}>
                <div className={styles.sourcesList}>
                    <div className={styles.source}>
                        <span className={styles.blockTitle}>Human use</span>
                        <div className={styles.stackList}>
                            <div className={styles.stackItem}>Native UI</div>
                        </div>
                    </div>
                    <div className={styles.source}>
                        <span className={styles.blockTitle}>MCP / AI agents</span>
                        <div className={styles.stackList}>
                            {AI_AGENTS.map((item) => (
                                <div key={item.label} className={styles.stackItem}>
                                    {item.icon}
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Connecteurs desktop, cachés en dessous de 768px */}
            <svg
                className={clsx(styles.line, styles.desktopOnly)}
                width="19"
                height="254"
                viewBox="0 0 19 254"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M0 0.5H10C14.4183 0.5 18 4.08172 18 8.5V127.5" stroke="currentColor" pathLength="1"></path>
                <path
                    d="M0 253.5H10C14.4183 253.5 18 249.918 18 245.5V126.5"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
            </svg>
            <svg
                className={clsx(styles.line, styles.desktopOnly)}
                height="1"
                viewBox="0 0 256 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path d="M0 0.5H256" stroke="currentColor" pathLength="1"></path>
            </svg>

            {/* Connecteur mobile : sources (2 branches) → hub */}
            <svg
                className={clsx(styles.line, styles.mobileOnly)}
                width="151"
                height="50"
                viewBox="0 0 151 50"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M150.5 0L150.5 10C150.5 14.4183 146.918 18 142.5 18L75.5 18"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
                <path
                    d="M0.5 0L0.5 10C0.5 14.4183 4.08172 18 8.5 18L75.5 18"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
                <path d="M79.5 18L79.5 50" stroke="currentColor" pathLength="1"></path>
            </svg>

            <div className={styles.hub}>
                <img src={'/img/logo-compact.svg'} alt="" />
                <span>Built-in MCP Server</span>
            </div>

            <svg
                className={clsx(styles.line, styles.desktopOnly)}
                height="1"
                viewBox="0 0 256 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path d="M0 0.5H256" stroke="currentColor" pathLength="1"></path>
            </svg>
            <svg
                className={clsx(styles.line, styles.desktopOnly)}
                width="19"
                height="254"
                viewBox="0 0 19 254"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M18.5 0.5H8.5C4.08172 0.5 0.5 4.08172 0.5 8.5V127.5"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
                <path
                    d="M18.5 253.5H8.5C4.08172 253.5 0.5 249.918 0.5 245.5V126.5"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
            </svg>

            <svg
                className={clsx(styles.line, styles.mobileOnly)}
                width="151"
                height="50"
                viewBox="0 0 151 50"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M150.5 50L150.5 40C150.5 35.5817 146.918 32 142.5 32L75.5 32"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
                <path
                    d="M0.5 50L0.5 40C0.5 35.5817 4.08172 32 8.5 32L75.5 32"
                    stroke="currentColor"
                    pathLength="1"
                ></path>
                <path d="M79.5 32L79.5 0" stroke="currentColor" pathLength="1"></path>
            </svg>

            <div className={styles.destinations}>
                <div className={styles.destinationsList}>
                    <div className={styles.destination}>
                        <span className={styles.blockTitle}>Native</span>
                        <div className={styles.stackList}>
                            {NATIVE_DATABASES.map((item) => (
                                <div key={item.label} className={styles.stackItem}>
                                    {item.icon}
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.destination}>
                        <span className={styles.blockTitle}>Via plugins</span>
                        <div className={styles.stackList}>
                            {PLUGIN_DATABASES.map((item) => (
                                <div key={item.label} className={clsx(styles.stackItem, styles.pluginItem)}>
                                    {item.icon}
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
